"use client";

/**
 * Чат по расшифровке — панель под отчётом.
 *
 * Отчёт и историю шлём с клиента каждым запросом: на сервере ничего не
 * хранится (см. services/posev_chat.py). Пароль лежит в sessionStorage этой
 * вкладки — он приходит вместе с отчётом от страницы загрузки.
 *
 * Счётчик из 10 вопросов здесь — про UX. Настоящий предохранитель серверный:
 * он и лимит ходов проверяет, и частоту по IP.
 */

import { useEffect, useRef, useState } from "react";
import type { PosevReport } from "./report-view";

const MAX_QUESTIONS = 10;
const MAX_CHARS = 400;

const SUGGESTIONS = [
  "Что означает буква R в таблице?",
  "Что такое множественная устойчивость?",
  "Почему у некоторых препаратов стоит I?",
  "О чём спросить врача по этому результату?",
];

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function ReportChat({
  report,
  password,
}: {
  report: PosevReport;
  password: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const asked = messages.filter((m) => m.role === "user").length;
  const left = Math.max(0, MAX_QUESTIONS - asked);
  const canAsk = left > 0 && !busy && value.trim().length > 0;

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy || left <= 0) return;
    setError(null);
    setValue("");
    const history = messages;
    setMessages([...history, { role: "user", content: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/v1/demo/posev/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, question: q, report, history }),
      });
      const raw = await res.text();
      let data: { answer?: string; detail?: string } | null = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (!res.ok || !data?.answer) {
        throw new Error(data?.detail || "Не удалось получить ответ. Попробуйте ещё раз.");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data!.answer! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <section className="pd-noprint border-t border-[#E5E5E8] pt-7">
        <h2 className="pd-display mb-2 text-[18px] font-bold leading-snug">
          Остались вопросы по результату?
        </h2>
        <p className="mb-5 max-w-[68ch] text-[#55555E]">
          Можно задать до {MAX_QUESTIONS} вопросов по этой расшифровке и по теме устойчивости к
          антибиотикам. Ассистент не подбирает препарат и не ставит диагноз.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pd-btn rounded-lg bg-[#7119FF] px-6 py-4 text-[12px] font-bold text-white hover:bg-[#5F12DC]"
        >
          Обсудить отчёт
        </button>
      </section>
    );
  }

  return (
    <section className="pd-noprint border-t border-[#E5E5E8] pt-7">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="pd-display text-[18px] font-bold leading-snug">Вопросы по результату</h2>
        <span className="text-[13px] text-[#8A8A93]">
          {left > 0 ? `осталось вопросов: ${left}` : "лимит вопросов исчерпан"}
        </span>
      </div>

      <div className="rounded-lg border border-[#E5E5E8]">
        <div className="max-h-[420px] space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <p className="text-[14px] text-[#8A8A93]">
              Спросите о чём-то из отчёта — например, что означают буквы в таблице.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block max-w-[85%] rounded-lg px-4 py-2.5 text-left text-[14px] leading-[1.6] ${
                  m.role === "user"
                    ? "bg-[#F3EEFF] text-[#2B1A55]"
                    : "bg-[#F6F6F7] text-[#1A1A1F]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {busy && <p className="text-[14px] text-[#8A8A93]">Думаю…</p>}
          {error && <p className="text-[14px] text-[#8A372C]">{error}</p>}
          <div ref={endRef} />
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 border-t border-[#EFEFF1] px-5 py-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                disabled={busy}
                className="rounded-full border border-[#E5E5E8] px-3.5 py-2 text-[13px] text-[#55555E] transition-colors hover:border-[#7119FF] hover:text-[#1A1A1F] disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(value);
          }}
          className="flex flex-wrap items-end gap-3 border-t border-[#EFEFF1] px-5 py-4"
        >
          <div className="min-w-[240px] flex-1">
            <textarea
              value={value}
              maxLength={MAX_CHARS}
              rows={2}
              disabled={left <= 0}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(value);
                }
              }}
              placeholder={
                left > 0 ? "Ваш вопрос по этому результату" : "Лимит вопросов исчерпан"
              }
              className="w-full resize-none rounded-lg border border-[#E5E5E8] px-4 py-3 text-[14px] outline-none focus:border-[#7119FF] disabled:bg-[#FAFAFB]"
            />
            <div className="mt-1 text-right text-[12px] text-[#B4B1BC]">
              {value.length}/{MAX_CHARS}
            </div>
          </div>
          <button
            type="submit"
            disabled={!canAsk}
            className="pd-btn mb-6 rounded-lg bg-[#7119FF] px-6 py-3.5 text-[12px] font-bold text-white hover:bg-[#5F12DC] disabled:cursor-default disabled:bg-[#E7E3F2] disabled:text-[#A9A5B6]"
          >
            Спросить
          </button>
        </form>
      </div>

      <p className="mt-3 max-w-[68ch] text-[13px] text-[#8A8A93]">
        Ответы носят справочный характер и не являются медицинской рекомендацией. Препарат
        выбирает врач.
      </p>
    </section>
  );
}
