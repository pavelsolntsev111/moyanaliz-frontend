/**
 * Ad-attribution capture: when a user lands on the site from a paid ad, the URL
 * carries `utm_*` and/or `yclid` params (Yandex auto-adds yclid; Direct campaigns
 * are configured to also append utm_*). We snapshot these on the FIRST landing
 * for the session and persist for 30 days, so that if the user comes back later
 * to upload, we still know which campaign brought them.
 *
 * Strategy: first-touch. We never overwrite an existing snapshot — the first
 * paid touch wins. Reset only after 30 days or explicit re-attribution from a
 * fresh ad URL with new yclid/utm_campaign.
 */

const STORAGE_KEY = "ma_attribution_v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "yclid",
] as const;

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  yclid?: string;
  referrer?: string;
  landing_url?: string;
  saved_at: number;
};

function readFromUrl(): Partial<Attribution> {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const out: Partial<Attribution> = {};
  for (const f of FIELDS) {
    const v = url.searchParams.get(f);
    if (v) out[f] = v.slice(0, 500);
  }
  return out;
}

function readStored(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    if (!parsed.saved_at || Date.now() - parsed.saved_at > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persist(att: Attribution) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(att));
  } catch {
    // localStorage full / blocked — silent
  }
}

/**
 * Call once on app mount (e.g. in the root layout or main page useEffect).
 * If URL has fresh attribution params and storage is empty/stale OR the
 * incoming yclid/utm_campaign differs, snapshot to localStorage.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const fromUrl = readFromUrl();
  const hasFresh = !!(fromUrl.yclid || fromUrl.utm_campaign || fromUrl.utm_source);
  if (!hasFresh) return;

  const stored = readStored();
  // Only overwrite if no prior snapshot or the new touch is from a different
  // campaign/click — otherwise first-touch wins.
  const sameTouch =
    stored &&
    ((fromUrl.yclid && fromUrl.yclid === stored.yclid) ||
      (fromUrl.utm_campaign && fromUrl.utm_campaign === stored.utm_campaign));
  if (sameTouch) return;

  const snapshot: Attribution = {
    ...fromUrl,
    referrer: document.referrer ? document.referrer.slice(0, 500) : undefined,
    landing_url: window.location.href.slice(0, 500),
    saved_at: Date.now(),
  };
  persist(snapshot);
}

/** Read current attribution snapshot (for piggy-backing onto API calls). */
export function getAttribution(): Attribution | null {
  return readStored();
}
