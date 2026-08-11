import Link from "next/link";
import { ArrowUpRight, Check, FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InlineDropzone } from "@/components/inline-dropzone";
import type { Metadata } from "next";

/**
 * Индексируемый пример расшифровки. Раньше пример жил только внутри модалки на пейволле
 * (закрытый тест ab_example_v1) — то есть был невидим для поиска, хотя «пример отчёта»
 * это ровно то, что ищет человек, решающий, платить ли. Контент — тот же реальный
 * обезличенный заказ (ж/44), без ФИО и любых идентификаторов.
 */

export const metadata: Metadata = {
  title: "Пример расшифровки анализа крови — Мой Анализ",
  description:
    "Как выглядит готовый отчёт: реальный обезличенный пример расшифровки анализа крови — разбор показателей, что означает отклонение, что делать и какие вопросы задать врачу.",
  keywords: [
    "пример расшифровки анализа крови",
    "образец расшифровки анализов",
    "как выглядит расшифровка анализа",
    "пример отчёта по анализам",
    "расшифровка анализа крови пример",
  ].join(", "),
  alternates: { canonical: "/example" },
  openGraph: {
    title: "Пример расшифровки анализа крови — Мой Анализ",
    description:
      "Реальный обезличенный пример готового отчёта: разбор показателей, объяснение отклонений и вопросы врачу.",
    url: "https://moyanaliz.ru/example",
    type: "website",
  },
};

const FAQ = [
  {
    q: "Это реальный отчёт?",
    a: "Да, это фрагмент реального разбора, полностью обезличенный: имя, дата рождения, номер заказа и название лаборатории удалены. Показатели и текст разбора оставлены как есть, чтобы было видно, какого уровня объяснения вы получаете.",
  },
  {
    q: "Сколько показателей будет в моём отчёте?",
    a: "Столько, сколько удалось распознать в вашем бланке — ограничения по количеству нет. Каждый разбирается так же подробно, как ферритин в примере ниже, с учётом пола, возраста и связей с другими показателями.",
  },
  {
    q: "Чем это отличается от поиска в интернете?",
    a: "Поиск отвечает на вопрос «что такое ферритин вообще». Отчёт отвечает на вопрос «что означает ферритин 7,7 именно у меня, при моём гемоглобине и цветовом показателе» — то есть трактует ваши цифры в связке, а не по отдельности.",
  },
  {
    q: "Отчёт ставит диагноз?",
    a: "Нет. Мы не медицинская организация: сервис объясняет, что означают цифры, и помогает прийти к врачу подготовленным. Диагноз ставит и лечение назначает только врач.",
  },
];

/** Показатели из реального обезличенного заказа. Числа не выдуманы. */
const ROWS = [
  { name: "Ферритин", value: "7,7", unit: "нг/мл", ref: "15–150", tone: "bad" as const, label: "Критически низкий" },
  { name: "Цветовой показатель", value: "0,84", unit: "", ref: "0,85–1,05", tone: "warn" as const, label: "Ниже нормы" },
  { name: "Гемоглобин", value: "123", unit: "г/л", ref: "120–150", tone: "good" as const, label: "В норме" },
];

