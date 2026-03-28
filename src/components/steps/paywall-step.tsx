"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { ymGoal } from "@/lib/ym"
import { motion } from "framer-motion"
import {
  Lock,
  Mail,
  Tag,
  Check,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  ArrowDown,
  AlertOctagon,
  ChevronRight,
  UtensilsCrossed,
  ListChecks,
  FileText,
  Apple,
  ClipboardList,
  TestTubes,
  MessageSquare,
  BarChart3,
  Clock,
} from "lucide-react"
import type { PreviewData, AnalysisIndicator, LightIndicator } from "@/lib/types"
import { IndicatorCard } from "@/components/indicator-card"
import { mockIndicators } from "@/lib/mock-data"
import { validatePromo } from "@/lib/api"
import type { PromoValidateResponse } from "@/lib/api"

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Health impact descriptions by indicator name (lowercase key) */
const HEALTH_IMPACT: Record<string, string> = {
  "витамин d": "иммунитет, настроение и здоровье костей",
  "витамин 25(oh) d": "иммунитет, настроение и здоровье костей",
  "витамин d 25(oh)": "иммунитет, настроение и здоровье костей",
  "25(oh)d": "иммунитет, настроение и здоровье костей",
  "ттг": "обмен веществ и работу щитовидной железы",
  "тиреотропный гормон": "обмен веществ и работу щитовидной железы",
  "ферритин": "запасы железа, энергию и состояние волос",
  "железо": "запасы железа, энергию и состояние волос",
  "железо сывороточное": "запасы железа, энергию и состояние волос",
  "глюкоза": "энергию, вес и риск диабета",
  "гемоглобин": "перенос кислорода и общую энергию",
  "холестерин": "здоровье сосудов и риск атеросклероза",
  "холестерин общий": "здоровье сосудов и риск атеросклероза",
  "лейкоциты": "иммунную защиту организма",
  "тромбоциты": "свёртываемость крови",
  "алт": "функцию печени",
  "аст": "функцию печени и сердца",
  "креатинин": "функцию почек",
  "мочевина": "функцию почек и белковый обмен",
  "билирубин": "функцию печени и обмен гемоглобина",
  "билирубин общий": "функцию печени и обмен гемоглобина",
  "общий белок": "белковый обмен и иммунитет",
  "кальций": "здоровье костей, мышц и нервной системы",
  "соэ": "наличие воспалительных процессов",
  "эритроциты": "перенос кислорода к тканям",
  "т4 свободный": "обмен веществ и работу щитовидной железы",
  "тироксин свободный": "обмен веществ и работу щитовидной железы",
}

function getHealthImpact(name: string): string | null {
  const key = name.toLowerCase().trim()
  return HEALTH_IMPACT[key] ?? null
}

function getDirectionText(status: AnalysisIndicator["status"]): string {
  if (status === "low") return "ниже"
  if (status === "high") return "выше"
  if (status === "critical") return "критически отклоняется от"
  return "вне"
}

/** Russian pluralization for "показатель" */
function pluralIndicators(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} показатель`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} показателя`
  return `${n} показателей`
}

function mapLightToAnalysis(ind: LightIndicator, index: number): AnalysisIndicator {
  const numValue = parseFloat(ind.value.replace(",", "."))
  const isNumeric = !isNaN(numValue) && ind.value.trim() !== ""

  let refMin = 0
  let refMax = 100
  let hasRange = false
  const minMaxMatch = ind.reference_range.match(/([\d.,]+)\s*[-–]\s*([\d.,]+)/)
  const ltMatch = ind.reference_range.match(/^[<до]\s*([\d.,]+)/u)
  const gtMatch = ind.reference_range.match(/^>\s*([\d.,]+)/)
  if (minMaxMatch) {
    refMin = parseFloat(minMaxMatch[1].replace(",", "."))
    refMax = parseFloat(minMaxMatch[2].replace(",", "."))
    hasRange = true
  } else if (ltMatch) {
    refMin = 0
    refMax = parseFloat(ltMatch[1].replace(",", "."))
    hasRange = true
  } else if (gtMatch) {
    const bound = parseFloat(gtMatch[1].replace(",", "."))
    refMin = bound
    refMax = bound * 3
    hasRange = true
  }

  let status: AnalysisIndicator["status"] = "normal"
  if (ind.status === "above_normal") status = "high"
  else if (ind.status === "below_normal") status = "low"
  else if (ind.status === "critical_high" || ind.status === "critical_low") status = "critical"

  return {
    id: `ind-${index}`,
    name: ind.name,
    shortName: ind.short_name,
    value: isNumeric ? numValue : 0,
    textValue: isNumeric ? undefined : ind.value,
    unit: ind.unit,
    status,
    referenceMin: refMin,
    referenceMax: refMax,
    hasRange,
    explanation: ind.what_is && ind.sources && ind.recommendation
      ? `${ind.what_is}\n\n${ind.sources}\n\n${ind.recommendation}`
      : ind.short_description || "",
  }
}

