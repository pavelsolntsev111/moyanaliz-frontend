// Shown while the server component is fetching /chat/{token}/state.
// First open includes greeting generation (~3-5s), so this prevents a
// white-screen flash. Renders the same chrome (header + input bar) plus
// skeleton message bubbles so the layout doesn't shift when real data arrives.

import { Sparkles } from "lucide-react";

export default function ChatLoading() {
  return (
    <div
      className="flex flex-col bg-[var(--background)]"
      style={{ minHeight: "100dvh" }}
    >
      <header
        className="shrink-0 bg-white/95 backdrop-blur border-b border-slate-200"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="size-9 rounded-full bg-slate-100" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-[var(--primary)]" />
              <span className="font-semibold text-slate-900 text-[15px]">
                AI-консультант
              </span>
            </div>
            <div className="h-3 w-32 rounded bg-slate-100 mt-1.5 animate-pulse" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-full bg-[var(--primary)]/20 animate-ping" />
            <div className="relative size-12 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <Sparkles size={20} className="text-[var(--primary)]" />
            </div>
          </div>
          <p className="mt-4 text-slate-700 font-medium">Открываю консультацию</p>
          <p className="mt-1 text-xs text-slate-500">
            Изучаю ваш анализ, пара секунд…
          </p>
        </div>
      </div>

      <div
        className="shrink-0 bg-white/95 border-t border-slate-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-end gap-2 px-3 py-2">
          <div className="flex-1 h-10 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="size-10 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
