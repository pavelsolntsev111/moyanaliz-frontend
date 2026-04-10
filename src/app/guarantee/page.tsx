import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Гарантия качества — Мой Анализ",
  description:
    "Условия гарантии возврата средств сервиса Мой Анализ. Когда возвращаем деньги, порядок обращения, ограничения.",
};

export default function GuaranteePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Гарантия качества</h1>

      <div className="prose prose-sm max-w-none space-y-4 text-sm leading-relaxed text-foreground/80">
        <p>
          Мы уверены в качестве работы сервиса. Если по нашей вине вы не получили
          результат — мы вернём деньги.
        </p>

        <h2 className="text-lg font-semibold mt-6">1. Когда мы возвращаем деньги</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Сервис не смог обработать загруженный файл или вернул ошибку —
            отчёт не сформирован в течение 24 часов после оплаты.
          </li>
          <li>
            Ошибка не устранена в течение 24 часов после обращения в службу
            поддержки.
          </li>
          <li>Двойное списание средств за один и тот же анализ.</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">2. Порядок обращения за возвратом</h2>
        <p>
          Для оформления возврата необходимо направить запрос на{" "}
          <a
            href="mailto:support@moyanaliz.ru"
            className="text-primary underline"
          >
            support@moyanaliz.ru
          </a>{" "}
          <strong>в течение 3 календарных дней</strong> с момента оплаты.
        </p>
        <p>В обращении укажите:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Email, который вы указывали при оплате.</li>
          <li>
            Скриншот или фото подтверждения платежа (платёжка, чек из банка
            или уведомление об оплате).
          </li>
        </ul>
        <p>
          Срок рассмотрения обращения — до 24 часов в рабочие дни. Возврат
          средств осуществляется в течение 5–10 рабочих дней.
        </p>

        <h2 className="text-lg font-semibold mt-6">3. Когда возврат невозможен</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Субъективное недовольство стилем или объёмом текста расшифровки.
          </li>
          <li>
            Расхождение результатов расшифровки с мнением лечащего врача. Сервис
            носит информационный характер и не является медицинской услугой.
          </li>
          <li>
            Загруженный документ не является лабораторным анализом (рецепт,
            направление, фото и т.&nbsp;д.).
          </li>
          <li>С момента оплаты прошло более 3 календарных дней.</li>
          <li>
            Не предоставлен email заказа или подтверждение платежа.
          </li>
        </ul>

        <hr className="my-6 border-border" />

        <p className="text-xs text-muted-foreground">
          Настоящая страница дополняет{" "}
          <Link href="/offer" className="underline hover:text-primary">
            публичную оферту
          </Link>{" "}
          и{" "}
          <Link href="/terms" className="underline hover:text-primary">
            условия использования
          </Link>
          . В случае противоречий приоритет имеет публичная оферта.
        </p>
      </div>
    </div>
  );
}
