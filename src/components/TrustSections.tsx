"use client";

import { useState } from "react";

/* ─── Block 1: Stats ─── */
function StatsSection() {
  const stats = [
    { value: "< 2 минут", label: "среднее время расшифровки" },
    { value: "Claude AI", label: "последняя модель ИИ от Anthropic" },
    { value: "24/7", label: "работаем круглосуточно" },
  ];

  return (
    <section className="mt-14">
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/10 p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.value}>
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {s.value}
              </div>
              <div className="text-sm text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Block 2: Report example ─── */
function ReportSection() {
  const rows = [
    { name: "Гемоглобин", value: "142 г/л", status: "normal" as const },
    { name: "Глюкоза", value: "6.2 ммоль/л", status: "warning" as const },
    { name: "Холестерин", value: "7.8 ммоль/л", status: "danger" as const },
  ];

  const statusColor = {
    normal: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
  };

  const statusLabel = {
    normal: "Норма",
    warning: "Внимание",
    danger: "Повышен",
  };

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-center mb-4">
        Что вы получите
      </h2>
      <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <span className="text-sm font-semibold text-foreground">
            Пример отчёта
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {rows.map((r) => (
            <div
              key={r.name}
              className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-card"
            >
              <span className="text-foreground">{r.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted">{r.value}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[r.status]}`}
                >
                  {statusLabel[r.status]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm text-muted">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Интерпретация простым языком по каждому показателю
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Персональные вопросы для врача
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Block 3: Security ─── */
function SecuritySection() {
  const items = [
    {
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
      title: "Шифрование",
      desc: "Передача данных по HTTPS",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      ),
      title: "Удаление",
      desc: "Файлы удаляются через 24 часа",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
      title: "Приватность",
      desc: "Не передаём данные третьим лицам",
    },
  ];

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-center mb-4">Безопасность</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col items-center text-center p-5 rounded-2xl bg-card border border-border"
          >
            <div className="mb-2">{item.icon}</div>
            <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Block 4: FAQ ─── */
const faqItems = [
  {
    q: "Это замена визиту к врачу?",
    a: "Нет. Сервис предоставляет информационную расшифровку результатов анализов с помощью ИИ. Это не медицинская услуга и не диагноз. Для принятия решений о лечении обязательно обратитесь к врачу.",
  },
  {
    q: "Какие анализы поддерживаются?",
    a: "Общий анализ крови (ОАК), биохимия, гормоны, общий анализ мочи, коагулограмма, липидный профиль и другие стандартные лабораторные исследования. Загрузите PDF или фото — ИИ автоматически распознает показатели.",
  },
  {
    q: "Как быстро приходит результат?",
    a: "Обычно расшифровка готова за 1–2 минуты после оплаты. Результат будет отправлен вам на почту в формате PDF.",
  },
  {
    q: "Мои данные в безопасности?",
    a: "Да. Все данные передаются по зашифрованному каналу (HTTPS). Загруженные файлы автоматически удаляются через 24 часа. Мы не передаём ваши данные третьим лицам.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-center mb-4">
        Частые вопросы
      </h2>
      <div className="space-y-2 max-w-lg mx-auto">
        {faqItems.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-card transition-colors"
              >
                <span>{item.q}</span>
                <svg
                  className={`w-4 h-4 text-muted shrink-0 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-3 text-sm text-muted leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Combined export ─── */
export default function TrustSections() {
  return (
    <>
      <StatsSection />
      <ReportSection />
      <SecuritySection />
      <FAQSection />
    </>
  );
}
