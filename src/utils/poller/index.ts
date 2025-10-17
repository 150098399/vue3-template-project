// poller-factory.ts
import { IntervalPoller } from "./intervalPoller";
import { defaultOpts } from "./pollerConfig";
import type { PollTask, PollOptions } from "./intervalPoller";

export function createPoller<T>(
  task: PollTask<T>,
  override?: Partial<PollOptions>
): IntervalPoller<T> {
  return new IntervalPoller(task, { ...defaultOpts, ...override });
}
