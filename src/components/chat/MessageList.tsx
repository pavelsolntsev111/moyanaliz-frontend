"use client";

import { useEffect, useRef, useState } from "react";

import MessageBubble from "./MessageBubble";

import type { ChatMessage } from "@/lib/chat-api";

interface MessageListProps {
  messages: ChatMessage[];
  /** Optimistic streaming bubble being built up right now (assistant role). */
  streaming?: { content: string; emergency?: boolean } | null;
  /** Optional inline element rendered at the bottom (paywall / extension card). */
  footer?: React.ReactNode;
}

/**
 * Scrollable list of messages with smart auto-scroll:
 *   - Scrolls to bottom when a new message arrives AND the user was already
 *     near the bottom (within 80px).
 *   - If user has scrolled up to read, shows a small "↓ New" pill instead of
 *     forcing them back down mid-read.
 */
export default function MessageList({ messages, streaming, footer }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);
  const wasNearBottomRef = useRef(true);

  // Track whether user is near bottom so we can decide to auto-scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      wasNearBottomRef.current = distance < 80;
      if (wasNearBottomRef.current && showJump) setShowJump(false);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [showJump]);

  // Auto-scroll on new messages / stream tick
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (wasNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      setShowJump(true);
    }
  }, [messages.length, streaming?.content]);

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto overscroll-contain py-3 space-y-2.5"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((m, i) => (
          <MessageBubble
            key={`${i}-${m.timestamp ?? ""}`}
            role={m.role}
            content={m.content}
          />
        ))}
        {streaming && (
          <MessageBubble
            role="assistant"
            content={streaming.content}
            streaming
            emergency={streaming.emergency}
          />
        )}
        {footer && <div className="px-3 pt-2">{footer}</div>}
        <div ref={bottomRef} className="h-2" />
      </div>

      {showJump && (
        <button
          type="button"
          className="absolute left-1/2 -translate-x-1/2 bottom-3 px-4 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-medium shadow-lg backdrop-blur"
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowJump(false);
          }}
        >
          ↓ Новое сообщение
        </button>
      )}
    </div>
  );
}
