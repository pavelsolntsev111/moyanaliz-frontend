const YM_ID = 108175626;

export function ymGoal(goal: string) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const fire = () => {
    try {
      if (typeof w.ym === "function") w.ym(YM_ID, "reachGoal", goal);
    } catch {}
  };
  if (typeof w.ym === "function") {
    fire();
  } else {
    // YM script not yet loaded — retry once it's ready
    setTimeout(fire, 2000);
  }
}
