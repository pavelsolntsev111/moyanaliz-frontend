"use client"

import type { AnalysisIndicator } from "@/lib/types"
import { CheckCircle2, AlertTriangle, AlertOctagon, ArrowDown, FileText, Beaker } from "lucide-react"

const statusConfig = {
  normal: {
    label: "Норма",
    badgeBg: "bg-success",
    badgeText: "text-success-foreground",
    barColor: "bg-success",
    valueColor: "text-success",
    icon: CheckCircle2,
  },
  low: {
    label: "Ниже нормы",
    badgeBg: "bg-warning",
    badgeText: "text-warning-foreground",
    barColor: "bg-warning",
    valueColor: "text-warning",
    icon: ArrowDown,
  },
  high: {
    label: "Выше нормы",
    badgeBg: "bg-warning",
    badgeText: "text-warning-foreground",
    barColor: "bg-warning",
    valueColor: "text-warning",
    icon: AlertTriangle,
  },
  critical: {
    label: "Критическое",
    badgeBg: "bg-destructive",
    badgeText: "text-white",
    barColor: "bg-destructive",
    valueColor: "text-destructive",
    icon: AlertOctagon,
  },
}

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

interface IndicatorCardProps {
  indicator: AnalysisIndicator
  locked?: boolean
}

export function IndicatorCard({ indicator, locked }: IndicatorCardProps) {
  const config = statusConfig[indicator.status]
  const Icon = config.icon
  const position = getRangePosition(
    indicator.value,
    indicator.referenceMin,
    indicator.referenceMax
  )
  const normalZone = getNormalZone(
    indicator.referenceMin,
    indicator.referenceMax
  )

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {indicator.shortName}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-card-foreground">
            {indicator.name}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}
        >
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold ${config.valueColor}`}>
          {indicator.textValue ?? indicator.value}
        </span>
        <span className="text-sm text-muted-foreground">{indicator.unit}</span>
      </div>

      {/* Range bar — only when range is known and value is numeric */}
      {indicator.hasRange !== false && !indicator.textValue && (
        <div className="mt-3">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
            {/* Normal zone */}
            <div
              className="absolute top-0 h-full rounded-full bg-success/20"
              style={{
                left: `${normalZone.left}%`,
                width: `${normalZone.width}%`,
              }}
            />
            {/* Marker */}
            <div
              className={`absolute top-0 h-full w-1.5 rounded-full ${config.barColor}`}
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>
              {indicator.referenceMin} {indicator.unit}
            </span>
            <span className="text-success">норма</span>
            <span>
              {indicator.referenceMax} {indicator.unit}
            </span>
          </div>
        </div>
      )}

      {!locked && (indicator.whatIs || indicator.sources || indicator.explanation) && (
        <div className="mt-4 space-y-3">
          {indicator.whatIs ? (
            <>
              {/* Structured sections from static DB */}
              <div className="flex gap-2.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded" style={{ background: "rgba(0,180,188,0.10)" }}>
                  <FileText className="h-3 w-3" style={{ color: "#00B4BC" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-card-foreground">Что это</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{indicator.whatIs}</p>
                </div>
              </div>
              {indicator.sources && (
                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded" style={{ background: "rgba(124,58,237,0.10)" }}>
                    <Beaker className="h-3 w-3" style={{ color: "#7C3AED" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-card-foreground">Почему важен</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{indicator.sources}</p>
                  </div>
                </div>
              )}
            </>
          ) : indicator.explanation ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {indicator.explanation}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
