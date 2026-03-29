"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AppStep, Gender, PreviewData } from "@/lib/types";
import { ymGoal } from "@/lib/ym";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadStep } from "@/components/steps/upload-step";
import { AnalyzingStep } from "@/components/steps/analyzing-step";
import { PaywallStep } from "@/components/steps/paywall-step";
import { uploadFile, createPayment, applyPromo } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<AppStep>("upload");

  // 1. Сайт загружен
  useEffect(() => { ymGoal("page_loaded"); }, []);
  const [file, setFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const uploadDone = useRef(false);

  // Store gender/age for displaying badge on scanner
  const [detectedSex, setDetectedSex] = useState<Gender | null>(null);
  const [detectedAge, setDetectedAge] = useState<number | null>(null);

  const handleFileSelected = useCallback((f: File) => {
    setFile(f);
    setDetectedSex(null);
    setDetectedAge(null);
    ymGoal("file_selected");
    setStep("analyzing");
  }, []);

  const handleScannerSubmit = useCallback(
    async (sex: Gender, age: number) => {
      if (!file) return;
      setDetectedSex(sex);
      setDetectedAge(age);
      ymGoal("form_submitted");
      uploadDone.current = false;
      try {
        const res = await uploadFile(file, sex, age);
        setOrderId(res.order_id);
        setPreview(res.preview);
        uploadDone.current = true;
        ymGoal("file_uploaded");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
        setStep("upload");
      }
    },
    [file]
  );

  const handleAnalyzingComplete = useCallback(() => {
    setStep("paywall");
    ymGoal("free_report_shown");
  }, []);

  const handlePay = useCallback(
    async (promoCode?: string) => {
      ymGoal("click_pay");
      setPayLoading(true);
      try {
        const res = await createPayment(orderId, promoCode);
        if (res.redirect_url.startsWith("http")) {
          window.location.href = res.redirect_url;
        } else {
          router.push(res.redirect_url);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка создания платежа");
        setPayLoading(false);
      }
    },
    [orderId, router]
  );

  const handlePromo = useCallback(
    async (email: string, promoCode: string) => {
      setPayLoading(true);
      try {
        const res = await applyPromo(orderId, email, promoCode);
        if (res.redirect_url.startsWith("http")) {
          window.location.href = res.redirect_url;
        } else {
          router.push(res.redirect_url);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Ошибка применения промокода"
        );
        setPayLoading(false);
      }
    },
    [orderId, router]
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
          <AnalyzingStep
            onComplete={handleAnalyzingComplete}
            isReady={uploadDone}
            preview={preview}
            detectedSex={detectedSex}
            detectedAge={detectedAge}
            onFormSubmit={handleScannerSubmit}
          />
        )}

        {step === "paywall" && (
          <PaywallStep
            orderId={orderId}
            preview={preview}
            onPay={handlePay}
            onPromo={handlePromo}
            loading={payLoading}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
