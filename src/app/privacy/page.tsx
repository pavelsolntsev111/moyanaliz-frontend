import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Мой Анализ",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Политика конфиденциальности</h1>

      <div className="prose prose-sm max-w-none space-y-4 text-sm leading-relaxed text-foreground/80">
        <p>
          Дата последнего обновления: 1 марта 2026 г.
        </p>
        <p>
          Оператор персональных данных — ООО «Настоящий Полет» (ОГРН 1247700663363,
          ИНН 9701297934, КПП 770101001), управляющее сервисом «Мой Анализ» (moyanaliz.ru).
        </p>

        <h2 className="text-lg font-semibold mt-6">1. Какие данные мы собираем</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Файл с результатами анализов (PDF или изображение)</li>
          <li>Пол и возраст (для корректной расшифровки)</li>
          <li>Адрес электронной почты (для отправки отчёта)</li>
          <li>IP-адрес и User-Agent (для обеспечения безопасности)</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">2. Как мы используем данные</h2>
        <p>
          Загруженные файлы используются исключительно для формирования расшифровки
          и автоматически удаляются через 24 часа после генерации отчёта.
          Email используется только для отправки отчёта.
        </p>

        <h2 className="text-lg font-semibold mt-6">3. Передача третьим лицам</h2>
        <p>
          Данные анализов обрабатываются с помощью API Anthropic (Claude) для формирования
          расшифровки. Мы не передаём персональные данные (email, IP) третьим лицам,
          за исключением платёжного провайдера (Точка Банк) для обработки оплаты.
        </p>

        <h2 className="text-lg font-semibold mt-6">4. Хранение данных</h2>
        <p>
          Загруженные файлы анализов хранятся не более 24 часов.
          Сгенерированные PDF-отчёты хранятся в течение 30 дней.
          Метаданные заказов хранятся в течение 1 года.
        </p>

        <h2 className="text-lg font-semibold mt-6">5. Безопасность</h2>
        <p>
          Все данные передаются по зашифрованному соединению (HTTPS).
          Файлы хранятся в защищённом облачном хранилище с ограниченным доступом.
        </p>

        <h2 className="text-lg font-semibold mt-6">6. Ваши права</h2>
        <p>
          Вы можете запросить удаление своих данных, написав на{" "}
          <a href="mailto:support@moyanaliz.ru" className="text-primary underline">support@moyanaliz.ru</a>.
        </p>

        <h2 className="text-lg font-semibold mt-6">7. Реквизиты оператора</h2>
        <p>
          ООО «Настоящий Полет»<br />
          ОГРН: 1247700663363<br />
          ИНН: 9701297934<br />
          КПП: 770101001<br />
          Email: <a href="mailto:support@moyanaliz.ru" className="text-primary underline">support@moyanaliz.ru</a>
        </p>
      </div>
    </div>
  );
}
