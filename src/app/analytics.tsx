"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

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

export default function Analytics() {
  const pathname = usePathname();
  if (pathname && EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return null;

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
          ym(108175626,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:_ymRef,url:location.href,accurateTrackBounce:true,trackLinks:true});
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
