import Link from "next/link";
import { ArrowRight, Droplets, FlaskConical, Heart, Zap, Shield, Bone, Flame, Syringe, Activity, Pill, TestTube } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { indicators, getUsedCategories } from "@/lib/indicators-data";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Показатели анализов — справочник | Мой Анализ",
  description:
    "Справочник лабораторных показателей: нормы, причины отклонений, подготовка к анализам. Гемоглобин, холестерин, глюкоза, ТТГ, витамин D и другие.",
  alternates: {
    canonical: "/indicators-v2",
  },
  openGraph: {
    title: "Показатели анализов — справочник | Мой Анализ",
    description:
      "Справочник лабораторных показателей: нормы, причины отклонений, подготовка к анализам.",
    url: "https://moyanaliz.ru/indicators-v2",
  },
};

const categoryMeta: Record<string, { icon: LucideIcon; color: string; bgColor: string; borderColor: string }> = {
  "Общий анализ крови": { icon: Droplets, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-100" },
  "Биохимия крови": { icon: FlaskConical, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-100" },
  "Липидный профиль": { icon: Heart, color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-100" },
  "Гормоны щитовидной железы": { icon: Zap, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-100" },
  "Углеводный обмен": { icon: Activity, color: "text-pink-500", bgColor: "bg-pink-50", borderColor: "border-pink-100" },
  "Печёночные пробы": { icon: Shield, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-100" },
  "Почечные показатели": { icon: TestTube, color: "text-sky-500", bgColor: "bg-sky-50", borderColor: "border-sky-100" },
  "Электролиты и минералы": { icon: Bone, color: "text-teal-500", bgColor: "bg-teal-50", borderColor: "border-teal-100" },
  "Свёртываемость крови": { icon: Syringe, color: "text-rose-500", bgColor: "bg-rose-50", borderColor: "border-rose-100" },
  "Воспаление и иммунитет": { icon: Flame, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-100" },
  "Железо и анемия": { icon: Droplets, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-100" },
  "Витамины": { icon: Pill, color: "text-lime-600", bgColor: "bg-lime-50", borderColor: "border-lime-100" },
};

const defaultMeta = { icon: FlaskConical, color: "text-primary", bgColor: "bg-primary/5", borderColor: "border-primary/10" };

export default function IndicatorsV2Page() {
  const categories = getUsedCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <div className="hero-gradient">
          <div className="mx-auto max-w-5xl px-4 pt-12 pb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Справочник показателей
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              {indicators.length} лабораторных показателей с нормами, причинами отклонений
              и рекомендациями по подготовке
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-10">
          {/* Category grid */}
          {categories.map((cat) => {
            const meta = categoryMeta[cat] || defaultMeta;
            const Icon = meta.icon;
            const catIndicators = indicators.filter((i) => i.category === cat);

            return (
              <section key={cat} className="mb-10">
                {/* Category header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`h-10 w-10 rounded-xl ${meta.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${meta.color}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{cat}</h2>
                    <p className="text-xs text-muted-foreground">
                      {catIndicators.length}{" "}
                      {catIndicators.length === 1
                        ? "показатель"
                        : catIndicators.length < 5
                        ? "показателя"
                        : "показателей"}
                    </p>
                  </div>
                </div>

                {/* Cards grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catIndicators.map((ind) => (
                    <Link
                      key={ind.slug}
                      href={`/indicators/${ind.slug}`}
                      className={`group rounded-2xl border ${meta.borderColor} bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-[15px] leading-snug text-card-foreground group-hover:text-primary transition-colors">
                          {ind.name}
                        </h3>
                        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.color}`}>
                          {ind.shortName}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {ind.content.whatIs.slice(0, 120) + "..."}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Норма: {ind.referenceRange.male.length > 30 ? ind.referenceRange.male.slice(0, 30) + "..." : ind.referenceRange.male}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Подробнее</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {/* CTA */}
          <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(0,180,188,0.06)", border: "1px solid rgba(0,180,188,0.15)" }}>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Не хотите разбираться сами?
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Загрузите результаты анализов -- ИИ расшифрует каждый показатель,
              найдёт отклонения и даст персональные рекомендации
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-sm"
            >
              Расшифровать анализ за 249 &#8381;
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
