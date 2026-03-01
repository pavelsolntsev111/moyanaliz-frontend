"use client";

import { useState, useCallback } from "react";
import UploadZone from "@/components/UploadZone";
import SexAgeModal from "@/components/SexAgeModal";
import AnalyzingAnimation from "@/components/AnalyzingAnimation";
import PaywallScreen from "@/components/PaywallScreen";
import Link from "next/link";
import LabLogos from "@/components/LabLogos";
import TrustSections from "@/components/TrustSections";
import { uploadFile, createPayment, applyPromo } from "@/lib/api";

type Step = "upload" | "modal" | "analyzing" | "paywall";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  const handleFileSelected = useCallback((f: File) => {
    setFile(f);
    setStep("modal");
  }, []);

  const handleModalSubmit = useCallback(
    async (sex: string, age: number) => {
      if (!file) return;
      setStep("analyzing");
      try {
        const res = await uploadFile(file, sex, age);
        setOrderId(res.order_id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
        setStep("upload");
      }
    },
    [file]
  );

  const handleAnalyzingComplete = useCallback(() => {
    if (orderId) setStep("paywall");
  }, [orderId]);

  const handlePay = useCallback(
    async (email: string) => {
      setPayLoading(true);
      try {
        const res = await createPayment(orderId, email);
        window.location.href = res.payment_url;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка создания платежа");
        setPayLoading(false);
      }
    },
    [orderId]
  );

  const handlePromo = useCallback(
    async (email: string, promoCode: string) => {
      setPayLoading(true);
      try {
        const res = await applyPromo(orderId, email, promoCode);
        window.location.href = res.redirect_url;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка применения промокода");
        setPayLoading(false);
      }
    },
    [orderId]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Nav */}
      {step === "upload" && (
        <nav className="flex items-center justify-center gap-5 sm:gap-8 mb-6 text-base flex-wrap">
          <a href="#how" className="text-muted hover:text-primary transition">
            Что вы получите
          </a>
          <a href="#report" className="text-muted hover:text-primary transition">
            Пример отчёта
          </a>
          <a href="#safety" className="text-muted hover:text-primary transition">
            Безопасность
          </a>
          <a href="#faq" className="text-muted hover:text-primary transition">
            FAQ
          </a>
          <Link href="/blog" className="text-muted hover:text-primary transition">
            Блог
          </Link>
        </nav>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <svg width="44" height="44" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#00b4bc" />
            <path
              d="M10 12h3v3h-3v-3zm0 5h3v3h-3v-3zm0 5h3v3h-3v-3zm5-10h8v2h-8v-2zm0 5h8v2h-8v-2zm0 5h6v2h-6v-2z"
              fill="white"
              opacity="0.9"
            />
            <path
              d="M25 16l-4 6h3l-2 4 5-6h-3l2-4z"
              fill="#fff"
            />
          </svg>
          <span className="text-2xl sm:text-3xl font-bold">
            Мой <span className="text-primary">Анализ</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight max-w-3xl mx-auto">
          Получили анализы и&nbsp;переживаете из-за&nbsp;цифр?
          <br />
          <span className="text-primary">Расшифруем за&nbsp;2&nbsp;минуты</span>
        </h1>
        <p className="text-muted text-lg sm:text-xl max-w-2xl mx-auto mt-3">
          Поможем понять, стоит&nbsp;ли переживать и&nbsp;нужно&nbsp;ли идти к&nbsp;врачу.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline font-medium"
          >
            Закрыть
          </button>
        </div>
      )}

      {step === "modal" && file && (
        <SexAgeModal
          fileName={file.name}
          onSubmit={handleModalSubmit}
          onCancel={() => {
            setFile(null);
            setStep("upload");
          }}
        />
      )}

      {step === "analyzing" && (
        <AnalyzingAnimation onComplete={handleAnalyzingComplete} />
      )}

      {step === "paywall" && (
        <PaywallScreen
          orderId={orderId}
          onPay={handlePay}
          onPromo={handlePromo}
          loading={payLoading}
        />
      )}

      {/* Hero: cards left + upload right */}
      {step === "upload" && (
        <>
          <div id="how" className="grid gap-6 lg:grid-cols-2 scroll-mt-8">
            {/* Left: 3 benefit cards */}
            <div className="grid grid-rows-3 gap-5">
              {[
                {
                  icon: (
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  ),
                  text: "Объясним каждый показатель",
                },
                {
                  icon: (
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  ),
                  text: "Оценим, насколько это серьёзно",
                },
                {
                  icon: (
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                    </svg>
                  ),
                  text: "Подскажем, что делать дальше",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-primary-light/50 border border-primary/10"
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span className="text-base font-semibold">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Right: upload */}
            <div className="flex flex-col h-full">
              <UploadZone onFileSelected={handleFileSelected} />
            </div>
          </div>

          <LabLogos />

          <TrustSections />

          <p className="text-sm text-muted text-center mt-12">
            Сервис носит информационный характер и не является медицинской услугой
          </p>
        </>
      )}
    </div>
  );
}
