"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { ymGoal } from "@/lib/ym"
import { motion } from "framer-motion"
import {
  Lock,
  Tag,
  Mail,
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
  // Витамины
  "витамин d": "иммунитет, настроение и здоровье костей",
  "витамин 25(oh) d": "иммунитет, настроение и здоровье костей",
  "витамин d 25(oh)": "иммунитет, настроение и здоровье костей",
  "витамин d (25-гидроксикальциферол)": "иммунитет, настроение и здоровье костей",
  "25(oh)d": "иммунитет, настроение и здоровье костей",
  "25-oh витамин d": "иммунитет, настроение и здоровье костей",
  "витамин b12": "нервную систему и кроветворение",
  "витамин в12": "нервную систему и кроветворение",
  "кобаламин": "нервную систему и кроветворение",
  "фолиевая кислота": "кроветворение и здоровье нервной системы",
  "витамин b9": "кроветворение и здоровье нервной системы",
  // Щитовидная железа
  "ттг": "обмен веществ и работу щитовидной железы",
  "тиреотропный гормон": "обмен веществ и работу щитовидной железы",
  "т4 свободный": "обмен веществ и работу щитовидной железы",
  "тироксин свободный": "обмен веществ и работу щитовидной железы",
  "т3 свободный": "обмен веществ и работу щитовидной железы",
  "трийодтиронин свободный": "обмен веществ и работу щитовидной железы",
  // Железо и анемия
  "ферритин": "запасы железа, энергию и состояние волос",
  "железо": "запасы железа, энергию и состояние волос",
  "железо сывороточное": "запасы железа, энергию и состояние волос",
  // Общий анализ крови
  "гемоглобин": "перенос кислорода и общую энергию",
  "эритроциты": "перенос кислорода к тканям",
  "гематокрит": "объём красных клеток крови и вязкость крови",
  "лейкоциты": "иммунную защиту организма",
  "тромбоциты": "свёртываемость крови",
  "лимфоциты": "иммунную защиту и борьбу с вирусами",
  "моноциты": "иммунную защиту и борьбу с хроническими инфекциями",
  "эозинофилы": "аллергические реакции и защиту от паразитов",
  "базофилы": "аллергические и воспалительные реакции",
  "нейтрофилы": "иммунную защиту от бактерий",
  "палочкоядерные нейтрофилы": "иммунную защиту и наличие острого воспаления",
  "сегментоядерные нейтрофилы": "иммунную защиту от бактериальных инфекций",
  "соэ": "наличие воспалительных процессов",
  "скорость оседания эритроцитов": "наличие воспалительных процессов",
  // Эритроцитарные индексы
  "средний объём эритроцита": "размер эритроцитов и тип анемии",
  "средний объем эритроцита": "размер эритроцитов и тип анемии",
  "mcv": "размер эритроцитов и тип анемии",
  "среднее содержание гемоглобина в эритроците": "насыщение эритроцитов гемоглобином",
  "mch": "насыщение эритроцитов гемоглобином",
  "средняя концентрация гемоглобина в эритроците": "концентрацию гемоглобина в эритроцитах",
  "средняя концентрация гемоглобина в эритроцитах": "концентрацию гемоглобина в эритроцитах",
  "mchc": "концентрацию гемоглобина в эритроцитах",
  "rdw": "однородность размера эритроцитов",
  "ширина распределения эритроцитов": "однородность размера эритроцитов",
  // Биохимия
  "глюкоза": "энергию, вес и риск диабета",
  "гликированный гемоглобин": "средний уровень сахара за 3 месяца",
  "hba1c": "средний уровень сахара за 3 месяца",
  "инсулин": "обмен углеводов и риск диабета",
  "холестерин": "здоровье сосудов и риск атеросклероза",
  "холестерин общий": "здоровье сосудов и риск атеросклероза",
  "лпнп": "риск атеросклероза и здоровье сосудов",
  "лпвп": "защиту сосудов от атеросклероза",
  "триглицериды": "жировой обмен и риск атеросклероза",
  "креатинин": "функцию почек",
  "мочевина": "функцию почек и белковый обмен",
  "мочевая кислота": "обмен пуринов и риск подагры",
  "общий белок": "белковый обмен и иммунитет",
  "альбумин": "белковый обмен и функцию печени",
  "гомоцистеин": "здоровье сосудов и риск тромбозов",
  // Печёночные пробы
  "алт": "функцию печени",
  "аланинаминотрансфераза": "функцию печени",
  "аст": "функцию печени и сердца",
  "аспартатаминотрансфераза": "функцию печени и сердца",
  "билирубин": "функцию печени и обмен гемоглобина",
  "билирубин общий": "функцию печени и обмен гемоглобина",
  "билирубин прямой": "функцию печени и отток желчи",
  "щелочная фосфатаза": "функцию печени и костной ткани",
  "гамма-гт": "функцию печени и желчных протоков",
  "ггт": "функцию печени и желчных протоков",
  "лдг": "общий клеточный метаболизм",
  // Электролиты
  "калий": "работу сердца и мышц",
  "натрий": "водно-солевой баланс организма",
  "кальций": "здоровье костей, мышц и нервной системы",
  "кальций общий": "здоровье костей, мышц и нервной системы",
  "магний": "работу нервной системы, мышц и сердца",
  "фосфор": "здоровье костей и энергетический обмен",
  "хлориды": "водно-электролитный баланс",
  // Воспаление и свёртываемость
  "с-реактивный белок": "наличие воспалительных процессов",
  "срб": "наличие воспалительных процессов",
  "фибриноген": "свёртываемость крови",
  "д-димер": "риск тромбозов",
  "протромбиновое время": "свёртываемость крови",
  // Поджелудочная
  "амилаза": "функцию поджелудочной железы",
  "липаза": "функцию поджелудочной железы",
}

