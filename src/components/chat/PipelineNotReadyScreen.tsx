"use client";

import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { useEffect, useState } from "react";

interface PipelineNotReadyScreenProps {
  orderId: string;
}

/**
 * Shown when chat opens but processing_status !== "completed".
 *
 * The parent ChatScreen polls /state every 2s; this screen just shows a
 * progress UI and reassuring copy. When parent gets report_ready=true it
 * replaces us with the chat itself.
 *
 * The progress bar is fake (no real progress events from the pipeline) — it
 * fills smoothly to ~95% over ~60s and parks there until completion.
 */
export default function PipelineNotReadyScreen({ orderId }: PipelineNotReadyScreenProps) {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    // Asymptotic fill: each tick moves toward 95% but never reaches it.
    const id = setInterval(() => {
      setProgress((p) => p + Math.max(0.5, (95 - p) * 0.04));
    }, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex flex-col bg-[var(--background)]"
      style={{ minHeight: "100dvh" }}
    >
      <header
        className="shrink-0 bg-white border-b border-slate-200"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Link
            href={`/result/${orderId}`}
            aria-label="Назад к отчёту"
            className="size-9 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>
          <span className="font-semibold text-slate-900">Мой Анализ</span>
        </div>
      </header>

      <main
        className="flex-1 flex flex-col items-center justify-center text-center px-6"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[var(--primary)]/20 animate-ping" />
          <div className="relative size-20 rounded-full bg-[var(--accent)] flex items-center justify-center">
            <FlaskConical size={36} className="text-[var(--primary)]" />
          </div>
        </div>

        <h1 className="mt-6 text-xl font-semibold text-slate-900">
          Готовлю полный анализ
        </h1>
        <p className="mt-2 text-slate-600 max-w-sm text-[15px]">
          Обычно занимает 30–60 секунд. Как только закончу — сразу открою чат и
          смогу отвечать на ваши вопросы.
        </p>

        <div className="w-full max-w-xs mt-8">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${Math.min(progress, 95)}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
