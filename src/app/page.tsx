"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AppStep, PreviewData } from "@/lib/types";
import { ymGoal } from "@/lib/ym";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadStep } from "@/components/steps/upload-step";
import { AnalyzingStep } from "@/components/steps/analyzing-step";
import { PaywallStep } from "@/components/steps/paywall-step";
import { uploadFile, createPayment, applyPromo, markExampleOpened, type PriceBundle, type UploadResponse } from "@/lib/api";
import { captureAttribution } from "@/lib/attribution";
import { useRouter } from "next/navigation";

// Fallback prices: only used while /upload is still in flight or if the
// backend response is missing `prices` (old build during a partial deploy).
const FALLBACK_PRICES: PriceBundle = {
  single: 299,
  combo: 349,
  chat_upsell: 49,
  three_reports: 449,
  abonement: 899,
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
    // Cross-device pack/abonement redeem (bug b7b0b7e49c): a "расшифровать
    // следующий анализ" link carries ?pack=CODE → stash it so the paywall shows
    // the one-tap free banner even on a device opened fresh from email.
    try {
      const pack = new URLSearchParams(window.location.search).get("pack");
      if (pack && pack.trim()) {
        localStorage.setItem("moyanaliz_pack_code", JSON.stringify({ code: pack.trim(), ts: Date.now() }));
      }
    } catch { /* ignore */ }
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
  // A/B premium packaging test. "control"|"test"|null. Server-side hash bucket.
  const [abPremiumV1, setAbPremiumV1] = useState<string | null>(null);
  // A/B order-bump test. "control"|"test"|null. Server-side hash bucket.
  // test → combo tier card replaced by a chat add-on checkbox above the CTA.
  const [abBumpV1, setAbBumpV1] = useState<string | null>(null);
  // A/B pack-reframe test. "control"|"test"|null. Server-side hash bucket.
  // test → 3-report pack card becomes a 5-report pack (499). Price from API.
  const [abPackV1, setAbPackV1] = useState<string | null>(null);
  // A/B sample-report test. "control"|"test"|null. Server-side hash bucket.
  // test → clickable "пример готового отчёта" block + modal above the CTA.
  const [abExampleV1, setAbExampleV1] = useState<string | null>(null);
  // A/B combo-urgency test (CLOSED — kept for result-page tag continuity).
  const [abComboPromoV1, setAbComboPromoV1] = useState<string | null>(null);
  // A/B −25% sale test. "control"|"test"|null. test → struck prices on single
  // (399→299) + combo (465→349) + "акция до конца дня" countdown. Price-neutral.
  const [abSaleV1, setAbSaleV1] = useState<string | null>(null);
  const [prices, setPrices] = useState<PriceBundle>(FALLBACK_PRICES);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const uploadDone = useRef(false);
  // Instant-paywall arm: the /upload runs in the background while the paywall is
  // already on screen. Pay/promo handlers await this to get order_id (or surface
  // the upload error) at click time. null = no upload started this session.
  const uploadPromiseRef = useRef<Promise<UploadResponse> | null>(null);

  // Stable tag attached to every YM goal once we know the order's bucket.
  // Goals fired before /upload completes (page_loaded) carry no ab tag — they're
  // per-visitor. EXCEPTION: file_selected carries `skip_preview` (client-decided
  // before upload) so the front-funnel is splittable.
  // `price`/`cta` tests are closed (everyone control) but kept for continuity.
  // All params live on the same goal hit — Метрика «Параметры визитов» делит по любому.
  const abParams = (group: boolean, priceGroup: string | null, ctaGroup: string | null, skipGroup: string | null, premiumGroup: string | null = abPremiumV1, bumpGroup: string | null = abBumpV1, packGroup: string | null = abPackV1, exampleGroup: string | null = abExampleV1, comboPromoGroup: string | null = abComboPromoV1, saleGroup: string | null = abSaleV1) => ({
    ab: group ? "B" : "A",
    price: priceGroup === "test" ? "test" : "control",
    cta: ctaGroup === "test" ? "test" : "control",
    skip_preview: skipGroup === "test" ? "test" : "control",
    premium: premiumGroup === "test" ? "test" : "control",
    bump: bumpGroup === "test" ? "test" : "control",
    pack: packGroup === "test" ? "test" : "control",
    example: exampleGroup === "test" ? "test" : "control",
    combo_promo: comboPromoGroup === "test" ? "test" : "control",
    sale: saleGroup === "test" ? "test" : "control",
  });

  const handleFileSelected = useCallback(async (f: File) => {
    // A/B ab_skip_preview — CLOSED 2026-06-04 after ~51h. Primary paid/selected
    // neutral (+0.3 п.п., p=0.88); preview proven a qualifier (no-preview gave
    // +8.1 п.п. clicks but click→paid 66% vs 89%, net wash). Light saving only
    // ~5000₽/мес (1.58₽/paid) — dwarfed by click_pay-signal degradation for
    // Direct. Everyone control now. Re-run: restore Math.random() below.
    // See memory/project_ab_skip_preview.md. Instant-paywall + section reorder
    // machinery kept (reorder applies to all; instant path is dormant).
    let skip = abSkipRef.current;
    if (skip === null) {
      skip = "control";
      abSkipRef.current = skip;
      setAbSkipPreview(skip);
    }
    ymGoal("file_selected", { skip_preview: skip });

    if (skip === "test") {
      // INSTANT paywall: show it immediately, upload the file in the BACKGROUND.
      // No analyzing screen at all — the whole point of this arm is "no wait".
      // Pay/promo handlers await uploadPromiseRef to get order_id (the user
      // spends seconds reading 4 tiers, so the upload is done by the time they
      // click). preview stays null; PaywallStep renders skipPreview layout.
      setAbSkipPreview("test");
      setStep("paywall");
      ymGoal("free_report_shown", abParams(false, null, null, "test"));
      const p = uploadFile(f, "test");
      uploadPromiseRef.current = p;
      p.then((res) => {
        setOrderId(res.order_id);
        setPreview(res.preview);
        setAbEmailBeforePay(!!res.ab_email_before_pay);
        setAbPriceV1(res.ab_price_v1 ?? null);
        setAbCtaV1(res.ab_cta_v1 ?? null);
        setAbSkipPreview(res.ab_skip_preview ?? "test");
        setAbPremiumV1(res.ab_premium_v1 ?? null);
        setAbBumpV1(res.ab_bump_v1 ?? null);
        setAbPackV1(res.ab_pack_v1 ?? null);
        setAbExampleV1(res.ab_example_v1 ?? null);
        setAbComboPromoV1(res.ab_combo_promo_v1 ?? null);
        setAbSaleV1(res.ab_sale_v1 ?? null);
        if (res.prices) setPrices(res.prices);
        ymGoal("file_uploaded", abParams(!!res.ab_email_before_pay, res.ab_price_v1 ?? null, res.ab_cta_v1 ?? null, res.ab_skip_preview ?? "test", res.ab_premium_v1 ?? null, res.ab_bump_v1 ?? null, res.ab_pack_v1 ?? null, res.ab_example_v1 ?? null, res.ab_combo_promo_v1 ?? null, res.ab_sale_v1 ?? null));
      }).catch(() => {
        // Don't bounce the user mid-read; ensureOrderId() surfaces the failure
        // on the pay/promo click and sends them back to re-upload.
      });
      return;
    }

    // control: analyzing animation → await upload → file_uploaded → paywall
    setStep("analyzing");
    uploadDone.current = false;
    try {
      const res = await uploadFile(f, skip);
      setOrderId(res.order_id);
      setPreview(res.preview);
      const ab = !!res.ab_email_before_pay;
      const priceGroup = res.ab_price_v1 ?? null;
      const ctaGroup = res.ab_cta_v1 ?? null;
      const skipGroup = res.ab_skip_preview ?? skip;
      const premiumGroup = res.ab_premium_v1 ?? null;
      const bumpGroup = res.ab_bump_v1 ?? null;
      const packGroup = res.ab_pack_v1 ?? null;
      const exampleGroup = res.ab_example_v1 ?? null;
      const comboPromoGroup = res.ab_combo_promo_v1 ?? null;
      const saleGroup = res.ab_sale_v1 ?? null;
      setAbEmailBeforePay(ab);
      setAbPriceV1(priceGroup);
      setAbCtaV1(ctaGroup);
      setAbSkipPreview(skipGroup);
      setAbPremiumV1(premiumGroup);
      setAbBumpV1(bumpGroup);
      setAbPackV1(packGroup);
      setAbExampleV1(exampleGroup);
      setAbComboPromoV1(comboPromoGroup);
      setAbSaleV1(saleGroup);
      if (res.prices) setPrices(res.prices);
      uploadDone.current = true;  // analyzing animation finishes → handleAnalyzingComplete
      ymGoal("file_uploaded", abParams(ab, priceGroup, ctaGroup, skipGroup, premiumGroup, bumpGroup, packGroup, exampleGroup, comboPromoGroup, saleGroup));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
      setStep("upload");
    }
  }, []);

  // Resolve order_id for pay/promo. In the instant-paywall arm the background
  // upload may still be running (await it) or have failed (→ null → recover).
  const ensureOrderId = useCallback(async (): Promise<string | null> => {
    if (orderId) return orderId;
    if (uploadPromiseRef.current) {
      try { return (await uploadPromiseRef.current).order_id; }
      catch { return null; }
    }
    return null;
  }, [orderId]);

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
      const oid = await ensureOrderId();
      if (!oid) {
        // instant-paywall arm: background upload failed/incomplete → recover
        setError("Не удалось загрузить файл. Попробуйте загрузить ещё раз.");
        setStep("upload");
        setPayLoading(false);
        return;
      }
      try {
        const res = await createPayment(oid, promoCode, withChat, withThreeReports, withAbonement, email);
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
    [ensureOrderId, router, abEmailBeforePay, abPriceV1, abCtaV1, abSkipPreview]
  );

  // A/B ab_example_v1: the sample-report modal was opened. Records it server-side
  // (best-effort) so open-rate per arm is queryable. ensureOrderId resolves the
  // background-upload id in the instant-paywall arm.
  const handleExampleOpen = useCallback(async () => {
    try {
      const oid = await ensureOrderId();
      if (oid) markExampleOpened(oid);
    } catch {
      /* best-effort tracking — never disrupt the UI */
    }
  }, [ensureOrderId]);

  const handlePromo = useCallback(
    async (email: string, promoCode: string, withChat?: boolean) => {
      setPayLoading(true);
      const oid = await ensureOrderId();
      if (!oid) {
        setError("Не удалось загрузить файл. Попробуйте загрузить ещё раз.");
        setStep("upload");
        setPayLoading(false);
        return;
      }
      try {
        const res = await applyPromo(oid, email, promoCode, withChat);
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
    [ensureOrderId, router]
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
            premiumTest={abPremiumV1 === "test"}
            bumpTest={abBumpV1 === "test"}
            packTest={abPackV1 === "test"}
            exampleTest={abExampleV1 === "test"}
            onExampleOpen={handleExampleOpen}
            saleTest={abSaleV1 === "test"}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
