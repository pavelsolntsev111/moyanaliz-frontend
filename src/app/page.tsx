"use client";

import { useState, useCallback } from "react";
import type { AppStep, Gender } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadStep } from "@/components/steps/upload-step";
import { GenderAgeModal } from "@/components/steps/gender-age-modal";
import { AnalyzingStep } from "@/components/steps/analyzing-step";
import { PaywallStep } from "@/components/steps/paywall-step";
import { uploadFile, createPayment, applyPromo } from "@/lib/api";

export default function HomePage() {
  const [step, setStep] = useState<AppStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  const handleFileSelected = useCallback((f: File) => {
    setFile(f);
    setStep("modal");
  }, []);

  const handleModalSubmit = useCallback(
    async (gender: Gender, age: number) => {
      if (!file) return;
      setStep("analyzing");
      try {
        const res = await uploadFile(file, gender, age);
        setOrderId(res.order_id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
        setStep("upload");
      }
    },
    [file]
  );

  const handleModalClose = useCallback(() => {
    setFile(null);
    setStep("upload");
  }, []);

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
        setError(
          e instanceof Error ? e.message : "Ошибка применения промокода"
        );
        setPayLoading(false);
      }
    },
    [orderId]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {error && (
          <div className="mx-auto max-w-3xl px-4 pt-4">
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 underline font-medium"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {step === "upload" && <UploadStep onFileSelected={handleFileSelected} />}

        {step === "analyzing" && (
          <AnalyzingStep onComplete={handleAnalyzingComplete} />
        )}

        {step === "paywall" && (
          <PaywallStep
            orderId={orderId}
            onPay={handlePay}
            onPromo={handlePromo}
            loading={payLoading}
          />
        )}
      </main>

      {step === "modal" && file && (
        <GenderAgeModal
          fileName={file.name}
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
        />
      )}

      <SiteFooter />
    </div>
  );
}
