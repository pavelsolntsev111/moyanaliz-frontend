"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AppStep, PreviewData } from "@/lib/types";
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

  useEffect(() => {
    ymGoal("page_loaded");
    // Save UTM params for payment attribution
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
        const v = sp.get(key);
        if (v) utm[key] = v;
      }
      if (Object.keys(utm).length > 0) {
        sessionStorage.setItem("utm_params", JSON.stringify(utm));
      }
    }
  }, []);
  const [orderId, setOrderId] = useState<string>("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const uploadDone = useRef(false);

  const handleFileSelected = useCallback(async (f: File) => {
    ymGoal("file_selected");
    setStep("analyzing");
    uploadDone.current = false;
    try {
      const res = await uploadFile(f);
      setOrderId(res.order_id);
      setPreview(res.preview);
      uploadDone.current = true;
      ymGoal("file_uploaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
      setStep("upload");
    }
  }, []);

  const handleAnalyzingComplete = useCallback(() => {
    setStep("paywall");
    ymGoal("free_report_shown");
  }, []);

  const handlePay = useCallback(
    async (promoCode?: string, withChat?: boolean, withFiveReports?: boolean) => {
      ymGoal("click_pay");
      setPayLoading(true);
      try {
        const res = await createPayment(orderId, promoCode, withChat, withFiveReports);
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
    async (email: string, promoCode: string, withChat?: boolean) => {
      setPayLoading(true);
      try {
        const res = await applyPromo(orderId, email, promoCode, withChat);
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
