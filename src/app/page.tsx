"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AppStep, Gender, PreviewData } from "@/lib/types";
import { ymGoal } from "@/lib/ym";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadStep } from "@/components/steps/upload-step";
import { GenderAgeModal } from "@/components/steps/gender-age-modal";
import { AnalyzingStep } from "@/components/steps/analyzing-step";
import { PaywallStep } from "@/components/steps/paywall-step";
import { uploadFile, createPayment, applyPromo, detectPatient } from "@/lib/api";
import type { DetectPatientResponse } from "@/lib/api";
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
  const [patientSuggestion, setPatientSuggestion] = useState<DetectPatientResponse | null>(null);
  const uploadDone = useRef(false);

  const [detecting, setDetecting] = useState(false);

  // Store detected gender/age for displaying on scanner
  const [detectedSex, setDetectedSex] = useState<Gender | null>(null);
  const [detectedAge, setDetectedAge] = useState<number | null>(null);

  const handleFileSelected = useCallback(async (f: File) => {
    setFile(f);
    setPatientSuggestion(null);
    setDetectedSex(null);
    setDetectedAge(null);
    setDetecting(true);
    ymGoal("file_selected");
    try {
      const suggestion = await detectPatient(f);
      setPatientSuggestion(suggestion);
      // If both sex and age detected — skip modal, go straight to analyzing
      if (suggestion.patient_sex && suggestion.patient_age) {
        const sex = suggestion.patient_sex as Gender;
        const age = suggestion.patient_age;
        setDetectedSex(sex);
        setDetectedAge(age);
        setDetecting(false);
        ymGoal("form_submitted");
        setStep("analyzing");
        uploadDone.current = false;
        try {
          const res = await uploadFile(f, sex, age);
          setOrderId(res.order_id);
          setPreview(res.preview);
          uploadDone.current = true;
          ymGoal("file_uploaded");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Ошибка загрузки");
          setStep("upload");
        }
        return;
      }
    } catch {
      // ignore — show form empty
    }
    setDetecting(false);
    setStep("modal");
  }, []);

  const handleModalSubmit = useCallback(
    async (gender: Gender, age: number) => {
      if (!file) return;
      ymGoal("form_submitted"); // 4. Форма пол/возраст заполнена
      setStep("analyzing");
      uploadDone.current = false;
      try {
        const res = await uploadFile(file, gender, age);
        setOrderId(res.order_id);
        setPreview(res.preview);
        uploadDone.current = true;
        ymGoal("file_uploaded"); // 3. Файл загружен успешно
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
    setStep("paywall");
    ymGoal("free_report_shown"); // 6. Бесплатный отчёт показан
  }, []);

  const handlePay = useCallback(
    async (email: string, promoCode?: string) => {
      ymGoal("click_pay"); // 7. Нажата кнопка оплаты
      setPayLoading(true);
      try {
        const res = await createPayment(orderId, email, promoCode);
        ymGoal("payment_done"); // 8. Оплата завершена (редирект)
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

      {step === "modal" && file && (
        <GenderAgeModal
          fileName={file.name}
          detecting={detecting}
          suggestedSex={patientSuggestion?.patient_sex ?? null}
          suggestedAge={patientSuggestion?.patient_age ?? null}
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
        />
      )}

      <SiteFooter />
    </div>
  );
}