function getHealthImpact(name: string): string | null {
  const key = name.toLowerCase().trim()
  // Exact match first
  if (HEALTH_IMPACT[key]) return HEALTH_IMPACT[key]
  // Fuzzy: check if any HEALTH_IMPACT key is contained in name or vice versa
  for (const [k, v] of Object.entries(HEALTH_IMPACT)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  return null
}

function generateFallbackExplanation(ind: LightIndicator): string {
  const impact = getHealthImpact(ind.name)

  const statusText = ind.status === "normal" ? "в пределах нормы"
    : ind.status === "above_normal" ? "выше нормы"
    : ind.status === "below_normal" ? "ниже нормы"
    : ind.status === "critical_high" ? "критически повышен"
    : "критически понижен"

  if (impact) {
    return `${ind.name} — показатель, который влияет на ${impact}. Ваш результат ${ind.value} ${ind.unit} — ${statusText}.`
  }

  return ind.short_description || `${ind.name} — ${ind.value} ${ind.unit}. Показатель ${statusText}.`
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
  const valueStr = ind.value || ""
  const refRange = ind.reference_range || ""
  const numValue = parseFloat(valueStr.replace(",", "."))
  const isNumeric = !isNaN(numValue) && valueStr.trim() !== ""

  let refMin = 0
  let refMax = 100
  let hasRange = false
  const minMaxMatch = refRange.match(/([\d.,]+)\s*[-–]\s*([\d.,]+)/)
  const ltMatch = refRange.match(/^[<до]\s*([\d.,]+)/u)
  const gtMatch = refRange.match(/^>\s*([\d.,]+)/)
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
  const rawStatus = (ind.status || "").toLowerCase().trim().replace(/\s+/g, "_")
  if (rawStatus === "above_normal" || rawStatus === "high" || rawStatus === "elevated" || rawStatus === "above") {
    status = "high"
  } else if (rawStatus === "below_normal" || rawStatus === "low" || rawStatus === "decreased" || rawStatus === "below") {
    status = "low"
  } else if (rawStatus.includes("critical") || rawStatus === "very_high" || rawStatus === "very_low") {
    status = "critical"
  } else if (rawStatus !== "normal" && rawStatus !== "" && rawStatus !== "in_range") {
    // Any unrecognized non-normal status — treat as abnormal
    status = "high"
  }

  return {
    id: `ind-${index}`,
    name: ind.name || "",
    shortName: ind.short_name || "",
    value: isNumeric ? numValue : 0,
    textValue: isNumeric ? undefined : valueStr,
    unit: ind.unit || "",
    status,
    referenceMin: refMin,
    referenceMax: refMax,
    hasRange,
    explanation: ind.what_is
      ? [ind.what_is, ind.sources, ind.recommendation].filter(Boolean).join("\n\n")
      : generateFallbackExplanation(ind),
    whatIs: ind.what_is || undefined,
    sources: ind.sources || undefined,
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

    let summaryText: string
    if (shown.length === 0) {
      // Fallback: meta says out_of_range but we couldn't map which ones
      summaryText = `У вас ${outOfRangeCount === 1 ? "есть показатель, который отклоняется" : `есть ${outOfRangeCount} показателя, которые отклоняются`} от нормы. Подробный разбор и план действий — в полном отчёте.`
    } else {
      const descriptions = shown.map((ind) => {
        const impact = getHealthImpact(ind.name)
        const direction = getDirectionText(ind.status)
        if (impact) {
          return `${ind.name} ${direction} нормы — это может влиять на ${impact}`
        }
        return `${ind.name} ${direction} нормы. Требует внимания`
      })

      summaryText = descriptions.join(". ") + "."
      if (remaining > 0) {
        summaryText += ` И ещё ${remaining}.`
      }
      summaryText += " Подробный разбор и план действий — в полном отчёте."
    }

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

/** Chat consultation section teasers — shown below report teasers */
function ChatConsultationTeasers() {
  const items = [
    { icon: MessageSquare, title: "До 10 вопросов по вашим анализам" },
    { icon: Stethoscope, title: "Персональные рекомендации под ваши показатели" },
    { icon: UtensilsCrossed, title: "Советы по питанию, добавкам и образу жизни" },
    { icon: FileText, title: "Объяснение каждого отклонения простым языком" },
    { icon: BarChart3, title: "Что контролировать и когда пересдать анализы" },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-card-foreground text-center">Онлайн-консультация с ИИ</h3>
      <div className="grid gap-2">
        {items.map(({ icon: SIcon, title }) => (
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
              document.getElementById("paywall-block")?.scrollIntoView({ behavior: "smooth", block: "center" })
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
              document.getElementById("paywall-block")?.scrollIntoView({ behavior: "smooth", block: "center" })
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
  promoVisible, setPromoVisible, promoCode, setPromoCode,
  loading, abnormalIndicators, totalCount, onPay, onPromo,
  withChat, setWithChat, withFiveReports, setWithFiveReports,
  withAbonement, setWithAbonement,
}: {
  promoVisible: boolean
  setPromoVisible: (v: boolean) => void
  promoCode: string
  setPromoCode: (v: string) => void
  loading: boolean
  abnormalIndicators: AnalysisIndicator[]
  totalCount: number
  onPay: (promoCode?: string, withChat?: boolean, withFiveReports?: boolean, withAbonement?: boolean) => Promise<void>
  onPromo: (email: string, promoCode: string, withChat?: boolean) => Promise<void>
  withChat: boolean
  setWithChat: (v: boolean) => void
  withFiveReports: boolean
  setWithFiveReports: (v: boolean) => void
  withAbonement: boolean
  setWithAbonement: (v: boolean) => void
}) {
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoResult, setPromoResult] = useState<PromoValidateResponse | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [freePromoEmail, setFreePromoEmail] = useState("")

  const hasAbnormal = abnormalIndicators.length > 0
  const first = abnormalIndicators[0]

  const subtitle: React.ReactNode = (
    <a href="/guarantee" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      <span>Гарантия возврата, если сервис не справился</span>
    </a>
  )

  const baseDisplayPrice = promoResult?.valid && !promoResult.free && promoResult.discount_percent
    ? Math.max(1, Math.round(199 * (100 - promoResult.discount_percent) / 100))
    : 199
  const comboDisplayPrice = promoResult?.valid && !promoResult.free && promoResult.discount_percent
    ? Math.max(1, Math.round(248 * (100 - promoResult.discount_percent) / 100))
    : 248
  const displayPrice = withFiveReports ? 499 : withChat ? comboDisplayPrice : baseDisplayPrice
  const hasDiscount = promoResult?.valid && !promoResult.free && promoResult.discount_percent

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return
    setPromoValidating(true)
    setPromoError(null)
    setPromoResult(null)
    try {
      const result = await validatePromo(promoCode.trim())
      if (result.valid && result.free) {
        // Pack/abonement codes (is_pack=true) always grant ONE single report.
        // Reset combo/3-pack selection so user doesn't think they're getting
        // a bundle for free. Admin codes ("111", VALID_PROMO_CODES) don't set
        // is_pack — for them we keep the user's tier choice (combo allowed).
        if (result.is_pack) {
          setWithChat(false)
          setWithFiveReports(false)
          setWithAbonement(false)
        }
        setPromoResult(result)
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
          {/* Tier selector — hidden for pack/abonement promos (they always
              redeem as ONE single report). Admin free codes ("111") keep the
              selector so the user can still pick combo with chat. */}
          {!promoResult?.is_pack && (
          <div className="mb-4 space-y-2">
            <button
              onClick={() => { setWithChat(false); setWithFiveReports(false); setWithAbonement(false) }}
              disabled={loading}
              className={`flex w-full min-h-[56px] items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                !withChat && !withFiveReports && !withAbonement ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
              } ${loading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                !withChat && !withFiveReports && !withAbonement ? "border-primary" : "border-muted-foreground/40"
              }`}>
                {!withChat && !withFiveReports && !withAbonement && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Полный отчет</p>
              </div>
              <span className="text-sm font-bold text-foreground shrink-0">
                {promoResult?.free ? "бесплатно" : `${baseDisplayPrice} ₽`}
              </span>
            </button>

            <button
              onClick={() => { setWithChat(true); setWithFiveReports(false); setWithAbonement(false) }}
              disabled={loading}
              className={`relative flex w-full min-h-[56px] items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                withChat && !withFiveReports && !withAbonement ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
              } ${loading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                популярный
              </span>
              <div className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                withChat && !withFiveReports && !withAbonement ? "border-primary" : "border-muted-foreground/40"
              }`}>
                {withChat && !withFiveReports && !withAbonement && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Полный отчет + консультация с ИИ в Telegram</p>
              </div>
              <span className="text-sm font-bold text-foreground shrink-0">
                {promoResult?.free ? "бесплатно" : `${comboDisplayPrice} ₽`}
              </span>
            </button>

            <button
              onClick={() => { setWithFiveReports(true); setWithChat(false); setWithAbonement(false) }}
              disabled={loading}
              className={`relative flex w-full min-h-[56px] items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                withFiveReports ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border hover:border-muted-foreground/30"
              } ${loading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <span className="absolute -top-2 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#16a34a" }}>
                −50%
              </span>
              <div className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                withFiveReports ? "border-emerald-600" : "border-muted-foreground/40"
              }`}>
                {withFiveReports && <div className="h-2 w-2 rounded-full bg-emerald-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">3 отчёта</p>
                <p className="text-xs text-muted-foreground mt-0.5">в два раза дешевле, чем при покупке одного отчёта</p>
              </div>
              <span className="text-sm font-bold shrink-0" style={{ color: "#16a34a" }}>299 ₽</span>
            </button>

            <button
              onClick={() => { setWithAbonement(true); setWithChat(false); setWithFiveReports(false) }}
              disabled={loading}
              className={`relative flex w-full min-h-[56px] items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                withAbonement ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/20" : "border-border hover:border-muted-foreground/30"
              } ${loading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <span className="absolute -top-2 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#d97706" }}>
                −70%
              </span>
              <div className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                withAbonement ? "border-amber-600" : "border-muted-foreground/40"
              }`}>
                {withAbonement && <div className="h-2 w-2 rounded-full bg-amber-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">10 отчётов</p>
                <p className="text-xs text-muted-foreground mt-0.5">ещё дешевле! можете использовать для других членов семьи, друзей или любимых</p>
              </div>
              <span className="text-sm font-bold shrink-0" style={{ color: "#d97706" }}>599 ₽</span>
            </button>
          </div>
          )}

          {/* 1. CTA Button */}
          {!promoResult?.free && (
          <button
            onClick={() => {
              if (withAbonement) {
                ymGoal("click_pay_abonement")
                onPay(undefined, false, false, true)
              } else if (withFiveReports) {
                ymGoal("click_pay_five_reports")
                onPay(undefined, false, true, false)
              } else {
                ymGoal("click_get_report")
                onPay(hasDiscount ? promoCode.trim() : undefined, withChat, false, false)
              }
            }}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={withAbonement
              ? { background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", boxShadow: "0 4px 16px rgba(217,119,6,0.35)" }
              : withFiveReports
              ? { background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", boxShadow: "0 4px 16px rgba(22,163,74,0.35)" }
              : { background: "linear-gradient(135deg, #00b4bc 0%, #00a0a8 100%)", boxShadow: "0 4px 16px rgba(0,180,188,0.35)" }
            }
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
                {withAbonement
                  ? "Купить 10 отчётов — 599 ₽"
                  : withFiveReports
                  ? "Купить 3 отчёта — 299 ₽"
                  : withChat
                  ? `С консультацией — ${displayPrice} ₽`
                  : `Получить полный отчёт — ${displayPrice} ₽`}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
          )}

          {/* 2–4. Guarantee + YooMoney + Promo — unified block */}
          <div className="mt-3 flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">{subtitle}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="6" fill="#8B3FFD"/>
                <path d="M13.5 7H11.2C9.43 7 8 8.43 8 10.2C8 11.97 9.43 13.4 11.2 13.4H12V17H13.5V7ZM12 12H11.2C10.21 12 9.5 11.19 9.5 10.2C9.5 9.21 10.31 8.5 11.2 8.5H12V12Z" fill="white"/>
              </svg>
              <span className="text-xs">Безопасная оплата через ЮMoney</span>
            </div>
            {!promoVisible && (
              <button onClick={() => setPromoVisible(true)} className="text-xs text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-primary">
                Есть промокод?
              </button>
            )}
          </div>

          {/* 4. Promo code input */}
          {promoVisible && (
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
              {promoResult?.free && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-2" style={{ background: "rgba(34,197,94,0.08)" }}>
                    <Check className="h-4 w-4 shrink-0" style={{ color: "#16a34a" }} />
                    <span className="text-xs text-card-foreground">
                      Промокод активирован — отчёт бесплатно!
                      {typeof promoResult.uses_left === "number" && (
                        <> Осталось использований после этого: {Math.max(0, promoResult.uses_left - 1)}.</>
                      )}
                    </span>
                  </div>
                  <label className="text-xs font-medium text-card-foreground">Email для получения отчёта</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="example@mail.ru"
                      value={freePromoEmail}
                      onChange={(e) => setFreePromoEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isValidEmail(freePromoEmail)) {
                          onPromo(freePromoEmail.trim(), promoCode.trim(), withChat)
                        }
                      }}
                      className="w-full rounded-xl border-2 border-border bg-background py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={() => onPromo(freePromoEmail.trim(), promoCode.trim(), withChat)}
                    disabled={!isValidEmail(freePromoEmail) || loading}
                    className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}
                  >
                    Получить бесплатный отчёт
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            Нажимая кнопку, вы соглашаетесь с{" "}
            <a href="/offer" className="underline hover:text-primary">офертой</a>,{" "}
            <a href="/privacy" className="underline hover:text-primary">политикой конфиденциальности</a>{" "}и{" "}
            <a href="/guarantee" className="underline hover:text-primary">гарантией возврата</a>
          </p>
        </div>
      </GradientCard>
    </motion.div>
  )
}

/** Bottom CTA card + sticky mobile button */
function BottomCTA({ onPay, loading, withChat, withFiveReports, withAbonement }: {
  onPay: () => void
  loading: boolean
  withChat: boolean
  withFiveReports?: boolean
  withAbonement?: boolean
}) {
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSticky(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showSticky && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border p-3 sm:hidden"
          style={{ background: "var(--background)", boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}
        >
          <button
            onClick={onPay}
            disabled={loading}
            className="flex w-full flex-col items-center justify-center rounded-xl px-4 py-4 text-white disabled:opacity-50"
            style={withAbonement
              ? { background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" }
              : withFiveReports
              ? { background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }
              : { background: "linear-gradient(135deg, #00b4bc 0%, #00a0a8 100%)" }
            }
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              {withAbonement
                ? "Купить 10 отчётов — 599 ₽"
                : withFiveReports
                ? "Купить 3 отчёта — 299 ₽"
                : withChat
                ? "С консультацией — 248 ₽"
                : "Получить полный отчёт — 199 ₽"}
              <ChevronRight className="h-4 w-4" />
            </span>
            <span className="mt-0.5 text-[10px] font-normal opacity-80">
              Гарантия возврата, если сервис не справился
            </span>
          </button>
        </div>
      )}
    </>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Екатерина, 29 лет, Нижний Новгород",
    text: "«Врач написала «обратите внимание на АЛТ» — и всё. Удобный сервис для таких случаев»",
  },
  {
    name: "Дмитрий, 44 года",
    text: "«Спасибо, очень полезный сервис.»",
  },
  {
    name: "Анна",
    text: "«Низкий витамин D уже второй раз, врач говорит «принимайте». Тут хотя бы объяснили почему так бывает. Отчёт на почту - удобно.»",
  },
]

function TestimonialsBlock() {
  return (
    <div className="mt-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Отзывы пользователей</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #00b4bc, #00a0a8)" }}
              >
                {t.name[0]}
              </div>
              <span className="text-xs font-semibold text-card-foreground">{t.name}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">«{t.text}»</p>
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-3 w-3" viewBox="0 0 12 12" fill="#f59e0b">
                  <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.5 3.4 8.9l.5-2.9-2.1-2 2.9-.4z" />
                </svg>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface PaywallStepProps {
  orderId: string
  preview: PreviewData | null
  onPay: (promoCode?: string, withChat?: boolean, withFiveReports?: boolean, withAbonement?: boolean) => Promise<void>
  onPromo: (email: string, promoCode: string, withChat?: boolean) => Promise<void>
  loading: boolean
}

export function PaywallStep({ onPay, onPromo, loading, preview }: PaywallStepProps) {
  const [promoVisible, setPromoVisible] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [withChat, setWithChat] = useState(false)
  const [withFiveReports, setWithFiveReports] = useState(false)
  const [withAbonement, setWithAbonement] = useState(false)

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

      {/* ── 4. Inline Paywall ── */}
      <div className="mt-8">
        <InlinePaywall
          promoVisible={promoVisible} setPromoVisible={setPromoVisible}
          promoCode={promoCode} setPromoCode={setPromoCode} loading={loading}
          abnormalIndicators={abnormalIndicators} totalCount={totalCount} onPay={onPay} onPromo={onPromo}
          withChat={withChat} setWithChat={setWithChat}
          withFiveReports={withFiveReports} setWithFiveReports={setWithFiveReports}
          withAbonement={withAbonement} setWithAbonement={setWithAbonement}
        />
      </div>

      {/* ── 5. Testimonials ── */}
      <TestimonialsBlock />

      {/* ── 6. Report section teasers ── */}
      <div className="mt-8">
        <ReportSectionTeasers />
      </div>

      {/* ── 6b. Chat consultation teasers ── */}
      <div className="mt-4">
        <ChatConsultationTeasers />
      </div>

      {/* ── 7. Bottom CTA + sticky mobile ── */}
      <BottomCTA
        onPay={() => withAbonement
          ? onPay(undefined, false, false, true)
          : withFiveReports
          ? onPay(undefined, false, true, false)
          : onPay(undefined, withChat, false, false)}
        loading={loading}
        withChat={withChat}
        withFiveReports={withFiveReports}
        withAbonement={withAbonement}
      />
    </div>
  )
}
