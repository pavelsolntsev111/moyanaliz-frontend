"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Users, Calendar, ShieldCheck, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createAbonementPayment } from "@/lib/api";
import { ymGoal } from "@/lib/ym";

export default function AbonementPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Укажите корректный email");
      return;
    }
    setLoading(true);
    try {
      ymGoal("click_pay");
      const res = await createAbonementPayment(email.trim().toLowerCase());
      window.location.href = res.redirect_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать платёж. Попробуйте позже.");
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="bg-gradient-to-b from-background to-muted/40">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-12 pb-8 md:pt-20 md:pb-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Новинка · экономия 60%
              </div>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                Годовой абонемент:
                <br />
                <span className="text-primary">10 расшифровок за 799 ₽</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Один платёж — год спокойствия. По 80&nbsp;₽ за расшифровку
                вместо 199&nbsp;₽. Расшифровывайте свои анализы и анализы близких
                в течение 12 месяцев.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#buy"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  Купить за 799 ₽
                </a>
                <span className="text-sm text-muted-foreground">
                  Оплата картой или СБП через ЮКассу
                </span>
              </div>
            </div>

            {/* Pricing card */}
            <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-xl md:p-8">
              <div className="text-sm font-medium uppercase tracking-wide text-primary">
                Годовой абонемент
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-5xl font-bold">799&nbsp;₽</span>
                <span className="text-xl text-muted-foreground line-through">
                  1990&nbsp;₽
                </span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                10 расшифровок · 12 месяцев · 80&nbsp;₽ за штуку
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                <Feature>Полный AI-разбор каждого анализа</Feature>
                <Feature>PDF-отчёт на email</Feature>
                <Feature>Расшифровки для всей семьи</Feature>
                <Feature>Все типы анализов: кровь, моча, гормоны</Feature>
                <Feature>Поддержка по любым вопросам</Feature>
              </ul>

              <a
                href="#buy"
                className="mt-6 block w-full rounded-lg bg-primary py-3 text-center font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Оформить абонемент
              </a>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-bold md:text-3xl">Кому подходит абонемент</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <BenefitCard
              icon={<Users className="h-6 w-6" />}
              title="Для всей семьи"
              text="Расшифровывайте анализы родителей, супруга, детей. Каждая загрузка списывает 1 расшифровку из 10."
            />
            <BenefitCard
              icon={<Calendar className="h-6 w-6" />}
              title="Регулярный контроль"
              text="Если сдаёте анализы 2–4 раза в год, абонемент окупается за 4–5 расшифровок."
            />
            <BenefitCard
              icon={<Zap className="h-6 w-6" />}
              title="Хронические показатели"
              text="Щитовидка, железо, витамин D, сахар — следите за динамикой без каждый раз новой оплаты."
            />
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-bold md:text-3xl">Как это работает</h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              <Step
                num={1}
                title="Оплачиваете 799 ₽"
                text="Через ЮКассу — картой, СБП, СберPay. Получаете чек на email."
              />
              <Step
                num={2}
                title="Получаете промокод"
                text="На email приходит персональный код вида ABONEMENT-XXXXXX. 10 использований, действует 12 месяцев."
              />
              <Step
                num={3}
                title="Используете при загрузке"
                text="При расшифровке анализа на moyanaliz.ru вводите код — оплата не списывается."
              />
            </ol>
          </div>
        </section>

        {/* Comparison */}
        <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-bold md:text-3xl">Сколько вы экономите</h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Расшифровки в год</th>
                  <th className="px-4 py-3 text-right font-semibold">Без абонемента</th>
                  <th className="px-4 py-3 text-right font-semibold">С абонементом</th>
                  <th className="px-4 py-3 text-right font-semibold text-primary">Экономия</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">4 расшифровки</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">796&nbsp;₽</td>
                  <td className="px-4 py-3 text-right">799&nbsp;₽</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">~0&nbsp;₽</td>
                </tr>
                <tr className="border-t border-border bg-primary/5">
                  <td className="px-4 py-3 font-medium">5 расшифровок</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">995&nbsp;₽</td>
                  <td className="px-4 py-3 text-right font-medium">799&nbsp;₽</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">196&nbsp;₽</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">7 расшифровок</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">1393&nbsp;₽</td>
                  <td className="px-4 py-3 text-right">799&nbsp;₽</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">594&nbsp;₽</td>
                </tr>
                <tr className="border-t border-border bg-primary/10">
                  <td className="px-4 py-3 font-semibold">10 расшифровок</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">1990&nbsp;₽</td>
                  <td className="px-4 py-3 text-right font-semibold">799&nbsp;₽</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">1191&nbsp;₽</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Уже 4 расшифровки — и абонемент окупает себя. Каждая последующая —
            в чистый плюс.
          </p>
        </section>

        {/* FAQ */}
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-2xl font-bold md:text-3xl">Вопросы и ответы</h2>
            <div className="mt-8 space-y-4">
              <Faq q="Что входит в одну расшифровку?">
                Полный AI-разбор всех показателей анализа: общий анализ крови,
                биохимия, гормоны, моча, липидный профиль и другие. PDF-отчёт
                с объяснением каждого отклонения и рекомендациями.
              </Faq>
              <Faq q="Можно ли использовать для родственников?">
                Да. Промокод не привязан к конкретному человеку — расшифровывайте
                анализы любых членов семьи, ребёнка, пожилых родителей. Каждая
                загрузка списывает одну расшифровку из 10.
              </Faq>
              <Faq q="Что будет с неиспользованными расшифровками в конце года?">
                Они сгорают. Срок действия абонемента — ровно 12 месяцев с даты
                покупки. Мы пришлём напоминание за месяц до окончания.
              </Faq>
              <Faq q="Можно ли вернуть деньги?">
                Если вы не использовали ни одной расшифровки и обратились в
                течение 14 дней — вернём полную сумму. После первого использования
                возврат не предусмотрен (стандарт для подписок).
              </Faq>
              <Faq q="Как мне получить промокод?">
                После оплаты промокод появится на странице успеха и придёт на
                email в течение пары минут. Если не получили — напишите на
                support@moyanaliz.ru.
              </Faq>
              <Faq q="Что если я уже покупал расшифровку?">
                У вас уже есть промокод со скидкой 30% на каждую покупку. Абонемент
                — отдельное предложение. Выгоднее, если планируете расшифровывать
                регулярно.
              </Faq>
            </div>
          </div>
        </section>

        {/* CTA / Buy form */}
        <section id="buy" className="mx-auto max-w-2xl px-4 py-16 md:py-20">
          <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-xl md:p-10">
            <h2 className="text-2xl font-bold md:text-3xl">Оформить абонемент</h2>
            <p className="mt-2 text-muted-foreground">
              Введите email — на него придёт промокод после оплаты.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Ваш email
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full rounded-lg bg-primary py-4 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Создаём платёж..." : "Купить абонемент за 799 ₽"}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Оплата защищена ЮКассой · Чек по 54-ФЗ на email
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Нажимая «Купить», вы соглашаетесь с{" "}
                <Link href="/offer" className="underline hover:text-primary">
                  публичной офертой
                </Link>{" "}
                и{" "}
                <Link href="/privacy" className="underline hover:text-primary">
                  политикой конфиденциальности
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  );
}

function BenefitCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Step({ num, title, text }: { num: number; title: string; text: string }) {
  return (
    <li className="rounded-xl bg-card p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {num}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-border bg-card p-4">
      <summary className="cursor-pointer list-none font-medium">
        <span className="flex items-start justify-between gap-4">
          <span>{q}</span>
          <span className="text-primary transition group-open:rotate-180">▾</span>
        </span>
      </summary>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </details>
  );
}
