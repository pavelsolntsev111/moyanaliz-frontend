"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { setPendingUpload } from "@/lib/pending-upload";
import { ymGoal } from "@/lib/ym";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.heic,image/*,application/pdf";
const MAX_MB = 20;

interface Props {
  /** метка кластера: попадёт в ?ref= и в цель Метрики — так мы узнаем, какой тип страниц продаёт */
  source: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

/**
 * Дропзона внутри контентной страницы. Сам файл не загружает: кладёт его в общий стор и
 * уводит на главную, где отрабатывает штатный обработчик со всей A/B-логикой и атрибуцией.
 * До этой правки статья была тупиком — единственным выходом была кнопка на главную,
 * где воронка начиналась заново.
 */
export function InlineDropzone({
  source,
  title = "Есть на руках свой анализ? Расшифруем за 2 минуты",
  subtitle = "Загрузите PDF или фото бланка — ИИ объяснит каждый показатель с учётом пола и возраста. 299 ₽, без регистрации.",
  compact = false,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const accept = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Файл больше ${MAX_MB} МБ — сожмите или сфотографируйте бланк заново.`);
      return;
    }
    setError(null);
    setBusy(true);
    ymGoal("file_selected_inline", { source });
    setPendingUpload(f, source);
    router.push(`/?ref=${encodeURIComponent(source)}`);
  };

  return (
    <div className="not-prose my-8 rounded-2xl border border-primary/15 bg-primary/[0.04] p-5">
      <p className="text-[15px] font-semibold leading-snug text-foreground">{title}</p>
      {!compact && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragOver ? "border-primary bg-primary/10" : "border-primary/30 hover:border-primary/60"
        }`}
      >
        {busy ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="mt-2 text-sm font-medium text-foreground">Загружаем анализ…</span>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-primary" />
            <span className="mt-2 text-sm font-semibold text-foreground">
              Загрузить анализ
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              PDF или фото · можно перетащить сюда · до {MAX_MB} МБ
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>

      {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
