"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

import { captureAttribution, captureEntryPage } from "@/lib/attribution";

/**
 * Яндекс.Метрика — для всего сайта, КРОМЕ демо-контура расшифровки бак-посева.
 *
 * ⚠️ Почему исключение: счётчик инициализируется с `webvisor:true`, то есть
 * пишет сессию и DOM страницы. На /posev-demo пользователь загружает бланк
 * анализа, а на /posev-demo/report отрисован разбор — запись сессии means, что
 * содержимое медицинского документа уедет во внешний сервис. Это противоречит
 * и обещанию заказчику («данные не сохраняются»), и тексту политики обработки
 * ПДн на самом демо. Поэтому на этих путях счётчик не грузится вовсе — не
 * «отключается позже», а именно не вставляется в страницу.
 */
const EXCLUDED_PREFIXES = ["/posev-demo"];

/**
 * Пути, где вебвизор ОБЯЗАН быть выключен (баг 9e3084944a).
 *
 * ⚠️ Возражение выше касалось демо-контура, где данных пациента нет вообще, —
 * а на основном продукте они настоящие: на /result/{orderId} отрисован разбор
 * анализа живого платящего клиента (показатели, значения, формулировки,
 * лаборатория), на /chat/* и /ai-chat/* — переписка о его здоровье. Запись DOM
 * означает передачу содержимого медицинского документа третьему лицу.
 *
 * Счётчик здесь НЕ выключается целиком (в отличие от демо): цели нужны, а
 * `webvisor:false` убирает ровно запись сессии. Инициализация происходит один
 * раз за загрузку страницы, поэтому значение берётся от страницы ВХОДА — и
 * поэтому переходы в эти разделы сделаны жёсткими (page.tsx, ConsultComposer):
 * SPA-переход унёс бы в раздел уже включённый вебвизор.
 */
const NO_WEBVISOR_PREFIXES = ["/result", "/chat", "/ai-chat"];

export default function Analytics() {
  const pathname = usePathname();
  const excluded = !!pathname && EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));
  const webvisor = !(pathname && NO_WEBVISOR_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/")));

  // Снимок рекламной метки и страницы входа при ЛЮБОМ визите, а не только на «/».
  // Раньше captureAttribution() звался лишь из главной, поэтому переход из
  // объявления сразу на посадочную (ИИ-консультант, статья, калькулятор) терял
  // utm и yclid: заказ приходил без источника. Внутри — first-touch, повторный
  // вызов не перетирает первый, поэтому дёргать на каждый переход безопасно.
  // captureEntryPage() пишет ВСЕГДА (не только для рекламы) — нужна для оценки
  // конверсии органики: с какой страницы реально зашёл покупатель.
  // Хук стоит ДО раннего выхода: условный вызов хука React не допускает.
  useEffect(() => {
    if (excluded) return;
    try {
      captureAttribution();
      captureEntryPage();
    } catch {
      /* приватный режим — атрибуция не критична, страница важнее */
    }
  }, [pathname, excluded]);

  if (excluded) return null;

  return (
    <>
      <Script id="ym-init" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=108175626','ym');
          // Strip payment-provider referrers so returning from checkout doesn't
          // reset attribution to yookassa.ru (keep original Direct/UTM source).
          var _ymRef = document.referrer;
          try {
            if (_ymRef) {
              var _ymHost = new URL(_ymRef).hostname.toLowerCase();
              if (/(^|\\.)(yookassa|yoomoney|qiwi|sberbank|tinkoff)\\.[a-z]+$/.test(_ymHost)) { _ymRef = ''; }
            }
          } catch (e) {}
          ym(108175626,'init',{ssr:true,webvisor:${webvisor},clickmap:${webvisor},ecommerce:"dataLayer",referrer:_ymRef,url:location.href,accurateTrackBounce:true,trackLinks:true});
        `}</Script>
      <noscript>
        <div>
          <img
            src="https://mc.yandex.ru/watch/108175626"
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
