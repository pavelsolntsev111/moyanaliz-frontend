"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Localized placeholder, e.g. "Ваш вопрос…" */
  placeholder?: string;
  /** If true, autofocus on desktop (we don't autofocus mobile to keep the keyboard down). */
  autoFocus?: boolean;
  /** Maximum allowed characters. */
  maxChars?: number;
}

const DEFAULT_MAX = 2000;

/**
 * Sticky bottom input — autosize textarea + send button.
 *
 * Mobile UX:
 *  - flex-row, no position:fixed (avoids iOS keyboard jump)
 *  - bottom safe-area inset (iPhone home-indicator)
 *  - maxHeight on textarea so it doesn't eat the whole screen when typing
 *  - Enter sends (Shift+Enter newline)
 *  - On mobile, no autoFocus — let user tap to bring up keyboard intentionally
 */
export default function MessageInput({
  onSend,
  disabled,
  placeholder = "Спросите про ваш анализ…",
  autoFocus,
  maxChars = DEFAULT_MAX,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autosize: re-measure on every value change
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxHeight = 180; // ~6 lines on mobile
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [value]);

  // Restore draft from sessionStorage on mount (survives MIUI tab kill, refresh)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("chat-draft");
      if (saved) setValue(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Persist draft on every change
  useEffect(() => {
    try {
      if (value) sessionStorage.setItem("chat-draft", value);
      else sessionStorage.removeItem("chat-draft");
    } catch {
      /* ignore */
    }
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    if (trimmed.length > maxChars) return;
    onSend(trimmed);
    setValue("");
    try {
      sessionStorage.removeItem("chat-draft");
    } catch {
      /* ignore */
    }
  };

  const canSend = !disabled && value.trim().length > 0 && value.length <= maxChars;
  const over = value.length > maxChars;
  const showCounter = value.length > maxChars * 0.8;

  return (
    <div
      className="shrink-0 bg-white/95 backdrop-blur border-t border-slate-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-end gap-2 px-3 py-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          rows={1}
          // Prevent iOS Safari zoom-on-focus (font-size must be >=16px)
          className="flex-1 min-h-[40px] resize-none rounded-2xl border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Отправить"
          className="shrink-0 size-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center disabled:opacity-40 transition active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
      {showCounter && (
        <div
          className={`text-xs px-4 pb-2 ${over ? "text-red-600 font-medium" : "text-slate-500"}`}
        >
          {value.length} / {maxChars}
        </div>
      )}
    </div>
  );
}
