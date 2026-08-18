import Link from "next/link";
import { MessageCircle, ShieldCheck, Moon, ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import ConsultComposer from "@/components/consult/ConsultComposer";
import { formatInlineSafe, jsonLdScript } from "@/lib/safe-html";
import { getConsultPacks } from "@/lib/consult-api";
import { AI_H1, AI_LEAD, AI_TRUST, aiSections, aiFaq } from "@/lib/ai-consultant-data";
import type { Metadata } from "next";

/**
 * Посадочная «ИИ-консультант по здоровью».
 *
 * Чат живёт на /ai-chat/{token}; отсюда задаётся первый вопрос. Экрана выбора
 * канала перед чатом НЕТ намеренно: Телеграм предлагается уже внутри диалога,
 * где его можно проигнорировать бесплатно. Deep link в Телеграм — та самая
 * механика, из-за которой в мае возвращали деньги и вели 31-дневную переписку,
 * так что он не стоит на пути к ценности.
 *
 * ⚠️ Цена и объём пакета приезжают с бэкенда (/consult/packs) — из того же
 * источника, из которого пейволл берёт, что списать, а чек 54-ФЗ берёт, что
 * напечатать. Константы FALLBACK_PRICING нужны только чтобы SEO-страница
 * отрисовалась при недоступном API (это уже случалось дважды) — меняя цену,
 * правь config.py, а не их.
 *
 * ⚠️ Ни в title, ни в description не должно быть «консультация врача», «онлайн-приём»,
 * «телемедицина» — см. комментарий в ai-consultant-data.ts.
 */

const FALLBACK_PRICING = { packPrice: 49, packQuestions: 10 };

async function resolvePricing() {
  try {
    const info = await getConsultPacks();
    const cheapest = [...info.packs].sort((a, b) => a.price - b.price)[0];
    if (!cheapest) return FALLBACK_PRICING;
    return {
      packPrice: cheapest.price,
      packQuestions: cheapest.questions,
    };
  } catch {
    return FALLBACK_PRICING;
  }
}

export const metadata: Metadata = {
  title: "ИИ-консультант по здоровью — задать вопрос онлайн | Мой Анализ",
  description:
    "Чат, где на вопросы о здоровье отвечает нейросеть: объяснит термины из заключения, поможет понять результаты обследований, подскажет к какому врачу идти и какие вопросы ему задать. Отвечает ИИ, а не врач.",
  keywords:
    "ии консультант по здоровью, чат бот врач, нейросеть врач, искусственный интеллект здоровье, задать вопрос онлайн, к какому врачу обратиться",
  alternates: { canonical: "/ai-konsultant" },
  openGraph: {
    title: "ИИ-консультант по здоровью — задать вопрос онлайн",
    description:
      "Нейросеть объяснит медицинские термины, поможет понять результаты обследований и подготовиться к приёму. Не врач и не диагноз.",
    url: "https://moyanaliz.ru/ai-konsultant",
    type: "website",
  },
};

const BULLETS = [
  { icon: MessageCircle, text: "Объясняет простым языком то, что написано в заключении" },
  { icon: Moon, text: "Открыт ночью и в выходные, не торопит и не осуждает" },
  { icon: ShieldCheck, text: "Не ставит диагноз и не назначает лечение — это к врачу" },
];

export default async function AiConsultantPage() {
  const pricing = await resolvePricing();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: aiFaq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "ИИ-консультант по здоровью",
          item: "https://moyanaliz.ru/ai-konsultant",
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      <main className="flex-1">
        {/* ── Первый экран ── */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
            <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {AI_H1}
            </h1>

            <div className="prose prose-sm mt-5 max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground sm:prose-base">
              <Markdown text={AI_LEAD} />
            </div>

            <ul className="mt-7 space-y-2.5">
              {BULLETS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Вход в продукт. Цифры приезжают с бэкенда (тот же источник, что
                и пейволл), константы ниже — только на случай недоступного API. */}
            <ConsultComposer
              packPrice={pricing.packPrice}
              packQuestions={pricing.packQuestions}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/?ref=ai-konsultant"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-card-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Разобрать анализ по файлу
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/indicators"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-card-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Справочник показателей
              </Link>
            </div>

            <div className="prose prose-sm mt-8 max-w-none prose-li:text-muted-foreground prose-strong:text-foreground">
              <h2 className="text-lg font-semibold text-foreground">Границы: что консультант делает и чего не делает</h2>
              <Markdown text={AI_TRUST} />
            </div>
          </div>
        </section>

        {/* ── Основной текст ── */}
        <div className="mx-auto max-w-3xl px-4 py-12">
          {aiSections.map((s) => (
            <section key={s.id} id={s.id} className="mb-12 scroll-mt-20">
              <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">{s.h2}</h2>
              <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-h3:mb-2 prose-h3:mt-6 prose-h3:text-base prose-p:leading-relaxed prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground prose-table:text-sm sm:prose-base">
                <Markdown text={s.body} />
              </div>
            </section>
          ))}

          {/* ── FAQ ── */}
          <section id="faq" className="mb-12 scroll-mt-20">
            <h2 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">Частые вопросы</h2>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {aiFaq.map((f) => (
                <details key={f.q} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none text-[15px] font-semibold text-card-foreground marker:hidden group-open:text-primary">
                    {f.q}
                  </summary>
                  <div
                    className="mt-2.5 text-sm leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: formatInlineSafe(f.a) }}
                  />
                </details>
              ))}
            </div>
          </section>

          {/* ── Перелинковка ── */}
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Что ещё есть на сайте</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { href: "/", t: "Расшифровка анализов", d: "Загрузите бланк — разбор каждого показателя с учётом пола и возраста" },
                { href: "/indicators", t: "Справочник показателей", d: "Что означает каждый показатель, нормы и причины отклонений" },
                { href: "/kalkulyator", t: "Калькуляторы", d: "СКФ, HOMA-IR, ЛПНП и другие врачебные формулы" },
                { href: "/blog", t: "Здоровье", d: "Статьи о показателях, подготовке к анализам и чек-апах" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">
                      {l.t}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{l.d}</p>
                </Link>
              ))}
            </div>
          </section>

          <p className="border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            Сервис носит информационный характер и не является медицинской услугой. Отвечает
            языковая модель, а не врач; ответы не являются диагнозом, назначением или
            медицинским заключением и не заменяют очную консультацию. При резком ухудшении
            состояния звоните 103 или 112.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Компактный markdown: ## / ### заголовки, таблицы, списки, абзацы. */
function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      out.push(<h3 key={key++}>{line.slice(4)}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(<h3 key={key++}>{line.slice(3)}</h3>);
      i++;
      continue;
    }

    if (line.trim().startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i]);
        i++;
      }
      const cells = rows
        .filter((l) => !/^\|[\s:\-|]+\|$/.test(l.trim()))
        .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
      if (cells.length) {
        out.push(
          <div key={key++} className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {cells[0].map((c, ci) => (
                    <th key={ci} dangerouslySetInnerHTML={{ __html: formatInlineSafe(c) }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {cells.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((c, ci) => (
                      <td key={ci} dangerouslySetInnerHTML={{ __html: formatInlineSafe(c) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    if (line.trim().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      out.push(
        <ul key={key++}>
          {items.map((it, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineSafe(it) }} />
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s*/, ""));
        i++;
      }
      out.push(
        <ol key={key++}>
          {items.map((it, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineSafe(it) }} />
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    out.push(<p key={key++} dangerouslySetInnerHTML={{ __html: formatInlineSafe(line) }} />);
    i++;
  }

  return <>{out}</>;
}
