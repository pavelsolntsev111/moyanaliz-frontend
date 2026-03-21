const YM_ID = 108175626;

export function ymGoal(goal: string) {
  if (typeof window === "undefined") return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (typeof w.ym === "function") {
      w.ym(YM_ID, "reachGoal", goal);
    }
  } catch {}
}