const toneCls = {
  good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  warn: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  bad: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

export default function ExamplePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Пример расшифровки анализа крови",
      description: metadata.description,
      url: "https://moyanaliz.ru/example",
      inLanguage: "ru-RU",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://moyanaliz.ru/" },
        { "@type": "ListItem", position: 2, name: "Пример расшифровки", item: "https://moyanaliz.ru/example" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <FileText className="h-3.5 w-3.5" />
            Реальный обезличенный отчёт
          </div>

          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            Пример расшифровки анализа крови
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Так выглядит готовый разбор. Ниже — фрагмент реального отчёта (женщина, 44 года): что
            нашли, что это значит именно для неё и с чем идти к врачу. Все личные данные удалены.
          </p>

          {/* сводка как в отчёте */}
          <div className="mt-7 rounded-2xl border border-border bg-card p-5 shadow-lg shadow-black/[0.04]">
            <h2 className="text-base font-semibold text-foreground">Сводка по анализу</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Показатель</th>
                    <th className="pb-2 font-medium">Результат</th>
                    <th className="pb-2 font-medium">Референс</th>
                    <th className="pb-2 font-medium">Оценка</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.name} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 font-medium text-foreground">{r.name}</td>
                      <td className="py-2.5 text-foreground">
                        {r.value} {r.unit}
                      </td>
                      <td className="py-2.5 text-muted-foreground">{r.ref}</td>
                      <td className="py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${toneCls[r.tone]}`}>
                          {r.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Референсы взяты из бланка этой лаборатории — у разных лабораторий границы отличаются.
            </p>
          </div>

          {/* разбор одного показателя во всю глубину */}
          <h2 className="mt-10 text-lg font-semibold text-foreground">
            Как разбирается каждый показатель
          </h2>
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-lg shadow-black/[0.04]">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-foreground">Ферритин</h3>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${toneCls.bad}`}>
                Критически низкий
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">7,7</span>
              <span className="text-sm text-muted-foreground">нг/мл</span>
              <span className="ml-auto text-xs text-muted-foreground">Референс: 15–150 нг/мл</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-rose-400" style={{ width: "5%" }} />
            </div>

            <div className="mt-6 space-y-5">
              <Block title="Что это">
                <p>
                  Ферритин — белок, в котором организм хранит железо про запас. Это самый ранний
                  маркер дефицита: он падает за месяцы до того, как снизится{" "}
                  <Link href="/indicators/gemoglobin" className="text-primary underline underline-offset-2">
                    гемоглобин
                  </Link>
                  . Поэтому нормальный гемоглобин ещё не значит, что с железом всё в порядке.
                </p>
              </Block>

              <Block title="Что это значит в этом случае">
                <p>Для женщины 44 лет ферритин 7,7 — вдвое ниже нижней границы, запасы железа почти исчерпаны.</p>
                <p>
                  Это сходится с другими показателями бланка: цветовой показатель 0,84 уже ниже
                  нормы, а гемоглобин 123 пока в границах — анемии ещё нет. То есть дефицит
                  скрытый: организм держит гемоглобин за счёт резервов, и анализ поймал проблему
                  заранее. У женщин до менопаузы это частая ситуация из-за регулярной кровопотери.
                </p>
              </Block>

              <Block title="Чем это грозит">
                <p>
                  Даже без анемии низкий ферритин может давать усталость, выпадение волос,
                  ломкость ногтей, одышку при нагрузке и «туман в голове». Без восполнения запасов
                  дефицит со временем переходит в железодефицитную анемию.
                </p>
              </Block>

              <Block title="Что делать">
                <ul className="ml-5 list-disc space-y-1.5">
                  <li>
                    В питании — красное мясо, печень, гречка, бобовые вместе с витамином C; чай и
                    кофе во время еды, наоборот, мешают усвоению железа.
                  </li>
                  <li>
                    Питанием такой уровень обычно не поднять — вопрос о препаратах железа, форме и
                    дозе решает врач.
                  </li>
                  <li>Контрольный ферритин и гемоглобин — по срокам, которые назначит врач.</li>
                </ul>
              </Block>

              <Block title="Что ещё обсудить с врачом">
                <p>
                  Чтобы понять причину и глубину дефицита, обычно смотрят ОЖСС, насыщение
                  трансферрина и ретикулоциты, при стойкой усталости —{" "}
                  <Link href="/indicators/vitamin-b12" className="text-primary underline underline-offset-2">
                    витамин B12
                  </Link>{" "}
                  и фолиевую кислоту. Насыщение трансферрина можно прикинуть самому в{" "}
                  <Link href="/kalkulyator/nasyshchenie-transferrina" className="text-primary underline underline-offset-2">
                    калькуляторе TSAT
                  </Link>
                  .
                </p>
              </Block>

              <Block title="Вопрос врачу">
                <p>
                  Ферритин 7,7 — нужны ли препараты железа и в какой дозе? Стоит ли искать причину
                  потери железа — например, оценить обильность менструаций или обследовать ЖКТ?
                </p>
              </Block>
            </div>
          </div>

          {/* что входит в отчёт */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">
              В полном отчёте так же разобран каждый показатель из вашего бланка
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              с учётом пола, возраста и связей между показателями. В отчёт входит:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                "Разбор всех распознанных показателей",
                "Отдельный блок по отклонениям от референсов",
                "Общие рекомендации по питанию и образу жизни",
                "Какие уточняющие исследования обычно обсуждают с врачом",
                "Список вопросов на приём",
                "PDF-отчёт на email",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <InlineDropzone
            source="example"
            title="Получить такой же разбор своего анализа"
            subtitle="Загрузите PDF или фото бланка — отчёт будет готов за пару минут. 299 ₽, без регистрации."
          />

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">Частые вопросы</h2>
            <div className="mt-4 space-y-3">
              {FAQ.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border bg-card px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/indicators"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
            >
              Справочник показателей
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </Link>
            <Link
              href="/kalkulyator"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
            >
              Калькуляторы по анализам
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Пример приведён для демонстрации формата отчёта. Сервис носит информационный характер,
            не ставит диагноз и не заменяет консультацию врача.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-sm font-semibold text-foreground">{title}</h4>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
