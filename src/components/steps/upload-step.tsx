"use client"

import { useCallback, useRef, useState } from "react"
import { ymGoal } from "@/lib/ym"
import {
  Upload,
  Shield,
  FileText,
  Clock,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Apple,
  ClipboardList,
  TestTubes,
  MessageSquare,
  BarChart3,
  Star,
  Users,
  Lock,
  FileDown,
} from "lucide-react"

/* ─── Inline range bar ─── */
function DemoRangeBar({
  value,
  min,
  max,
  unit,
  color,
}: {
  value: number
  min: number
  max: number
  unit: string
  color: string
}) {
  const range = max - min
  const padding = range * 0.3
  const totalMin = min - padding
  const totalMax = max + padding
  const totalRange = totalMax - totalMin
  const pos = Math.max(2, Math.min(98, ((value - totalMin) / totalRange) * 100))
  const normLeft = ((min - totalMin) / totalRange) * 100
  const normWidth = ((max - totalMin) / totalRange) * 100 - normLeft

  return (
    <div className="mt-3">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute top-0 h-full rounded-full bg-success/20"
          style={{ left: `${normLeft}%`, width: `${normWidth}%` }}
        />
        <div
          className={`absolute top-0 h-full w-1.5 rounded-full ${color}`}
          style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>
          {min} {unit}
        </span>
        <span className="text-success">норма</span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  )
}

/* ─── Analysis types chips ─── */
const analysisTypes = [
  "Общий анализ крови",
  "Биохимия",
  "Витамины",
  "Гормоны щитовидной железы",
  "Железо и ферритин",
  "Глюкоза и HbA1c",
  "Анализ мочи",
  "Копрограмма",
  "ИППП",
  "Аллергология",
  "Свёртываемость",
]

const moreAnalysisTypes = [
  "Липидный профиль",
  "Печёночные пробы",
  "Почечные пробы",
  "Электролиты",
  "Общий белок и фракции",
  "С-реактивный белок",
  "Ревматоидный фактор",
  "Гомоцистеин",
  "Фолиевая кислота",
  "Витамин B12",
  "Кальций и фосфор",
  "Магний",
  "Цинк и селен",
  "Пролактин",
  "Тестостерон",
  "Эстрадиол",
  "Прогестерон",
  "Кортизол",
  "Инсулин",
  "Мочевая кислота",
  "Гликированный гемоглобин",
  "Ферритин",
  "Трансферрин",
  "Фибриноген",
  "D-димер",
  "Антитела к ТПО",
  "Иммуноглобулины",
  "Группа крови и резус-фактор",
]

/* ─── FAQ data ─── */
const faqItems = [
  {
    q: "Как работает расшифровка анализов?",
    a: "Вы загружаете PDF или фото анализа, наш ИИ извлекает все показатели, сравнивает с референсными значениями и даёт понятные объяснения на простом языке с рекомендациями по питанию и образу жизни.",
  },
  {
    q: "Какие анализы можно расшифровать?",
    a: "Общий и биохимический анализ крови, гормоны щитовидной железы, витамины, анализ мочи, копрограмму, ИППП, ВИЧ/сифилис/гепатит и многие другие лабораторные исследования.",
  },
  {
    q: "Это заменяет консультацию врача?",
    a: "Нет. Сервис носит информационный характер и помогает лучше понять результаты анализов. Для постановки диагноза и назначения лечения обязательно обратитесь к врачу.",
  },
  {
    q: "Как быстро я получу результат?",
    a: "Предварительный результат появляется сразу после загрузки — за 30 секунд. Полный отчёт с детальными рекомендациями формируется в течение 1-2 минут после оплаты.",
  },
  {
    q: "Мои данные в безопасности?",
    a: "Да. Файлы передаются по зашифрованному каналу, хранятся в защищённом облачном хранилище и не передаются третьим лицам. Мы соблюдаем закон о персональных данных.",
  },
]

