"use client";

import { useState } from "react";

/* ─── Block 1: Trigger (pain point) ─── */
function TriggerSection() {
  return (
    <section className="mt-14">
      <div className="rounded-2xl bg-warning/5 border border-warning/15 px-5 py-4 flex items-start gap-3">
        <svg className="w-6 h-6 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <div>
          <p className="text-base sm:text-lg font-bold text-foreground">
            60% людей неправильно трактуют свои анализы
          </p>
          <p className="text-sm text-muted mt-1">
            Показатель вне нормы — это не всегда болезнь.
            Но&nbsp;без правильной интерпретации легко либо упустить проблему, либо напугать себя зря.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Block 2: Stats ─── */
function StatsSection() {
  const stats = [
    { value: "< 2 минут", label: "Среднее время получения отчёта" },
    { value: "Современный ИИ", label: "Анализируем показатели и взаимосвязи между ними" },
    { value: "24/7", label: "Работаем круглосуточно, без ожидания приёма врача" },
  ];

  return (
    <section className="mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.value} className="rounded-xl bg-card border border-border px-4 py-3 text-center">
            <div className="text-xl font-bold text-primary">
              {s.value}
            </div>
            <div className="text-sm text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Block 3: Social proof ─── */
function TrustBadges() {
  return (
    <section className="mt-10">
      <div className="text-center">
        <p className="text-base sm:text-lg font-bold text-foreground">
          5 000+ расшифровок · Средняя оценка 4.9 ⭐
        </p>
        <p className="text-sm text-muted mt-1">
          Отзывы пользователей ниже
        </p>
      </div>
    </section>
  );
}

/* ─── Repeat CTA ─── */
function RepeatCTA() {
  return (
    <section className="mt-10 text-center">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full max-w-md mx-auto py-3.5 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-dark transition"
      >
        Расшифровать бесплатно
      </button>
      <p className="mt-2 text-sm text-muted">
        Без регистрации · Среднее время — 2 минуты
      </p>
    </section>
  );
}

/* ─── Block 4: Who is this for ─── */
function AudienceSection() {
  const items = [
    "Если вы получили анализы и не понимаете цифры",
    "Если приём у врача через неделю, а вопросов много",
    "Если хотите проверить, всё ли в норме",
    "Если сомневаетесь в заключении и хотите второе мнение",
  ];

  return (
    <section className="mt-14">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Кому это подойдёт
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
          >
            <svg
              className="w-6 h-6 text-primary shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
            <span className="text-base">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Block 5: Report example ─── */
function ReportSection() {
  const rows = [
    {
      name: "Гемоглобин",
      value: "142 г/л",
      status: "normal" as const,
      what: "Гемоглобин — белок в эритроцитах, который переносит кислород от лёгких ко всем органам и тканям. При низком гемоглобине клетки получают меньше кислорода — появляются слабость, головокружение и одышка.",
      interpretation:
        "В пределах нормы (130–160 г/л для мужчин). Кислородная ёмкость крови достаточна, признаков анемии нет. Уровень железа и витамина B12, вероятно, в порядке. Повторный контроль — при плановом обследовании через 6–12 месяцев.",
    },
    {
      name: "Глюкоза",
      value: "6.2 ммоль/л",
      status: "warning" as const,
      what: "Глюкоза — основной источник энергии для клеток. Поступает из углеводов: хлеб, крупы, фрукты, сладости. Уровень натощак показывает, насколько эффективно организм регулирует сахар в крови с помощью инсулина.",
      interpretation:
        "Выше верхней границы нормы натощак (референс 3.9–5.5 ммоль/л). Такой уровень может указывать на преддиабет — состояние, при котором углеводный обмен уже нарушен, но диабета ещё нет. Рекомендуется сдать гликированный гемоглобин (HbA1c) — он покажет средний уровень сахара за последние 3 месяца. До визита к врачу имеет смысл сократить быстрые углеводы и добавить регулярную физическую активность.",
    },
    {
      name: "Холестерин общий",
      value: "7.8 ммоль/л",
      status: "danger" as const,
      what: "Холестерин — жироподобное вещество, необходимое для построения клеточных мембран и выработки гормонов. Однако избыток холестерина откладывается на стенках артерий, сужает их просвет и со временем может привести к инфаркту или инсульту.",
      interpretation:
        "Значительно выше нормы (референс до 5.2 ммоль/л). При таком уровне повышен риск развития атеросклероза — особенно если есть курение, гипертония или диабет в семье. Необходим развёрнутый липидный профиль: ЛПНП («плохой» холестерин), ЛПВП («хороший»), триглицериды — чтобы понять, за счёт какой фракции повышение. Обязательно обсудите результат с терапевтом или кардиологом.",
    },
  ];

  const statusColor = {
    normal: "bg-success/15 text-success border-success/20",
    warning: "bg-warning/15 text-warning border-warning/20",
    danger: "bg-danger/15 text-danger border-danger/20",
  };

  const statusLabel = {
    normal: "Норма",
    warning: "Внимание",
    danger: "Повышен",
  };

  const dotColor = {
    normal: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <section id="report" className="mt-14 scroll-mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Пример отчёта
      </h2>
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <span className="text-base font-semibold text-foreground">
            Так выглядит расшифровка
          </span>
        </div>

        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.name} className="rounded-xl bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor[r.status]}`} />
                  <span className="text-base font-medium text-foreground">
                    {r.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base text-muted">{r.value}</span>
                  <span
                    className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${statusColor[r.status]}`}
                  >
                    {statusLabel[r.status]}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/60 mb-2 ml-4">
                {r.what}
              </p>
              <p className="text-sm leading-relaxed text-foreground/80 pl-4 border-l-2 border-primary/30 ml-0.5 font-medium">
                {r.interpretation}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row gap-4 text-base text-muted">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Такая расшифровка по каждому показателю
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

/* ─── Block 6: Security ─── */
function SecuritySection() {
  const items = [
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
      text: "Передача данных по HTTPS",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
        </svg>
      ),
      text: "Серверы в РФ",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
      text: "Соответствие 152-ФЗ",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      text: "Данные не используются для обучения ИИ",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      ),
      text: "Файлы удаляются через 24 часа",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      ),
      text: "Можно удалить файл сразу после загрузки",
    },
  ];

  return (
    <section className="mt-14">
      <h2 id="safety" className="text-2xl sm:text-3xl font-bold text-center mb-6 scroll-mt-8">
        Безопасность
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.text}
            className="flex items-center gap-3 p-5 rounded-xl bg-card border border-border"
          >
            {item.icon}
            <span className="text-base">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Block 7: FAQ ─── */
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
    a: "Да. Серверы расположены в РФ, данные передаются по HTTPS. Файлы автоматически удаляются через 24 часа. Данные не используются для обучения ИИ и не передаются третьим лицам.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-14">
      <h2 id="faq" className="text-2xl sm:text-3xl font-bold text-center mb-6 scroll-mt-8">
        Частые вопросы
      </h2>
      <div className="space-y-2">
        {faqItems.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-base font-medium hover:bg-card transition-colors"
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
                <div className="px-5 pb-4 text-base text-muted leading-relaxed">
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
      <TriggerSection />
      <StatsSection />
      <TrustBadges />
      <RepeatCTA />
      <AudienceSection />
      <ReportSection />
      <SecuritySection />
      <FAQSection />
    </>
  );
}
