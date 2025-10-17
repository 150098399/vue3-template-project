// poller-config.ts
import type { PollOptions } from "./intervalPoller";

export const defaultOpts: PollOptions = {
  interval: 6000,
  timeRange: { start: "09:00", end: "15:30" },
  onSuccess: (d) => console.log("✔ 默认成功", d),
  onError: (e) => console.log("✘ 默认失败", e),
};
