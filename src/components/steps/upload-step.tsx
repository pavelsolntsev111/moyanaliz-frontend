"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import {
  Upload,
  FileText,
  Brain,
  Clock,
  ShieldCheck,
  ChevronDown,
  Users,
  BarChart3,
  Star,
} from "lucide-react"

const benefits = [
  {
    icon: Brain,
    title: "ИИ-анализ",
    text: "Современный искусственный интеллект расшифровывает показатели с учётом пола и возраста",
  },
  {
    icon: FileText,
    title: "PDF-отчёт",
    text: "Получите понятный PDF-отчёт с пояснением каждого показателя на email",
  },
  {
    icon: Clock,
    title: "Быстрый результат",
    text: "Расшифровка занимает 30-60 секунд — быстрее, чем ожидание приёма врача",
  },
]

const labs = [
  { name: "Инвитро", logo: "/labs/invitro.png" },
  { name: "Гемотест", logo: "/labs/gemotest.png" },
  { name: "KDL", logo: "/labs/kdl.jpeg" },
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
          Расшифровка анализов{" "}
          <span className="text-primary">за 5 минут</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Загрузите свои анализы и получите понятный отчёт с пояснением каждого показателя
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
          }}
          className={`mt-8 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-all sm:p-14 ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50 hover:bg-primary/[0.02]"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Перетащите файл сюда или нажмите
          </p>
          <p className="text-sm text-muted-foreground">
            JPG, PNG или PDF до 10 МБ
          </p>
          <p className="mt-2 text-xs text-muted-foreground/80">
            Стоимость расшифровки — 199 ₽. Один показатель бесплатно.
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

        {/* Labs - on first screen for trust */}
        <div className="mt-10">
          <p className="text-sm font-medium text-muted-foreground">
            Работаем с результатами из любых лабораторий
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-8">
            {labs.map((lab) => (
              <div
                key={lab.name}
                className="relative h-24 w-56 grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100 sm:h-28 sm:w-64"
              >
                <Image
                  src={lab.logo}
                  alt={lab.name}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
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
              <p className="text-2xl font-bold text-foreground">10 000+</p>
              <p className="text-sm text-muted-foreground">расшифровок выполнено</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">98%</p>
              <p className="text-sm text-muted-foreground">точность распознавания</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">4.8</p>
              <p className="text-sm text-muted-foreground">средняя оценка пользователей</p>
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
