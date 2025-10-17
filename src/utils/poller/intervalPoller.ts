export type PollTask<T = any> = () => Promise<T>;

export interface TimeRange {
  /** 开始时间戳（ms）或 Date 或 "HH:mm" 字符串 */
  start: number | Date | string;
  /** 结束时间戳（ms）或 Date 或 "HH:mm" 字符串 */
  end: number | Date | string;
}

export interface PollOptions<T = any> {
  interval?: number; // 轮询间隔，默认 3000
  maxRetries?: number; // 最大重试，-1 无限，默认 -1
  backoff?: boolean; // 指数退避，默认 true
  backoffBase?: number; // 退避基数 ms，默认 1000
  backoffMax?: number; // 退避上限 ms，默认 30000
  immediate?: boolean; // 是否立即执行第一次，默认 true
  timeRange?: TimeRange; // 不传则永久轮询
  onSuccess?: (d: T) => void;
  onError?: (e: unknown) => boolean | void; // 返回 true 强制停
  onStart?: () => void;
  onStop?: () => void;
}

export class IntervalPoller<T = any> {
  private task: PollTask<T>;
  private opts: Required<Omit<PollOptions, "timeRange">> & {
    timeRange?: TimeRange;
  };
  private timer: any = null;
  private retryCount = 0;
  private running = false;
  private abort = false;

  constructor(task: PollTask<T>, options: PollOptions = {}) {
    this.task = task;
    this.opts = {
      interval: 3000,
      maxRetries: -1,
      backoff: true,
      backoffBase: 1000,
      backoffMax: 30000,
      immediate: true,
      onSuccess: () => {},
      onError: () => {},
      onStart: () => {},
      onStop: () => {},
      ...options,
    };
  }

  /* ---------- 公共 API ---------- */
  start(): this {
    if (this.running) return this;
    this.abort = false;
    this.retryCount = 0;
    const { timeRange } = this.opts;
    if (!timeRange) {
      this.launch();
    } else {
      const now = Date.now();
      const startTs = this.parseTime(timeRange.start);
      const endTs = this.parseTime(timeRange.end);
      if (startTs >= endTs) throw new Error("timeRange.start must < end");
      if (now >= endTs) {
        /* 已过期，直接不启动 */
        return this;
      }
      if (now >= startTs) {
        /* 当前正处于区间内 */
        this.launch();
        this.planStopAt(endTs);
      } else {
        /* 还未到开始时间，先等待 */
        this.timer = setTimeout(() => {
          this.clear();
          this.launch();
          this.planStopAt(endTs);
        }, startTs - now);
      }
    }
    return this;
  }

  pause(): this {
    this.running = false;
    this.clear();
    return this;
  }

  resume(): this {
    return this.start();
  }

  stop(): this {
    this.running = false;
    this.abort = true;
    this.clear();
    this.opts.onStop();
    return this;
  }

  setInterval(ms: number): this {
    this.opts.interval = ms;
    return this;
  }

  /* ---------- 私有 ---------- */
  private clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private launch() {
    if (this.abort) return;
    this.running = true;
    this.opts.onStart();
    if (this.opts.immediate) {
      this.tick();
    } else {
      this.schedule(this.opts.interval);
    }
  }

  private planStopAt(endTs: number) {
    const delay = endTs - Date.now();
    if (delay > 0) {
      this.timer = setTimeout(() => this.stop(), delay);
    }
  }

  private schedule(delay: number) {
    this.timer = setTimeout(() => this.tick(), delay);
  }

  private async tick() {
    if (this.abort || !this.running) return;
    try {
      const data = await this.task();
      this.retryCount = 0;
      this.opts.onSuccess(data);
    } catch (err) {
      const shouldStop = this.opts.onError(err);
      if (shouldStop === true) {
        this.stop();
        return;
      }
      this.retryCount++;
      if (this.opts.maxRetries >= 0 && this.retryCount > this.opts.maxRetries) {
        this.stop();
        return;
      }
    }
    let delay = this.opts.interval;
    if (this.opts.backoff && this.retryCount > 0) {
      const expo =
        this.opts.backoffBase * Math.pow(2, this.retryCount - 1) +
        Math.random() * 1000;
      delay = Math.min(expo, this.opts.backoffMax);
    }
    this.schedule(delay);
  }

  private parseTime(input: number | Date | string): number {
    if (typeof input === "number") return input;
    if (input instanceof Date) return input.getTime();
    /* 支持 "HH:mm" 格式，取今天或明天的该时刻 */
    const [h = 0, m = 0] = input.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1); // 已过期则算明天
    return d.getTime();
  }
}
