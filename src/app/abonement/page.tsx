"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Calendar, Zap, ShieldCheck } from "lucide-react";
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
      setError(
        e instanceof Error ? e.message : "Не удалось создать платёж. Попробуйте позже."
      );
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero + buy */}
        <section className="mx-auto max-w-3xl px-4 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              Годовой абонемент
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              10 расшифровок анализов в течение 12 месяцев
            </p>

            {/* Price reveal */}
            <div className="mt-10 flex items-baseline justify-center gap-4">
              <span className="text-2xl text-muted-foreground line-through md:text-3xl">
                1990&nbsp;₽
              </span>
              <span className="text-5xl font-bold md:text-6xl">799&nbsp;₽</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary md:text-base">
                −60%
              </span>
            </div>
          </div>

          {/* Buy form */}
          <div className="mx-auto mt-12 max-w-md">
            <label htmlFor="email" className="block text-sm font-medium">
              Email для активации абонемента
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

            {error && (
              <div className="mt-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-primary py-4 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Создаём платёж..." : "Купить за 799 ₽"}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Оплата защищена ЮКассой · чек по 54-ФЗ
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
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
        </section>

        {/* Audiences */}
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-bold md:text-3xl">
              Кому подходит абонемент
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Card
                icon={<Users className="h-6 w-6" />}
                title="Для всей семьи"
                text="Расшифровывайте анализы родителей, супруга, детей. Каждая загрузка списывает одну расшифровку из десяти."
              />
              <Card
                icon={<Calendar className="h-6 w-6" />}
                title="Для регулярного контроля"
                text="Если сдаёте анализы 2–4 раза в год, абонемент окупается уже на 4–5-й расшифровке."
              />
              <Card
                icon={<Zap className="h-6 w-6" />}
                title="Для хронических показателей"
                text="Щитовидка, железо, витамин D, сахар — следите за динамикой без отдельной оплаты каждый раз."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-center text-2xl font-bold md:text-3xl">
              Как это работает
            </h2>
            <ol className="mt-10 space-y-6">
              <Step
                num={1}
                title="Оплачиваете 799 ₽"
                text="Картой или через СБП — у нас принимает ЮКасса. Чек придёт на email."
              />
              <Step
                num={2}
                title="Получаете подтверждение"
                text="На указанный email приходит письмо с инструкцией, как пользоваться абонементом."
              />
              <Step
                num={3}
                title="Расшифровываете анализы"
                text="Загружаете файл на сайте — расшифровка идёт без дополнительной оплаты, пока в абонементе остаются использования."
              />
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Card({
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

function Step({
  num,
  title,
  text,
}: {
  num: number;
  title: string;
  text: string;
}) {
  return (
    <li className="flex gap-5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
        {num}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
    </li>
  );
}
