# 🌐 intervalPoller

一个轻量级、TypeScript 的「时间区间 + 可停止」轮询函数，支持：

- 任意异步请求函数
- 指定时间区间自动启停（`09:00~18:00` 或时间戳）
- 指数退避、最大重试、生命周期钩子

---

---

## 🚀 5 秒上手

```ts
import { IntervalPoller } from "@/utils/poller";

const poll = new IntervalPoller(
  () => fetch("/api/status").then((r) => r.json()),
  {
    interval: 5000, // 5 秒轮询
    timeRange: { start: "09:00", end: "18:00" }, // 只在 9~18 点运行
    onSuccess: (data) => console.log("在线人数:", data.online),
    onError: (e) => console.error("请求失败", e),
  }
);

poll.start(); // 启动
poll.stop(); // 随时停止
```

---

## 📌 API 速览

| 方法              | 说明                             |
| ----------------- | -------------------------------- |
| `start()`         | 启动轮询（未到开始时间会先等待） |
| `pause()`         | 暂停（保留重试计数）             |
| `resume()`        | 继续                             |
| `stop()`          | 永久停止，触发 `onStop`          |
| `setInterval(ms)` | 动态修改间隔                     |

---

## ⚙️ 配置项

```ts
interface PollOptions<T = any> {
  interval?: number; // 轮询间隔（ms）默认 3000
  timeRange?: {
    // 不传则永久轮询
    start: number | Date | string; // 时间戳 / Date / "HH:mm"
    end: number | Date | string;
  };
  maxRetries?: number; // 最大重试，-1 无限，默认 -1
  backoff?: boolean; // 指数退避，默认 true
  backoffBase?: number; // 退避基数 ms，默认 1000
  backoffMax?: number; // 退避上限 ms，默认 30000
  immediate?: boolean; // 立即执行第一次，默认 true
  onSuccess?: (d: T) => void; // 成功回调
  onError?: (e: unknown) => boolean | void; // 返回 true 强制停
  onStart?: () => void;
  onStop?: () => void;
}
```

---

## 🧪 高级示例

### 1. 不同页面复用默认配置

```ts
// poller-config.ts
export const defaultOpts: PollOptions = {
  interval: 5000,
  timeRange: { start: "09:00", end: "18:00" },
  onSuccess: (d) => console.log("✔", d),
  onError: (e) => console.log("✘", e),
};

// poller-factory.ts
export const createPoller = <T>(
  task: PollTask<T>,
  override?: Partial<PollOptions>
) => new IntervalPoller(task, { ...defaultOpts, ...override });

// pageA.ts
createPoller(fetchA).start();
```

### 2. Axios + 退避 + 最大重试

```ts
const poll = new IntervalPoller(
  () => axios.post("/api/heartbeat").then((r) => r.data),
  {
    interval: 3000,
    maxRetries: 10,
    backoff: true,
    onError: (e) => console.log("心跳失败", e.message),
  }
);
poll.start();
```

### 3. 手动销毁（Vue3 示例）

```ts
<!-- OnlineStatus.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { IntervalPoller } from "interval-poller";

const online = ref(0); // 响应式数据
let poller: IntervalPoller | null = null;

onMounted(() => {
  poller = new IntervalPoller(
    async () => {
      const res = await fetch("/api/online");
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return data.count; // 返回给 onSuccess
    },
    {
      interval: 5000,
      timeRange: { start: "09:00", end: "18:00" },
      onSuccess: (count) => (online.value = count),
      onError: (e) => console.warn("轮询失败", e),
    }
  ).start();
});

onUnmounted(() => {
  poller?.stop(); // 组件销毁时停止
  poller = null;
});
</script>

<template>
  <div>当前在线：{{ online }}</div>
</template>
```

---

## 📄 License

MIT