/* ─── Teaser data (5 items) ─── */
const teaserItems = [
  {
    icon: BarChart3,
    title: "Расшифровка всех показателей из анализа",
    desc: "Каждый показатель объяснён простым языком — что означает, почему важен, в какую сторону отклоняется",
    borderColor: "border-l-teal-500",
  },
  {
    icon: Apple,
    title: "Рекомендации по питанию",
    desc: "Конкретные продукты и нутриенты для каждого отклонения от нормы",
    borderColor: "border-l-emerald-500",
  },
  {
    icon: ClipboardList,
    title: 'Персональный чек-лист "Что делать дальше"',
    desc: "Пошаговый план действий по нормализации показателей — от питания до образа жизни",
    borderColor: "border-l-blue-500",
  },
  {
    icon: TestTubes,
    title: "Рекомендации, какие анализы ещё сдать",
    desc: "Какие исследования дополнительно пройти для уточнения полной картины здоровья",
    borderColor: "border-l-amber-500",
  },
  {
    icon: MessageSquare,
    title: "Вопросы для врача",
    desc: "Готовый список вопросов, чтобы визит к специалисту был максимально продуктивным",
    borderColor: "border-l-purple-500",
  },
]

interface UploadStepProps {
  onFileSelected: (file: File) => void
}

