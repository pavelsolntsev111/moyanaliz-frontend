"use client"

import { useState } from "react"
import { Lock, Mail, Tag } from "lucide-react"
import { mockIndicators } from "@/lib/mock-data"
import { IndicatorCard } from "@/components/indicator-card"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface PaywallStepProps {
  orderId: string
  onPay: (email: string) => Promise<void>
  onPromo: (email: string, promoCode: string) => Promise<void>
  loading: boolean
}

export function PaywallStep({ onPay, onPromo, loading }: PaywallStepProps) {
  const [email, setEmail] = useState("")
  const [promoVisible, setPromoVisible] = useState(false)
  const [promoCode, setPromoCode] = useState("")

  const freeIndicator = mockIndicators[0]
  const lockedIndicators = mockIndicators.slice(1)
  const emailValid = isValidEmail(email)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
      <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
        Результаты анализа
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Мы распознали {mockIndicators.length} показателей в вашем анализе
      </p>

      {/* Free indicator */}
      <div className="mt-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-primary">
          Бесплатный показатель
        </p>
        <IndicatorCard indicator={freeIndicator} />
      </div>

      {/* Locked indicators */}
      <div className="relative mt-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Ещё {lockedIndicators.length} показателей
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {lockedIndicators.map((ind) => (
            <div key={ind.id} className="pointer-events-none select-none blur-[6px]">
              <IndicatorCard indicator={ind} />
            </div>
          ))}
        </div>

        {/* Payment overlay */}
        <div className="absolute inset-0 flex items-start justify-center pt-12">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-card-foreground">
                Полный отчёт — 199 ₽
              </h3>
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Получите расшифровку всех {mockIndicators.length} показателей с
              подробными пояснениями в PDF на email
            </p>

            {/* Email input */}
            <div className="mt-5">
              <label
                htmlFor="paywall-email"
                className="text-sm font-medium text-card-foreground"
              >
                Email для отчёта
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="paywall-email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>

            {/* Promo code */}
            {!promoVisible ? (
              <button
                onClick={() => setPromoVisible(true)}
                className="mt-3 text-xs text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-primary"
              >
                Есть промокод?
              </button>
            ) : (
              <div className="mt-3">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Введите промокод"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border-2 border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                {promoCode && (
                  <button
                    onClick={() =>
                      emailValid && promoCode && onPromo(email, promoCode)
                    }
                    disabled={!emailValid || !promoCode || loading}
                    className="mt-2 w-full rounded-xl border-2 border-border py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Применить промокод
                  </button>
                )}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={() => emailValid && onPay(email)}
              disabled={!emailValid || loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Переход к оплате...
                </>
              ) : (
                "Оплатить 199 ₽"
              )}
            </button>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              Нажимая кнопку, вы соглашаетесь с{" "}
              <a href="/offer" className="underline hover:text-primary">
                офертой
              </a>{" "}
              и{" "}
              <a href="/privacy" className="underline hover:text-primary">
                политикой конфиденциальности
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
