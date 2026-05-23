"use client";

import { useMemo } from "react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  /** When true, render a blinking cursor at the end (streaming in progress). */
  streaming?: boolean;
  /** Emergency-stub responses get a subtle red accent. */
  emergency?: boolean;
}

/**
 * Renders one chat message. User bubbles are turquoise on the right;
 * AI bubbles are off-white on the left.
 *
 * Content from the LLM can contain Telegram-style HTML (<b>, <i>) and
 * dash-prefixed lists. We render <b>/<i> safely via a tiny allowlist (no
 * dangerouslySetInnerHTML with raw HTML — script-tag in answer would be
 * disaster) but preserve the visual hierarchy.
 */
export default function MessageBubble({
  role,
  content,
  streaming,
  emergency,
}: MessageBubbleProps) {
  const isUser = role === "user";

  const rendered = useMemo(() => renderInlineHtml(content), [content]);

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} px-3`}
      data-role={role}
    >
      <div
        className={[
          "max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
          "whitespace-pre-wrap break-words shadow-sm",
          "animate-fade-up",
          isUser
            ? "bg-[var(--primary)] text-white rounded-br-md"
            : emergency
            ? "bg-red-50 text-red-900 border border-red-200 rounded-bl-md"
            : "bg-white text-slate-800 border border-slate-200 rounded-bl-md",
        ].join(" ")}
      >
        {rendered}
        {streaming && (
          <span
            className="inline-block w-[2px] h-[1em] bg-current align-text-bottom ml-[2px] animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

// Tiny HTML renderer: accepts <b>/<i> + plain text. Other tags are stripped
// silently (LLM occasionally emits <p>/<br>/<div> despite the prompt — we
// never want users to see raw tag text). <p>/</p>/<br> become newlines so
// paragraph spacing survives via whitespace-pre-wrap on the bubble.
//
// We get HTML directly from the LLM, which means malicious answer is in
// theory possible. Even though our model is constrained to lab discussion,
// belt-and-suspenders: never trust LLM output to be safe HTML.
function renderInlineHtml(input: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  // Match any HTML-ish tag: <b>, </b>, <p class="…">, <br/>, etc.
  const tagRe = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  let lastIdx = 0;
  let key = 0;
  const stack: ("b" | "i")[] = [];

  const buffer: { text: string; tags: ("b" | "i")[] }[] = [];

  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(input)) !== null) {
    const text = input.slice(lastIdx, m.index);
    if (text) buffer.push({ text, tags: [...stack] });

    const raw = m[0];
    const name = m[1].toLowerCase();
    const isClosing = raw.startsWith("</");

    if (name === "b" || name === "i") {
      if (isClosing) {
        const idx = stack.lastIndexOf(name);
        if (idx !== -1) stack.splice(idx, 1);
      } else {
        stack.push(name);
      }
    } else if (name === "br") {
      buffer.push({ text: "\n", tags: [...stack] });
    } else if (name === "p" && isClosing) {
      // End of paragraph → blank line between paragraphs
      buffer.push({ text: "\n", tags: [...stack] });
    }
    // Opening <p>, <div>, <ul>, <li>, <h1-6>, etc. are silently dropped.

    lastIdx = tagRe.lastIndex;
  }
  if (lastIdx < input.length) {
    buffer.push({ text: input.slice(lastIdx), tags: [...stack] });
  }

  for (const piece of buffer) {
    let node: React.ReactNode = piece.text;
    for (const tag of piece.tags) {
      if (tag === "b") node = <strong key={key++}>{node}</strong>;
      else node = <em key={key++}>{node}</em>;
    }
    result.push(
      <span key={key++}>
        {node}
      </span>
    );
  }
  return result;
}
