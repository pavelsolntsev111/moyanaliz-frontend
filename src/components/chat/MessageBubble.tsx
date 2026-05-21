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

// Tiny HTML renderer: accepts <b>/<i> + plain text, escapes everything else.
// We get HTML directly from the LLM, which means malicious answer is in
// theory possible. Even though our model is constrained to lab discussion,
// belt-and-suspenders: never trust LLM output to be safe HTML.
function renderInlineHtml(input: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  // Tokenize on <b>, </b>, <i>, </i>; everything else is escaped text.
  const tagRe = /<\/?(b|i)>/gi;
  let lastIdx = 0;
  let key = 0;
  const stack: ("b" | "i")[] = [];

  const buffer: { text: string; tags: ("b" | "i")[] }[] = [];

  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(input)) !== null) {
    const text = input.slice(lastIdx, m.index);
    if (text) buffer.push({ text, tags: [...stack] });
    const isClosing = m[0].startsWith("</");
    const tag = m[1].toLowerCase() as "b" | "i";
    if (isClosing) {
      // Pop matching open tag if present; ignore stray closes
      const idx = stack.lastIndexOf(tag);
      if (idx !== -1) stack.splice(idx, 1);
    } else {
      stack.push(tag);
    }
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
