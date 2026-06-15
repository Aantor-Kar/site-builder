import { waitUntil } from "@vercel/functions";

export function scheduleBackgroundTask(task: Promise<unknown>) {
  if (process.env.VERCEL) {
    waitUntil(task);
    return;
  }

  void task;
}
