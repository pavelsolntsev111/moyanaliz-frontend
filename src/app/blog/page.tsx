import Link from "next/link";
import { articles } from "@/lib/blog-data";

export const metadata = {
  title: "Блог — Мой Анализ | Статьи о расшифровке анализов",
  description:
    "Полезные статьи о расшифровке анализов крови: гемоглобин, холестерин, глюкоза, лейкоциты, печёночные пробы и другие показатели здоровья.",
};

const categoryColors: Record<string, string> = {
  "Анализы крови": "bg-primary/10 text-primary",
  "Показатели крови": "bg-blue-50 text-blue-600",
  Биохимия: "bg-amber-50 text-amber-700",
  Гормоны: "bg-purple-50 text-purple-600",
};

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <Link
          href="/"
          className="text-sm text-muted hover:text-primary transition mb-4 inline-block"
        >
          &larr; На главную
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold">Блог</h1>
        <p className="text-muted mt-2 max-w-xl">
          Статьи о показателях здоровья, расшифровке анализов и профилактике —
          простым языком, с опорой на доказательную медицину.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/blog/${a.slug}`}
            className="group rounded-2xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  categoryColors[a.category] || "bg-card text-muted"
                }`}
              >
                {a.category}
              </span>
              <span className="text-xs text-muted">{a.readTime}</span>
            </div>
            <h2 className="font-semibold text-[15px] leading-snug mb-2 group-hover:text-primary transition-colors">
              {a.title}
            </h2>
            <p className="text-sm text-muted leading-relaxed line-clamp-3">
              {a.description}
            </p>
            <div className="mt-4 text-xs text-muted">
              {new Date(a.date).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