function selectOpenIndicators(indicators: AnalysisIndicator[]): {
  open: AnalysisIndicator[]
  lockedNormal: AnalysisIndicator[]
  lockedAbnormal: AnalysisIndicator[]
} {
  const normal = indicators.filter((i) => i.status === "normal")
  const abnormal = indicators.filter((i) => i.status !== "normal")

  // Sort abnormal by deviation (most deviated last — "tension buildup")
  const sortedAbnormal = [...abnormal].sort((a, b) => {
    const devA = a.referenceMax > 0 ? Math.abs(a.value - (a.referenceMin + a.referenceMax) / 2) / (a.referenceMax - a.referenceMin || 1) : 0
    const devB = b.referenceMax > 0 ? Math.abs(b.value - (b.referenceMin + b.referenceMax) / 2) / (b.referenceMax - b.referenceMin || 1) : 0
    return devA - devB
  })

  const total = indicators.length

  if (total === 1) {
    // Single indicator — always show as locked (blurred comments)
    return { open: [], lockedNormal: normal, lockedAbnormal: sortedAbnormal }
  }

  if (normal.length >= 1) {
    return { open: normal.slice(0, 1), lockedNormal: normal.slice(1), lockedAbnormal: sortedAbnormal }
  } else {
    return { open: [], lockedNormal: [], lockedAbnormal: sortedAbnormal }
  }
}

// ─── Range bar helpers ───────────────────────────────────────────────────────

function getRangePosition(value: number, min: number, max: number) {
  const range = max - min
  const padding = range * 0.3
  const totalMin = min - padding
  const totalMax = max + padding
  const totalRange = totalMax - totalMin
  const pos = ((value - totalMin) / totalRange) * 100
  return Math.max(2, Math.min(98, pos))
}

