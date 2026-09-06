const YM_ID = 108175626;

/**
 * Fire a Yandex.Metrika goal. Optional `params` becomes "цель-параметр"
 * (visible in YM reports under "Параметры визитов") — used here to tag
 * events with A/B test bucket so we can split conversion rates by group.
 */
export function ymGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const fire = () => {
    try {
      if (typeof w.ym === "function") {
        if (params) {
          w.ym(YM_ID, "reachGoal", goal, params);
        } else {
          w.ym(YM_ID, "reachGoal", goal);
        }
      }
    } catch {}
  };
  if (typeof w.ym === "function") {
    fire();
  } else {
    setTimeout(fire, 2000);
  }
}

/**
 * Metrika ClientID — значение куки _ym_uid (это и есть ClientID счётчика).
 * Уходит на бэкенд вместе с /upload: по нему (и по yclid) сервер выгружает
 * офлайн-конверсию «Успешная покупка (оффлайн)», которая не зависит от
 * редиректа в ЮКассу и живости JS-сессии (см. backend metrika_offline.py).
 */
export function getYmClientId(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ym_uid=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}
