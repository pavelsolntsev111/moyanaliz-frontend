"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AppStep, PreviewData } from "@/lib/types";
import { ymGoal } from "@/lib/ym";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadStep } from "@/components/steps/upload-step";
import { AnalyzingStep } from "@/components/steps/analyzing-step";
import { PaywallStep } from "@/components/steps/paywall-step";
import { uploadFile, createPayment, applyPromo, type PriceBundle } from "@/lib/api";
import { captureAttribution } from "@/lib/attribution";
import { useRouter } from "next/navigation";

// Fallback prices: only used while /upload is still in flight or if the
// backend response is missing `prices` (old build during a partial deploy).
const FALLBACK_PRICES: PriceBundle = {
  single: 249,
  combo: 298,
  chat_upsell: 49,
  three_reports: 375,
  abonement: 750,
};

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
  // A/B price test bucket. "control"|"test"|null (null = pre-upload, treated as control).
  const [abPriceV1, setAbPriceV1] = useState<string | null>(null);
  // A/B CTA test bucket. "control"|"test"|null. Independent from ab_price_v1
  // (assigned via MD5+salt on backend).
  const [abCtaV1, setAbCtaV1] = useState<string | null>(null);
  // A/B skip-preview test bucket. "control"|"test"|null. Decided CLIENT-SIDE
  // (see handleFileSelected) so file_selected can carry it — the whole point is
  // the front-funnel (file_selected→file_uploaded). Ref keeps it stable across
  // re-selects within a session.
  const [abSkipPreview, setAbSkipPreview] = useState<string | null>(null);
  const abSkipRef = useRef<string | null>(null);
  const [prices, setPrices] = useState<PriceBundle>(FALLBACK_PRICES);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const uploadDone = useRef(false);

  // Stable tag attached to every YM goal once we know the order's bucket.
  // Goals fired before /upload completes (page_loaded) carry no ab tag — they're
  // per-visitor. EXCEPTION: file_selected carries `skip_preview` (client-decided
  // before upload) so the front-funnel is splittable.
  // `price`/`cta` tests are closed (everyone control) but kept for continuity.
  // All params live on the same goal hit — Метрика «Параметры визитов» делит по любому.
  const abParams = (group: boolean, priceGroup: string | null, ctaGroup: string | null, skipGroup: string | null) => ({
    ab: group ? "B" : "A",
    price: priceGroup === "test" ? "test" : "control",
    cta: ctaGroup === "test" ? "test" : "control",
    skip_preview: skipGroup === "test" ? "test" : "control",
  });

  const handleFileSelected = useCallback(async (f: File) => {
    // Roll the skip-preview bucket BEFORE file_selected so the goal carries it
    // → file_selected→file_uploaded becomes splittable per arm (the hypothesis
    // is specifically front-funnel: recover the ~5.8% lost on the light wait).
    let skip = abSkipRef.current;
    if (skip === null) {
      skip = Math.random() < 0.5 ? "test" : "control";
      abSkipRef.current = skip;
      setAbSkipPreview(skip);
    }
    ymGoal("file_selected", { skip_preview: skip });
    setStep("analyzing");
    uploadDone.current = false;
    try {
      const res = await uploadFile(f, skip);
      setOrderId(res.order_id);
      setPreview(res.preview);
      const ab = !!res.ab_email_before_pay;
      const priceGroup = res.ab_price_v1 ?? null;
      const ctaGroup = res.ab_cta_v1 ?? null;
      // Trust the bucket the backend echoes (it stored this on the order).
      const skipGroup = res.ab_skip_preview ?? skip;
      setAbEmailBeforePay(ab);
      setAbPriceV1(priceGroup);
      setAbCtaV1(ctaGroup);
      setAbSkipPreview(skipGroup);
      if (res.prices) setPrices(res.prices);
      ymGoal("file_uploaded", abParams(ab, priceGroup, ctaGroup, skipGroup));
      if (skipGroup === "test") {
        // No-freemium arm: straight to paywall, skip the analyzing animation.
        setStep("paywall");
        ymGoal("free_report_shown", abParams(ab, priceGroup, ctaGroup, skipGroup));
      } else {
        uploadDone.current = true;  // analyzing animation finishes → handleAnalyzingComplete
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
      setStep("upload");
    }
  }, []);

  const handleAnalyzingComplete = useCallback(() => {
    setStep("paywall");
    ymGoal("free_report_shown", abParams(abEmailBeforePay, abPriceV1, abCtaV1, abSkipPreview));
  }, [abEmailBeforePay, abPriceV1, abCtaV1, abSkipPreview]);

  const handlePay = useCallback(
    async (promoCode?: string, withChat?: boolean, withThreeReports?: boolean, withAbonement?: boolean, email?: string) => {
      // Fire BEFORE network call — preserves current Yandex.Direct optimization
      // semantics (click_pay = click on CTA). For group B the CTA is disabled
      // until email is valid, so click_pay still implicitly means "validated".
      ymGoal("click_pay", abParams(abEmailBeforePay, abPriceV1, abCtaV1, abSkipPreview));
      setPayLoading(true);
      try {
        const res = await createPayment(orderId, promoCode, withChat, withThreeReports, withAbonement, email);
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
    [orderId, router, abEmailBeforePay, abPriceV1, abCtaV1, abSkipPreview]
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
            prices={prices}
            abPriceV1={abPriceV1}
            abCtaV1={abCtaV1}
            skipPreview={abSkipPreview === "test"}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