function getNormalZone(min: number, max: number) {
  const range = max - min
  const padding = range * 0.3
  const totalMin = min - padding
  const totalMax = max + padding
  const totalRange = totalMax - totalMin
  const left = ((min - totalMin) / totalRange) * 100
  const right = ((max - totalMin) / totalRange) * 100
  return { left, width: right - left }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function GradientCard({
  children,
  glowColor = "rgba(0,180,188,0.12)",
  className = "",
}: {
  children: React.ReactNode
  glowColor?: string
  className?: string
}) {
  return (
    <div
      style={{
        background: "var(--border)",
        borderRadius: 16,
        padding: "2px",
        boxShadow: `0 4px 8px rgba(0,0,0,0.05), 0 16px 40px ${glowColor}, 0 0 0 1px rgba(0,0,0,0.03)`,
      }}
      className={className}
    >
      <div
        style={{
          background: "linear-gradient(145deg, var(--card) 0%, var(--background) 100%)",
          borderRadius: "14px",
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** Emotional summary — dynamic text with health impact descriptions */
function EmotionalSummary({
  outOfRangeCount,
  totalCount,
  abnormalIndicators,
}: {
  outOfRangeCount: number
  totalCount: number
  abnormalIndicators: AnalysisIndicator[]
}) {
  const hasProblems = outOfRangeCount > 0
  const normalCount = totalCount - outOfRangeCount

  if (hasProblems) {
    // Build dynamic description with health impacts
    const shown = abnormalIndicators.slice(0, 3)
    const remaining = abnormalIndicators.length - shown.length

    const descriptions = shown.map((ind) => {
      const impact = getHealthImpact(ind.name)
      const direction = getDirectionText(ind.status)
      if (impact) {
        return `${ind.name} ${direction} нормы — это может влиять на ${impact}`
      }
      return `${ind.name} ${direction} нормы. Требует внимания`
    })

    let summaryText = descriptions.join(". ") + "."
    if (remaining > 0) {
      summaryText += ` И ещё ${remaining}.`
    }
    summaryText += " Подробный разбор и план действий — в полном отчёте."

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "rgba(255,82,62,0.04)",
          borderLeft: "4px solid #FF523E",
          borderRadius: "12px",
        }}
        className="p-4 sm:p-5"
      >
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 44, height: 44, background: "rgba(255,82,62,0.10)" }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: "#FF523E" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-card-foreground leading-snug">
              {outOfRangeCount === 1 ? "Обнаружено отклонение" : "Обнаружены отклонения"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {summaryText}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {normalCount > 0 && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "rgba(34,197,94,0.10)", color: "#16a34a" }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {normalCount} в норме
                </span>
              )}
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "rgba(255,82,62,0.10)", color: "#dc2626" }}
              >
                <AlertTriangle className="h-3 w-3" />
                {outOfRangeCount} вне нормы
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "rgba(34,197,94,0.05)",
        borderLeft: "4px solid #22c55e",
        borderRadius: "12px",
      }}
      className="p-4 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{ width: 44, height: 44, background: "rgba(34,197,94,0.10)" }}
        >
          <CheckCircle2 className="h-5 w-5" style={{ color: "#22c55e" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-card-foreground leading-snug">
            Все показатели в норме
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {totalCount === 1
              ? "Показатель в пределах референсных значений — отличная новость!"
              : `Все ${pluralIndicators(totalCount)} в пределах референсных значений — отличная новость!`}
            {" "}В полном отчёте: какие продукты и привычки помогут сохранить этот результат + персональный чек-лист профилактики.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/** Doctor questions teaser — ALL blurred */
function DoctorQuestionTeaser({ firstAbnormalName }: { firstAbnormalName?: string }) {
  const questions = [
    firstAbnormalName
      ? `Нужно ли мне принимать добавки ${firstAbnormalName} и в какой дозировке?`
      : "Как часто мне нужно пересдавать эти анализы?",
    "Насколько серьёзно моё отклонение и требует ли оно лечения?",
    "Через какое время стоит пересдать анализы для контроля?",
  ]

  return (
    <div>
      <GradientCard glowColor="rgba(0,180,188,0.10)">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: 36, height: 36, background: "rgba(0,180,188,0.10)" }}
              >
                <Stethoscope className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-card-foreground leading-snug">
                  Вопросы для вашего врача
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">На основе ваших результатов</p>
              </div>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: "rgba(0,180,188,0.10)", color: "var(--primary)" }}
            >
              3 вопроса
            </span>
          </div>

          <div className="mt-4 space-y-2 select-none" style={{ filter: "blur(4px)", opacity: 0.5, pointerEvents: "none" }}>
            {questions.map((q, i) => (
              <div key={i} className="rounded-lg p-3.5" style={{ background: i === 0 ? "rgba(0,180,188,0.05)" : "var(--muted)", border: `1px solid ${i === 0 ? "rgba(0,180,188,0.12)" : "var(--border)"}` }}>
                <div className="flex items-start gap-2.5">
                  <span
                    className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                    style={i === 0 ? { background: "var(--primary)", color: "#fff" } : { background: "rgba(0,0,0,0.1)", color: "var(--card)" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-card-foreground leading-relaxed">{q}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Lock className="h-3.5 w-3.5" />
            <span>Все вопросы — в полном отчёте</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </GradientCard>
    </div>
  )
}

/** Clean (non-blurred) report section teasers */
function ReportSectionTeasers() {
  const sections = [
    { icon: FileText, title: "Детальные комментарии по всем показателям" },
    { icon: UtensilsCrossed, title: "Рекомендации по питанию" },
    { icon: ListChecks, title: "Персональный чек-лист «Что делать дальше»" },
    { icon: TestTubes, title: "Рекомендации, какие анализы ещё сдать" },
    { icon: Stethoscope, title: "Вопросы для врача" },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-card-foreground text-center">В полном отчёте</h3>
      <div className="grid gap-2">
        {sections.map(({ icon: SIcon, title }) => (
          <div key={title} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(0,180,188,0.10)" }}>
              <SIcon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-card-foreground">{title}</span>
            <Lock className="ml-auto h-3.5 w-3.5 text-muted-foreground/40" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Locked NORMAL card — value + range, blurred interpretation, NO mini-CTA */
function LockedNormalCard({ indicator }: { indicator: AnalysisIndicator }) {
  const position = getRangePosition(indicator.value, indicator.referenceMin, indicator.referenceMax)
  const normalZone = getNormalZone(indicator.referenceMin, indicator.referenceMax)

  return (
    <div className="rounded-xl p-5 transition-shadow hover:shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{indicator.shortName}</p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-card-foreground">{indicator.name}</h3>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a" }}>
          <CheckCircle2 className="h-3 w-3" />
          Норма
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold" style={{ color: "#16a34a" }}>{indicator.textValue ?? indicator.value}</span>
        <span className="text-sm text-muted-foreground">{indicator.unit}</span>
      </div>
      {indicator.hasRange !== false && !indicator.textValue && (
        <div className="mt-3">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="absolute top-0 h-full rounded-full" style={{ left: `${normalZone.left}%`, width: `${normalZone.width}%`, background: "rgba(34,197,94,0.20)" }} />
            <div className="absolute top-0 h-full w-1.5 rounded-full" style={{ left: `${position}%`, transform: "translateX(-50%)", background: "#22c55e" }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{indicator.referenceMin} {indicator.unit}</span>
            <span style={{ color: "#22c55e" }}>норма</span>
            <span>{indicator.referenceMax} {indicator.unit}</span>
          </div>
        </div>
      )}
      {/* Blurred interpretation + CTA button */}
      <div className="relative mt-3">
        <div className="select-none" style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {indicator.explanation || "Показатель находится в пределах нормы. Рекомендации по поддержанию оптимального уровня и питанию."}
          </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(transparent 30%, rgba(255,255,255,0.85))" }}>
          <button
            onClick={() => {
              document.getElementById("paywall-email")?.scrollIntoView({ behavior: "smooth", block: "center" })
              setTimeout(() => {
                const el = document.getElementById("paywall-email")
                el?.focus()
                el?.classList.add("animate-shake")
                setTimeout(() => el?.classList.remove("animate-shake"), 600)
              }, 500)
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#16a34a" }}
          >
            Узнать детали
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/** Locked ABNORMAL card — left red border, pulsing marker, mini-CTA button */
function LockedAbnormalCard({ indicator }: { indicator: AnalysisIndicator }) {
  const statusConfig = {
    low:      { label: "Ниже нормы", badgeBg: "rgba(255,82,62,0.12)", badgeColor: "#dc2626", barColor: "#FF523E", valueColor: "#dc2626", Icon: ArrowDown },
    high:     { label: "Выше нормы", badgeBg: "rgba(255,82,62,0.12)", badgeColor: "#dc2626", barColor: "#FF523E", valueColor: "#dc2626", Icon: AlertTriangle },
    critical: { label: "Критически", badgeBg: "rgba(239,68,68,0.15)", badgeColor: "#dc2626", barColor: "#ef4444", valueColor: "#dc2626", Icon: AlertOctagon },
    normal:   { label: "Норма", badgeBg: "rgba(34,197,94,0.12)", badgeColor: "#16a34a", barColor: "#22c55e", valueColor: "#16a34a", Icon: CheckCircle2 },
  }
  const cfg = statusConfig[indicator.status]
  const Icon = cfg.Icon
  const position = getRangePosition(indicator.value, indicator.referenceMin, indicator.referenceMax)
  const normalZone = getNormalZone(indicator.referenceMin, indicator.referenceMax)

  return (
    <div
      className="rounded-xl p-5 transition-shadow hover:shadow-sm"
      style={{
        background: "rgba(255,82,62,0.04)",
        border: "1px solid rgba(255,82,62,0.20)",
        borderLeft: "4px solid #FF523E",
      }}
    >
      <style>{`
        @keyframes pulse-marker {
          0% { box-shadow: 0 0 0 0 rgba(255,82,62,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(255,82,62,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,82,62,0); }
        }
      `}</style>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{indicator.shortName}</p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug" style={{ color: "#dc2626" }}>{indicator.name}</h3>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: cfg.badgeBg, color: cfg.badgeColor }}>
          <Icon className="h-3 w-3" />
          {cfg.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold" style={{ color: cfg.valueColor }}>{indicator.textValue ?? indicator.value}</span>
        <span className="text-sm text-muted-foreground">{indicator.unit}</span>
      </div>

      {/* Enhanced range bar with danger zones + pulsing marker */}
      {indicator.hasRange !== false && !indicator.textValue && (
        <div className="mt-3">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            {/* Danger zone below normal */}
            <div
              className="absolute top-0 h-full rounded-l-full"
              style={{
                left: 0,
                width: `${normalZone.left}%`,
                background: "linear-gradient(to right, rgba(239,68,68,0.3), rgba(255,165,0,0.2))",
              }}
            />
            {/* Normal zone */}
            <div
              className="absolute top-0 h-full"
              style={{ left: `${normalZone.left}%`, width: `${normalZone.width}%`, background: "rgba(34,197,94,0.25)" }}
            />
            {/* Danger zone above normal */}
            <div
              className="absolute top-0 h-full rounded-r-full"
              style={{
                left: `${normalZone.left + normalZone.width}%`,
                width: `${100 - normalZone.left - normalZone.width}%`,
                background: "linear-gradient(to right, rgba(255,165,0,0.2), rgba(239,68,68,0.3))",
              }}
            />
            {/* Pulsing marker */}
            <div
              className="absolute top-1/2 rounded-full"
              style={{
                left: `${position}%`,
                transform: "translate(-50%, -50%)",
                width: 13,
                height: 13,
                background: cfg.barColor,
                animation: "pulse-marker 2s infinite",
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{indicator.referenceMin} {indicator.unit}</span>
            <span style={{ color: "#22c55e" }}>норма</span>
            <span>{indicator.referenceMax} {indicator.unit}</span>
          </div>
        </div>
      )}

      {/* Blurred interpretation + mini-CTA button */}
      <div className="relative mt-3">
        <div className="select-none" style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {indicator.explanation || "Подробная интерпретация показателя с рекомендациями по питанию, образу жизни и необходимым обследованиям."}
          </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(transparent 30%, rgba(255,255,255,0.85))" }}>
          <button
            onClick={() => {
              document.getElementById("paywall-email")?.scrollIntoView({ behavior: "smooth", block: "center" })
              document.getElementById("paywall-email")?.focus()
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#FF523E" }}
          >
            Узнать, что делать
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/** Inline paywall — personalized copy */
function InlinePaywall({
  email, setEmail, promoVisible, setPromoVisible, promoCode, setPromoCode,
  loading, emailValid, abnormalIndicators, totalCount, onPay, onPromo,
}: {
  email: string
  setEmail: (v: string) => void
  promoVisible: boolean
  setPromoVisible: (v: boolean) => void
  promoCode: string
  setPromoCode: (v: string) => void
  loading: boolean
  emailValid: boolean
  abnormalIndicators: AnalysisIndicator[]
  totalCount: number
  onPay: (email: string, promoCode?: string) => Promise<void>
  onPromo: (email: string, promoCode: string) => Promise<void>
}) {
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoResult, setPromoResult] = useState<PromoValidateResponse | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  const hasAbnormal = abnormalIndicators.length > 0
  const first = abnormalIndicators[0]

  const headline = "Получить полный отчёт"

  let subtitle: React.ReactNode
  if (abnormalIndicators.length === 1) {
    subtitle = <>Мы объясним, почему <span className="font-medium text-destructive">{first.name}</span> вне нормы и что с этим делать.</>
  } else if (abnormalIndicators.length >= 2) {
    const names = abnormalIndicators.slice(0, 3).map(i => i.name)
    const extra = abnormalIndicators.length - 3
    const joined = names.join(", ") + (extra > 0 ? ` и ещё ${extra}` : "")
    subtitle = <>Мы объясним отклонения в <span className="font-medium text-destructive">{joined}</span> и дадим план действий.</>
  } else {
    subtitle = "Подробный разбор каждого показателя и рекомендации по поддержанию здоровья."
  }

  const displayPrice = promoResult?.valid && !promoResult.free && promoResult.discounted_price
    ? promoResult.discounted_price
    : 199
  const hasDiscount = promoResult?.valid && !promoResult.free && promoResult.discounted_price

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return
    setPromoValidating(true)
    setPromoError(null)
    setPromoResult(null)
    try {
      const result = await validatePromo(promoCode.trim())
      if (result.valid && result.free) {
        // Free promo (e.g. "111") — use existing flow
        if (emailValid) {
          onPromo(email, promoCode.trim())
        } else {
          setPromoError("Введите email для применения промокода")
        }
        setPromoValidating(false)
        return
      }
      if (result.valid) {
        setPromoResult(result)
      } else {
        setPromoError(result.reason || "Промокод недействителен")
      }
    } catch {
      setPromoError("Ошибка проверки промокода")
    }
    setPromoValidating(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      id="paywall-block"
    >
      <GradientCard glowColor="rgba(0,180,188,0.16)">
        <div className="p-6 sm:p-7">
          <div className="text-center">
            <h3 className="text-xl font-bold text-card-foreground">
              {headline} —{" "}
              {hasDiscount ? (
                <>
                  <span className="line-through text-muted-foreground text-base font-normal">199 ₽</span>{" "}
                  <span style={{ color: "var(--primary)" }}>{displayPrice} ₽</span>
                </>
              ) : (
                <span style={{ color: "var(--primary)" }}>199 ₽</span>
              )}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">Вместо консультации терапевта за 2000+ ₽</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
          </div>

          <div className="mt-5">
            <label htmlFor="paywall-email" className="text-sm font-medium text-card-foreground">Email для отправки PDF-отчёта</label>
            <div className="relative mt-2">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="paywall-email"
                type="email"
                placeholder="example@mail.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </div>

          {!promoVisible ? (
            <button onClick={() => setPromoVisible(true)} className="mt-3 text-xs text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-primary">
              Есть промокод?
            </button>
          ) : (
            <div className="mt-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Введите промокод"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value)
                      setPromoResult(null)
                      setPromoError(null)
                    }}
                    className="w-full rounded-xl border-2 border-border bg-background py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleValidatePromo}
                  disabled={!promoCode.trim() || promoValidating || loading}
                  className="shrink-0 rounded-xl border-2 border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {promoValidating ? "..." : "Применить"}
                </button>
              </div>
              {promoError && (
                <p className="mt-2 text-xs text-destructive">{promoError}</p>
              )}
              {hasDiscount && promoResult && (
                <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(34,197,94,0.08)" }}>
                  <Check className="h-4 w-4 shrink-0" style={{ color: "#16a34a" }} />
                  <span className="text-xs text-card-foreground">
                    Скидка {promoResult.discount_percent}% применена. Осталось использований: {promoResult.uses_left}
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              if (emailValid) {
                ymGoal("click_get_report")
                onPay(email, hasDiscount ? promoCode.trim() : undefined)
              }
            }}
            disabled={!emailValid || loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00b4bc 0%, #00a0a8 100%)", boxShadow: "0 4px 16px rgba(0,180,188,0.35)" }}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Переход к оплате...
              </>
            ) : (
              <>
                Оплатить {displayPrice} ₽
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Urgency */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Ваши результаты сохранены на 24 часа</span>
          </div>

          {/* YooMoney badge */}
          <div className="mt-3 flex items-center justify-center gap-2 text-muted-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#8B3FFD"/>
              <path d="M13.5 7H11.2C9.43 7 8 8.43 8 10.2C8 11.97 9.43 13.4 11.2 13.4H12V17H13.5V7ZM12 12H11.2C10.21 12 9.5 11.19 9.5 10.2C9.5 9.21 10.31 8.5 11.2 8.5H12V12Z" fill="white"/>
            </svg>
            <span className="text-xs font-medium">Безопасная оплата через ЮMoney</span>
          </div>

          <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            Нажимая кнопку, вы соглашаетесь с{" "}
            <a href="/offer" className="underline hover:text-primary">офертой</a>{" "}и{" "}
            <a href="/privacy" className="underline hover:text-primary">политикой конфиденциальности</a>
          </p>
        </div>
      </GradientCard>
    </motion.div>
  )
}

/** Bottom CTA card + sticky mobile button */
function BottomCTA({ totalCount, onPay, email, emailValid, loading }: {
  totalCount: number
  onPay: () => void
  email: string
  emailValid: boolean
  loading: boolean
}) {
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    // Show sticky CTA after 3 seconds for better mobile conversion
    const timer = setTimeout(() => setShowSticky(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Sticky mobile CTA */}
      {showSticky && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border p-3 sm:hidden"
          style={{ background: "var(--background)", boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}
        >
          <button
            onClick={() => {
              if (emailValid) {
                onPay()
              } else {
                document.getElementById("paywall-email")?.scrollIntoView({ behavior: "smooth", block: "center" })
                document.getElementById("paywall-email")?.focus()
              }
            }}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00b4bc 0%, #00a0a8 100%)" }}
          >
            Полный отчёт — 199 ₽
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface PaywallStepProps {
  orderId: string
  preview: PreviewData | null
  onPay: (email: string, promoCode?: string) => Promise<void>
  onPromo: (email: string, promoCode: string) => Promise<void>
  loading: boolean
}

export function PaywallStep({ onPay, onPromo, loading, preview }: PaywallStepProps) {
  const [email, setEmail] = useState("")
  const [promoVisible, setPromoVisible] = useState(false)
  const [promoCode, setPromoCode] = useState("")

  const allIndicators = useMemo(() => {
    if (preview?.indicators?.length) {
      return preview.indicators.map(mapLightToAnalysis)
    }
    return mockIndicators
  }, [preview])

  const totalCount = preview?.meta?.total_count ?? allIndicators.length
  const abnormalIndicators = useMemo(() => allIndicators.filter((i) => i.status !== "normal"), [allIndicators])
  // Use actual abnormal count from mapped indicators (backend meta may be stale/wrong)
  const outOfRangeCount = abnormalIndicators.length > 0
    ? abnormalIndicators.length
    : (preview?.meta?.out_of_range_count ?? 0)

  const { open, lockedNormal, lockedAbnormal } = useMemo(
    () => selectOpenIndicators(allIndicators),
    [allIndicators]
  )

  const emailValid = isValidEmail(email)

  const hasLockedContent = lockedAbnormal.length > 0 || lockedNormal.length > 0

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Результаты анализа</h2>
        {outOfRangeCount > 0 && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            <span className="font-medium" style={{ color: "#dc2626" }}>{outOfRangeCount} из {totalCount} вне нормы</span>
          </p>
        )}
      </motion.div>

      {/* ── 1. Emotional summary ── */}
      <div className="mt-6">
        <EmotionalSummary outOfRangeCount={outOfRangeCount} totalCount={totalCount} abnormalIndicators={abnormalIndicators} />
      </div>

      {/* ── 2. Open cards (1 normal, expanded) ── */}
      {open.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Предварительные результаты</p>
          <div className="grid gap-4">
            {open.map((ind) => (
              <IndicatorCard key={ind.id} indicator={ind} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── 3. Locked indicator cards (max 3, abnormal first) ── */}
      {(lockedAbnormal.length > 0 || lockedNormal.length > 0) && (() => {
        const allLocked = [...lockedAbnormal, ...lockedNormal]
        const isSingle = totalCount === 1
        const shown = allLocked.slice(0, 3)
        const remaining = allLocked.length - shown.length
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="mt-8">
            {!isSingle && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Остальные показатели — {allLocked.length}
              </p>
            )}
            <div className="grid gap-3">
              {shown.map((ind) =>
                ind.status !== "normal"
                  ? <LockedAbnormalCard key={ind.id} indicator={ind} />
                  : <LockedNormalCard key={ind.id} indicator={ind} />
              )}
            </div>
            {remaining > 0 && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                …а также ещё {pluralIndicators(remaining)}
              </p>
            )}
          </motion.div>
        )
      })()}

      {/* ── 4. Inline Paywall (moved above teasers for better conversion) ── */}
      <div className="mt-8">
        <InlinePaywall
          email={email} setEmail={setEmail} promoVisible={promoVisible} setPromoVisible={setPromoVisible}
          promoCode={promoCode} setPromoCode={setPromoCode} loading={loading} emailValid={emailValid}
          abnormalIndicators={abnormalIndicators} totalCount={totalCount} onPay={onPay} onPromo={onPromo}
        />
      </div>

      {/* ── 5. Report section teasers (clean, not blurred) ── */}
      <div className="mt-8">
        <ReportSectionTeasers />
      </div>

      {/* ── 6. Bottom CTA + sticky mobile ── */}
      <BottomCTA
        totalCount={totalCount}
        onPay={() => emailValid && onPay(email)}
        email={email}
        emailValid={emailValid}
        loading={loading}
      />
    </div>
  )
}
