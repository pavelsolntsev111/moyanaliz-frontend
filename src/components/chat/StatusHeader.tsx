"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

import type { OrderMeta } from "@/lib/chat-api";

interface StatusHeaderProps {
  order: OrderMeta;
  remaining: number | null;
  totalAllowed: number;
  expiresAt: string | null;
  paid: boolean;
}

/**
 * Sticky top bar with:
 *   - Back arrow → returns to /result/{order_id}
 *   - Title "AI-консультант" + small subtitle (customer / analysis date)
 *   - Right-side pill: "5 из 10" or "до 22:30"
 *
 * Compact on mobile (one line + one subtitle), expands on sm:
 */
export default function StatusHeader({
  order,
  remaining,
  totalAllowed,
  expiresAt,
  paid,
}: StatusHeaderProps) {
  const sub = buildSubtitle(order);
  const expiresIn = useRelativeTime(expiresAt);

  return (
    <header
      className="shrink-0 bg-white/95 backdrop-blur border-b border-slate-200 z-10"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Link
          href={`/result/${order.order_id}`}
          aria-label="Назад к отчёту"
          className="shrink-0 -ml-1 size-9 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition"
        >
          <ArrowLeft size={20} className="text-slate-700" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[var(--primary)] shrink-0" />
            <span className="font-semibold text-slate-900 text-[15px] leading-tight">
              AI-консультант
            </span>
          </div>
          {sub && (
            <p className="text-xs text-slate-500 leading-tight mt-0.5 truncate">
              {sub}
            </p>
          )}
        </div>

        {paid && remaining !== null && (
          <div className="shrink-0 flex flex-col items-end">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent)] text-[var(--accent-foreground)]">
              {remaining} из {totalAllowed}
            </span>
            {expiresIn && (
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {expiresIn}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function buildSubtitle(order: OrderMeta): string | null {
  const parts: string[] = [];
  if (order.customer_name) parts.push(order.customer_name);
  const typeLabel = order.analysis_type_labels?.[0];
  if (typeLabel) parts.push(typeLabel);
  if (order.analysis_date) parts.push(formatDate(order.analysis_date));
  if (parts.length === 0 && order.lab_name) parts.push(order.lab_name);
  return parts.length ? parts.join(" · ") : null;
}

function formatDate(raw: string): string {
  // Accepts ISO date or "DD.MM.YYYY" — try to render compact "DD.MM".
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}.${m[2]}`;
  const m2 = raw.match(/^(\d{2})\.(\d{2})/);
  if (m2) return `${m2[1]}.${m2[2]}`;
  return raw;
}

/**
 * Client-only relative time. Returns null on SSR so the server-rendered HTML
 * has no time string (which would differ from client by 1+ minutes and trigger
 * React hydration error #418). After mount, computes and updates every 30s.
 *
 * Hydration matters: on mismatch, React 18 unmounts the surrounding subtree
 * and re-renders client-only — which in our case wiped the message list.
 */
function useRelativeTime(iso: string | null): string | null {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!iso) {
      setText(null);
      return;
    }
    const compute = () => {
      const diff = new Date(iso).getTime() - Date.now();
      if (diff <= 0) {
        setText("истекла");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      if (hours >= 1) setText(`ещё ${hours}ч ${minutes}м`);
      else if (minutes >= 1) setText(`ещё ${minutes}м`);
      else setText("истекает");
    };
    compute();
    const id = setInterval(compute, 30_000);
    return () => clearInterval(id);
  }, [iso]);

  return text;
}
