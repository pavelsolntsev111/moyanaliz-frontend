"use client";

import { useState, useCallback } from "react";
import UploadZone from "@/components/UploadZone";
import SexAgeModal from "@/components/SexAgeModal";
import AnalyzingAnimation from "@/components/AnalyzingAnimation";
import PaywallScreen from "@/components/PaywallScreen";
import Link from "next/link";
import LabLogos from "@/components/LabLogos";
import TrustSections from "@/components/TrustSections";
import { uploadFile, createPayment } from "@/lib/api";

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14">
      {/* Nav */}
      {step === "upload" && (
        <nav className="flex items-center justify-center gap-4 sm:gap-6 mb-8 text-sm flex-wrap">
          <a href="#how" className="text-muted hover:text-primary transition">
            Как это работает
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
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
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
          <h1 className="text-3xl sm:text-4xl font-bold">
            Мой <span className="text-primary">Анализ</span>
          </h1>
        </div>
        <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
          Подробное объяснение медицинских анализов от&nbsp;искусственного
          интеллекта, основанного на&nbsp;экспертизе лучших мировых врачей
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

      {step === "upload" && <UploadZone onFileSelected={handleFileSelected} />}

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
          loading={payLoading}
        />
      )}

      {/* How it works */}
      {step === "upload" && (
        <>
          <div id="how" className="mt-12 grid gap-5 sm:grid-cols-3 scroll-mt-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                ),
                title: "Загрузите",
                desc: "PDF или фото анализов из лаборатории",
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                ),
                title: "Получите расшифровку",
                desc: "ИИ проанализирует каждый показатель",
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                ),
                title: "Обсудите с врачом",
                desc: "Подготовленные вопросы для визита",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-6 rounded-2xl bg-primary-light/50 border border-primary/10"
              >
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>

          <LabLogos />

          <TrustSections />

          <p className="text-xs text-muted text-center mt-10">
            Сервис носит информационный характер и не является медицинской услугой
          </p>
        </>
      )}
    </div>
  );
}
