"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Zap,
  ShieldCheck,
  Check,
  FileText,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Mail,
} from "lucide-react";
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
        {/* Hero: two-column on desktop */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-2 md:items-center md:gap-16 md:py-20">
            {/* Value side */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Экономия 60%
              </div>
              <h1 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
                Годовой абонемент
                <br />
                на расшифровку анализов
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                10 расшифровок за 799&nbsp;₽ — вместо 1&nbsp;990&nbsp;₽ при
                разовых покупках. Используйте в течение года для своих
                анализов и анализов близких.
              </p>

              <ul className="mt-8 space-y-3 text-base">
                <Bullet>80&nbsp;₽ за расшифровку вместо 199&nbsp;₽</Bullet>
                <Bullet>Действует 12 месяцев с момента оплаты</Bullet>
                <Bullet>Расшифровывайте свои анализы и анализы близких</Bullet>
                <Bullet>Без подписки и автопродления — один платёж</Bullet>
              </ul>
            </div>

            {/* Action card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Тариф «Годовой»
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-5xl font-bold text-foreground">
                  799&nbsp;₽
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  1990&nbsp;₽
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                  −60%
                </span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                10 расшифровок · 12 месяцев · без автопродления
              </div>

              <div className="mt-6">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email для активации
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
                  <div className="mt-3 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
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

                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Оплата защищена ЮКассой · чек по 54-ФЗ
                </div>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Нажимая «Купить», вы соглашаетесь с{" "}
                  <Link href="/offer" className="underline hover:text-primary">
                    офертой
                  </Link>{" "}
                  и{" "}
                  <Link href="/privacy" className="underline hover:text-primary">
                    политикой конфиденциальности
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's included */}
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold md:text-3xl">
                Что входит в каждую расшифровку
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Один анализ — один отчёт. Сразу понятно, что в норме, что
                отклонилось, и что с этим делать.
              </p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Feature
                icon={<FileText className="h-5 w-5" />}
                title="Все показатели из анализа"
                text="AI находит и разбирает каждый показатель, который есть в вашем PDF или фото."
              />
              <Feature
                icon={<MessageSquare className="h-5 w-5" />}
                title="Объяснение простым языком"
                text="Что показатель означает, за что отвечает, почему он важен — без медицинского жаргона."
              />
              <Feature
                icon={<AlertTriangle className="h-5 w-5" />}
                title="Отметка отклонений"
                text="Каждое отклонение от нормы выделяется отдельно, с возможными причинами."
              />
              <Feature
                icon={<BookOpen className="h-5 w-5" />}
                title="Ссылки на справку"
                text="Кликабельные ссылки на подробные страницы по каждому показателю — узнать больше."
              />
              <Feature
                icon={<Zap className="h-5 w-5" />}
                title="Что делать дальше"
                text="Конкретные рекомендации: к какому врачу, какие анализы пересдать, на что обратить внимание."
              />
              <Feature
                icon={<Mail className="h-5 w-5" />}
                title="PDF на email"
                text="Готовый отчёт уходит на ваш ящик — храните, печатайте, показывайте врачу."
              />
            </div>
          </div>
        </section>

        {/* Audiences */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-bold md:text-3xl">
              Кому подходит абонемент
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
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
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-center text-2xl font-bold md:text-3xl">
              Как это работает
            </h2>
            <ol className="mt-12 space-y-6">
              <Step
                num={1}
                title="Оплачиваете 799 ₽"
                text="Картой или через СБП. Платёж проходит через ЮКассу, чек уходит на email."
              />
              <Step
                num={2}
                title="Получаете подтверждение"
                text="На указанный email приходит письмо с инструкцией, как пользоваться абонементом."
              />
              <Step
                num={3}
                title="Расшифровываете анализы"
                text="Загружаете файл на сайте — расшифровка идёт без оплаты, пока в абонементе остаются использования."
              />
            </ol>
          </div>
        </section>

        {/* Final reassurance + repeat CTA */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center md:py-20">
            <h2 className="text-2xl font-bold md:text-3xl">
              Один платёж — год спокойствия
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Никаких подписок и автоматических списаний. Если в течение
              14&nbsp;дней передумаете и не использовали ни одной расшифровки —
              вернём 799&nbsp;₽ полностью.
            </p>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
            >
              Оформить абонемент
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
    </div>
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
