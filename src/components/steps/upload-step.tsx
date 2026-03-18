"use client"

import { useCallback, useRef, useState } from "react"
import {
  Upload,
  MessageCircle,
  Stethoscope,
  Clock,
  ShieldCheck,
  ChevronDown,
  Users,
  BarChart3,
  Star,
  CheckCircle2,
  Search,
  FileText,
  Lock,
  ArrowRight,
  UtensilsCrossed,
  ListChecks,
  FlaskConical,
} from "lucide-react"

const benefits = [
  {
    icon: MessageCircle,
    title: "Понятным языком",
    text: "Каждый показатель объяснён просто и с рекомендациями — никакого медицинского жаргона",
  },
  {
    icon: Stethoscope,
    title: "Что спросить у врача",
    text: "Получите список вопросов для врача на основе именно ваших результатов",
  },
  {
    icon: Clock,
    title: "Готово за 30 секунд",
    text: "Загрузите фото анализа — и сразу получите разбор",
  },
]

const labs = [
  { name: "Инвитро", logo: "/labs/invitro.png" },
  { name: "Гемотест", logo: "/labs/gemotest.png" },
  { name: "KDL", logo: "/labs/kdl.png" },
]

const faqItems = [
  {
    q: "Какие анализы можно загрузить?",
    a: "Общий анализ крови (ОАК), биохимический анализ крови, общий анализ мочи и другие стандартные лабораторные исследования. Подходят результаты из любой лаборатории.",
  },
  {
    q: "В каком формате загружать файл?",
    a: "Поддерживаются фотографии (JPG, PNG) и PDF-файлы. Убедитесь, что текст на изображении читаем — без бликов и размытия.",
  },
  {
    q: "Насколько точна расшифровка?",
    a: "Мы используем модель Claude от Anthropic — одну из лучших в мире по работе с медицинскими данными. Точность интерпретации сопоставима с рекомендациями терапевта.",
  },
  {
    q: "Это заменяет визит к врачу?",
    a: "Нет. Сервис помогает понять результаты анализов, но не является медицинской консультацией. При отклонениях рекомендуем обратиться к специалисту.",
  },
  {
    q: "Мои данные в безопасности?",
    a: "Да. Загруженные файлы обрабатываются и удаляются. Мы не храним медицинские данные и не передаём их третьим лицам.",
  },
  {
    q: "Можно ли получить возврат?",
    a: "Если сервис не смог распознать анализ, мы вернём деньги в полном объёме. Напишите на support@moyanaliz.ru.",
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
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero + Upload zone */}
      <section className="mx-auto w-full max-w-3xl px-4 pt-10 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Узнайте, что означают{" "}
          <span className="text-primary">ваши анализы</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Загрузите фото или PDF из любой лаборатории — мы найдём отклонения,
          объясним каждый показатель и подскажем, что спросить у врача
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`mt-8 rounded-2xl border-2 border-dashed p-6 transition-all sm:p-8 ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          {/* Mini value props inside drop zone */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground mb-5">
            <span className="inline-flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Разбор каждого показателя
            </span>
            <span className="inline-flex items-center gap-1">
              <Search className="h-3.5 w-3.5 text-primary" />
              Поиск отклонений
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
              Вопросы для врача
            </span>
          </div>

          {/* CTA button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98]"
          >
            <Upload className="h-5 w-5" />
            Загрузить анализы — бесплатно
          </button>

          <p className="mt-3 text-xs text-muted-foreground/70">
            JPG, PNG или PDF до 10 МБ
          </p>

          {/* Hidden drag-and-drop area hint for desktop */}
          <p className="mt-1 hidden text-xs text-muted-foreground/50 sm:block">
            или перетащите файл в эту область
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>

        {/* Compact social proof + speed badge */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary/60" />
            Результат за 30 секунд
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary/60" />
            10 000+ расшифровок
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary/60" />
            99% точность
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary/60" />
            Оценка 4.8
          </span>
        </div>

        {/* Labs */}
        <div className="mt-10">
          <p className="text-sm font-medium text-muted-foreground">
            Распознаём анализы из любой лаборатории
          </p>
          <div className="mt-5 flex items-center justify-center gap-12 sm:gap-16">
            {labs.map((lab) => (
              <img
                key={lab.name}
                src={lab.logo}
                alt={lab.name}
                className="h-8 w-auto grayscale opacity-50 transition-all hover:grayscale-0 hover:opacity-100 sm:h-10"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Result preview */}
      <section className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-center text-xl font-bold text-foreground sm:text-2xl">
          Как будет выглядеть расшифровка
        </h2>

        {/* Badge */}
        <div className="mt-5 flex justify-center">
          <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-medium text-muted-foreground">
            Пример отчёта
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Preview card 1: Albumin - normal */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-foreground">Альбумин</span>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                Норма
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">50</span>
              <span className="text-xs text-muted-foreground">г/л</span>
              <span className="text-[10px] text-muted-foreground ml-auto">норма: 35–52</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500" />
            </div>
            <div className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Основной белок крови, поддерживает онкотическое давление и транспорт веществ. Ваш уровень в пределах нормы. Поддерживается белковой пищей: мясо, рыба, яйца.
            </div>
          </div>

          {/* Preview card 2: Vitamin D - abnormal */}
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderLeft: "4px solid #FF523E" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-sm font-medium text-orange-600">Витамин D</span>
              </div>
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                Ниже нормы
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">18</span>
              <span className="text-xs text-muted-foreground">нг/мл</span>
              <span className="text-[10px] text-muted-foreground ml-auto">норма: 30–100</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[18%] rounded-full bg-gradient-to-r from-red-400 to-orange-400" />
            </div>
            <div className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Влияет на иммунитет, настроение и здоровье костей. Кальций пока в норме, но при сниженном витамине D его усвоение может ухудшиться. Рекомендуется: жирная рыба, яичные желтки, прогулки на солнце. Пересдать через 3 месяца.
            </div>
          </div>

          {/* + all other indicators */}
          <div className="rounded-xl border border-border bg-card px-4 py-3 sm:col-span-2 text-center text-sm text-muted-foreground">
            + все остальные ваши показатели из анализа
          </div>
        </div>

        {/* Teaser blocks — show report scope */}
        <div className="mt-4 flex flex-col gap-2.5">
          {[
            { icon: UtensilsCrossed, text: "Рекомендации по питанию с учётом всех ваших показателей и возраста" },
            { icon: ListChecks, text: "Персональный чек-лист «Что делать дальше»" },
            { icon: FlaskConical, text: "Рекомендации, какие анализы ещё сдать" },
            { icon: Stethoscope, text: "Вопросы, которые надо обсудить с врачом" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3.5"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground leading-snug">{text}</span>
            </div>
          ))}
        </div>

        {/* Mini CTA */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" />
            Загрузить свои анализы — бесплатно
          </button>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto w-full max-w-5xl px-4">
        <div className="grid gap-6 sm:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust block */}
      <section className="mx-auto w-full max-w-4xl px-4">
        <div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-8">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">Более 10 тыс</p>
              <p className="text-sm text-muted-foreground">Расшифровок выполнено</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">99%+</p>
              <p className="text-sm text-muted-foreground">Точность распознавания</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">4.8</p>
              <p className="text-sm text-muted-foreground">Средняя оценка пользователей</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto w-full max-w-3xl px-4">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Сервис не является медицинской организацией и не ставит диагнозы.
            Результаты расшифровки носят информационный характер. При
            отклонениях показателей обратитесь к лечащему врачу.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-center text-xl font-bold text-foreground sm:text-2xl">
          Частые вопросы
        </h2>
        <div className="mt-6 flex flex-col gap-2">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-foreground pr-4">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
