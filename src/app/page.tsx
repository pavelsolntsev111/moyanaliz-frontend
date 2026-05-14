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
import { captureAttribution } from "@/lib/attribution";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<AppStep>("upload");

  useEffect(() => {
    ymGoal("page_loaded");
    // First-touch ad attribution: snapshot UTM/yclid from URL into localStorage
    // (30d TTL). Piggy-backed onto /upload via uploadFile(). Replaces legacy
    // sessionStorage utm_params logic.
    captureAttribution();
  }, []);
  const [orderId, setOrderId] = useState<string>("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  // A/B bucket. Defaults to false (group A) so any goal fired before /upload
  // resolves stays in the safe control bucket. Overwritten with the real value
  // from the /upload response in handleFileSelected.
  const [abEmailBeforePay, setAbEmailBeforePay] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const uploadDone = useRef(false);

  // Stable tag attached to every YM goal once we know the order's bucket.
  // Goals fired before /upload completes (page_loaded, file_selected) carry no
  // ab tag — they're per-visitor, not per-order, so splitting them is meaningless.
  const abParams = (group: boolean) => ({ ab: group ? "B" : "A" });

  const handleFileSelected = useCallback(async (f: File) => {
    ymGoal("file_selected");
    setStep("analyzing");
    uploadDone.current = false;
    try {
      const res = await uploadFile(f);
      setOrderId(res.order_id);
      setPreview(res.preview);
      const ab = !!res.ab_email_before_pay;
      setAbEmailBeforePay(ab);
      uploadDone.current = true;
      ymGoal("file_uploaded", abParams(ab));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
      setStep("upload");
    }
  }, []);

  const handleAnalyzingComplete = useCallback(() => {
    setStep("paywall");
    ymGoal("free_report_shown", abParams(abEmailBeforePay));
  }, [abEmailBeforePay]);

  const handlePay = useCallback(
    async (promoCode?: string, withChat?: boolean, withFiveReports?: boolean, withAbonement?: boolean, email?: string) => {
      // Fire BEFORE network call — preserves current Yandex.Direct optimization
      // semantics (click_pay = click on CTA). For group B the CTA is disabled
      // until email is valid, so click_pay still implicitly means "validated".
      ymGoal("click_pay", abParams(abEmailBeforePay));
      setPayLoading(true);
      try {
        const res = await createPayment(orderId, promoCode, withChat, withFiveReports, withAbonement, email);
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
    [orderId, router, abEmailBeforePay]
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
            abEmailBeforePay={abEmailBeforePay}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