export function UploadStep({ onFileSelected }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ]
      if (allowed.includes(file.type)) {
        ymGoal("click_upload"); // 2. Клик "Загрузить анализ"
        onFileSelected(file)
      }
    },
    [onFileSelected]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="flex flex-col">
      {/* ─── Hero with gradient background ─── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 60% 30%, rgba(0,180,188,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 30% 60%, rgba(0,180,188,0.05) 0%, transparent 60%)",
        }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:grid-cols-2 md:items-center md:py-10">
          {/* Left */}
          <div className="relative z-10 min-w-0 animate-fade-up">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Узнайте, что означают{" "}
              <span className="text-primary">ваши анализы</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Загрузите результаты из любой лаборатории — получите понятную
              расшифровку с рекомендациями по питанию и образу жизни.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Первые показатели — <span className="font-semibold text-foreground">бесплатно</span>. Полный отчёт — <span className="font-semibold text-primary">199 ₽</span>
            </p>

            {/* Analysis types chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {analysisTypes.map((type) => (
                <span
                  key={type}
                  className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {type}
                </span>
              ))}
              {/* "и другие" chip with hover popup */}
              <span className="group relative flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground cursor-default">
                а также другие анализы
                <div className="pointer-events-none absolute bottom-full left-0 z-[9999] mb-2 w-[420px] origin-bottom-left scale-95 rounded-xl border border-border bg-card p-4 opacity-0 shadow-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
                  <p className="mb-2.5 text-xs font-semibold text-foreground">
                    Также распознаём:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {moreAnalysisTypes.map((type) => (
                      <span
                        key={type}
                        className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </span>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="cta-glow mt-7 inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 md:py-3.5 text-base md:text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Upload className="h-4 w-4" />
              Загрузить анализ
            </button>

            {/* Lab logos — mobile only (inside hero) */}
            <div className="mt-6 overflow-hidden md:hidden">
              <p className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                Распознаём анализы из любой лаборатории
              </p>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-transparent to-transparent" />
                <div className="animate-marquee flex w-max items-center gap-12">
                  {[...Array(2)].map((_, dup) => (
                    <div key={dup} className="flex items-center gap-12">
                      <img src="/labs/invitro.png" alt="Инвитро" height={24} style={{maxHeight:24}} className="h-6 w-auto object-contain opacity-50 grayscale" />
                      <img src="/labs/gemotest.png" alt="Гемотест" height={24} style={{maxHeight:24}} className="h-6 w-auto object-contain opacity-50 grayscale" />
                      <img src="/labs/kdl.png" alt="KDL" height={24} style={{maxHeight:24}} className="h-6 w-auto object-contain opacity-50 grayscale" />
                      <img src="/labs/helix.png" alt="Helix" height={48} style={{maxHeight:48}} className="h-12 w-auto object-contain opacity-50 grayscale" />
                      <img src="/labs/citilab.png" alt="Ситилаб" height={24} style={{maxHeight:24}} className="h-6 w-auto object-contain opacity-50 grayscale" />
                      <img src="/labs/cl.png" alt="CL" height={24} style={{maxHeight:24}} className="h-6 w-auto object-contain opacity-50 grayscale" />
                      <img src="/labs/dnkom.png" alt="ДНКОМ" height={24} style={{maxHeight:24}} className="h-6 w-auto object-contain opacity-50 grayscale" />
                      <img src="/labs/dialab.png" alt="Диалаб" height={24} style={{maxHeight:24}} className="h-6 w-auto object-contain opacity-50 grayscale" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Upload card (soft shadow) */}
          <div className="hidden md:block animate-fade-up delay-200">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`rounded-2xl bg-card p-6 shadow-lg shadow-black/[0.04] transition-all hover:shadow-xl hover:shadow-black/[0.06] ${
                dragActive ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
            >
              <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/40">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Перетащите файл сюда
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, JPEG, PNG, WebP, HEIC — до 20 МБ
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <FileText className="h-4 w-4" />
                  Выбрать файл
                </button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Данные зашифрованы и защищены</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,image/heic,image/heif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </section>

      {/* ─── Lab logos marquee (desktop only) ─── */}
      <section className="hidden md:block overflow-hidden bg-muted/20 pb-4 pt-2">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
          Распознаём анализы из любой лаборатории
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-muted/20 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-muted/20 to-transparent" />
          <div className="animate-marquee flex w-max items-center gap-16">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-16">
                <img src="/labs/invitro.png" alt="Инвитро" height={28} style={{maxHeight:28}} className="h-7 w-auto object-contain opacity-50 grayscale" />
                <img src="/labs/gemotest.png" alt="Гемотест" height={28} style={{maxHeight:28}} className="h-7 w-auto object-contain opacity-50 grayscale" />
                <img src="/labs/kdl.png" alt="KDL" height={28} style={{maxHeight:28}} className="h-7 w-auto object-contain opacity-50 grayscale" />
                <img src="/labs/helix.png" alt="Helix" height={56} style={{maxHeight:56}} className="h-14 w-auto object-contain opacity-50 grayscale" />
                <img src="/labs/citilab.png" alt="Ситилаб" height={28} style={{maxHeight:28}} className="h-7 w-auto object-contain opacity-50 grayscale" />
                <img src="/labs/cl.png" alt="CL" height={28} style={{maxHeight:28}} className="h-7 w-auto object-contain opacity-50 grayscale" />
                <img src="/labs/dnkom.png" alt="ДНКОМ" height={28} style={{maxHeight:28}} className="h-7 w-auto object-contain opacity-50 grayscale" />
                <img src="/labs/dialab.png" alt="Диалаб" height={28} style={{maxHeight:28}} className="h-7 w-auto object-contain opacity-50 grayscale" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Preview Cards ─── */}
      <section className="border-t border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground">
            Пример расшифровки
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {/* Albumin — normal */}
            <div className="animate-fade-up delay-200 rounded-xl bg-card p-6 shadow-lg shadow-black/[0.04] transition-shadow hover:shadow-lg hover:shadow-emerald-500/[0.08]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">ALB</p>
                  <h3 className="mt-0.5 text-sm font-semibold text-card-foreground">
                    Альбумин
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  Норма
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-success">50</span>
                <span className="text-sm text-muted-foreground">г/л</span>
              </div>
              <DemoRangeBar value={50} min={35} max={52} unit="г/л" color="bg-success" />
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Что это:</span>{" "}
                  Альбумин — основной белок крови, вырабатывается печенью. Отвечает за поддержание давления в сосудах и транспорт веществ.
                </p>
                <p>
                  <span className="font-medium text-foreground">Источники:</span>{" "}
                  Содержится в яйцах, молочных продуктах, мясе, рыбе. Синтез поддерживается полноценным питанием и здоровой печенью.
                </p>
                <p>
                  <span className="font-medium text-foreground">Ваш результат:</span>{" "}
                  50 г/л — в пределах нормы. Организм хорошо синтезирует белок. Продолжайте сбалансированное питание.
                </p>
              </div>
            </div>
            {/* Vitamin D — below normal */}
            <div className="animate-fade-up delay-300 rounded-xl bg-card p-6 shadow-lg shadow-black/[0.04] transition-shadow hover:shadow-lg hover:shadow-orange-500/[0.08]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    25-OH Vitamin D
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-card-foreground">
                    Витамин D
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning px-2.5 py-1 text-xs font-semibold text-warning-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  Ниже нормы
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-warning">18</span>
                <span className="text-sm text-muted-foreground">нг/мл</span>
              </div>
              <DemoRangeBar value={18} min={30} max={100} unit="нг/мл" color="bg-warning" />
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Что это:</span>{" "}
                  Витамин D — жирорастворимый витамин, ключевой для усвоения кальция, иммунитета и здоровья костей.
                </p>
                <p>
                  <span className="font-medium text-foreground">Источники:</span>{" "}
                  Жирная рыба (лосось, скумбрия), яичные желтки, обогащённые продукты. Вырабатывается кожей при воздействии солнечного света.
                </p>
                <p>
                  <span className="font-medium text-foreground">Ваш результат:</span>{" "}
                  18 нг/мл — ниже нормы. Рекомендуется увеличить время на солнце, добавить в рацион жирную рыбу и обсудить приём добавок с врачом.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Teaser blocks ─── */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground">
            Что входит в полный отчёт
          </h2>
          <div className="mt-8 space-y-4">
            {teaserItems.map((item, i) => (
              <div
                key={item.title}
                className={`animate-fade-up delay-${(i + 1) * 100} rounded-xl bg-card p-5 shadow-lg shadow-black/[0.04] border-l-4 ${item.borderColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground">
            Почему выбирают нас
          </h2>
          <div className="mt-8 space-y-4">
            {[
              {
                icon: Clock,
                title: "Результат за 30 секунд",
                desc: "Моментальная расшифровка сразу после загрузки файла — не нужно ждать",
              },
              {
                icon: FileText,
                title: "Понятный язык",
                desc: "Без медицинского жаргона — простые объяснения для каждого показателя",
              },
              {
                icon: FileDown,
                title: "PDF-отчёт на email",
                desc: "Полный отчёт в формате PDF отправляется на вашу электронную почту",
              },
              {
                icon: Shield,
                title: "Гарантия возврата",
                desc: "Если сервис не сформировал отчёт — вернём деньги",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-xl bg-card px-6 py-5 shadow-lg shadow-black/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-t border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: Users,
                value: "10 000+",
                label: "расшифровок выполнено",
              },
              { icon: Clock, value: "2 мин", label: "среднее время получения отчёта" },
              { icon: Star, value: "4.8", label: "средняя оценка пользователей" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center rounded-xl bg-card px-6 py-8 text-center shadow-lg shadow-primary/[0.06]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-foreground">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="animate-fade-up text-center text-2xl font-bold text-foreground">
            Частые вопросы
          </h2>
          <div className="mt-8 space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl bg-card shadow-lg shadow-black/[0.04]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="border-t border-border/50 px-5 py-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="border-t border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="animate-fade-up text-2xl font-bold text-foreground">
            Готовы расшифровать свои анализы?
          </h2>
          <p className="animate-fade-up delay-100 mt-3 text-sm text-muted-foreground">
            Загрузите результаты — первые показатели бесплатно. Полный отчёт
            всего 199 рублей.
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="cta-glow animate-fade-up delay-200 mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            Загрузить анализ
          </button>
          <p className="animate-fade-up delay-300 mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Безопасно и конфиденциально
          </p>
        </div>
      </section>
    </div>
  )
}
