import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных — Мой Анализ",
  description:
    "Политика в отношении обработки персональных данных сервиса «Мой Анализ»: какие данные собираем, на каком основании, кому передаём, сколько храним и как их удалить.",
  alternates: { canonical: "/privacy" },
};

/**
 * Политика в отношении обработки персональных данных (ст. 18.1 152-ФЗ).
 *
 * ⚠️ Документ должен описывать то, что система делает НА САМОМ ДЕЛЕ. Опубликованное обещание,
 * которое опровергается одним запросом к сервису, хуже отсутствия документа. Сроки хранения
 * ниже сверены с кодом: оригиналы удаляет cleanup_loop (CLEANUP_DAYS=30), отчёты — 12 месяцев,
 * данные о заказах и оплате хранятся 5 лет по требованию налогового законодательства.
 * Меняете сроки в коде — правьте и здесь.
 */

const UPDATED = "13 августа 2026 года";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-foreground">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Политика в отношении обработки персональных данных
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Редакция от {UPDATED}. Действует для сайта moyanaliz.ru и всех его сервисов.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground">
            Коротко: мы просим только файл анализа и почту. Файл нужен, чтобы сделать разбор,
            почта — чтобы прислать отчёт. Имя и телефон не спрашиваем, регистрация не нужна.
            Данные о здоровье обрабатываем только с вашего согласия и только для расшифровки —
            не продаём их, не передаём рекламодателям и не выкладываем в открытый доступ.
            Полные условия — ниже.
          </div>

          <Section n={1} title="Оператор">
            <p>
              Оператором персональных данных является индивидуальный предприниматель Солнцев
              Павел Владимирович (ОГРНИП 326774600300742, ИНН 501815177453), которому принадлежит
              сервис «Мой Анализ» (moyanaliz.ru).
            </p>
            <p>
              Контакт по любым вопросам об обработке данных, включая отзыв согласия и удаление:{" "}
              <a href="mailto:support@moyanaliz.ru" className="text-primary hover:underline">
                support@moyanaliz.ru
              </a>
              .
            </p>
          </Section>

          <Section n={2} title="Какие данные мы обрабатываем">
            <p>
              <span className="font-medium text-foreground">Файл с результатами анализов</span> —
              PDF или фотография бланка, которые вы загружаете, и извлечённые из них сведения:
              названия показателей, их значения, референсные диапазоны, название лаборатории, а
              также пол и возраст, если они напечатаны на бланке. Отдельно пол и возраст мы не
              спрашиваем.
            </p>
            <p>
              <span className="font-medium text-foreground">Адрес электронной почты</span> — вы
              указываете его, чтобы получить отчёт.
            </p>
            <p>
              <span className="font-medium text-foreground">Технические данные</span> — IP-адрес,
              данные браузера (User-Agent), сведения о посещении страниц. Собираются для защиты
              от злоупотреблений и для веб-аналитики.
            </p>
            <p>
              <span className="font-medium text-foreground">Данные об оплате</span> — сумма, время
              и статус платежа. Реквизиты карты вводятся на стороне платёжного сервиса и нам не
              передаются: мы видим только последние четыре цифры и способ оплаты.
            </p>
            <p>
              <span className="font-medium text-foreground">Переписка с поддержкой</span> — то, что
              вы пишете нам сами: текст обращения, вложения (например, скриншот чека), обратный
              адрес.
            </p>
            <p className="rounded-lg border border-amber-200/60 bg-amber-50/60 p-4 text-foreground dark:border-amber-900/40 dark:bg-amber-950/30">
              Результаты анализов — это сведения о состоянии здоровья, то есть{" "}
              <span className="font-medium">специальная категория персональных данных</span> (ст. 10
              152-ФЗ). Мы обрабатываем их исключительно на основании вашего согласия, которое вы
              даёте перед загрузкой файла, и только для того, чтобы сформировать расшифровку.
              Согласие можно отозвать в любой момент.
            </p>
          </Section>

          <Section n={3} title="Зачем мы их обрабатываем и на каком основании">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-foreground">
                    <th className="py-2 pr-4 font-medium">Цель</th>
                    <th className="py-2 pr-4 font-medium">Данные</th>
                    <th className="py-2 font-medium">Основание</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-4">Расшифровка анализа</td>
                    <td className="py-2 pr-4">Файл и извлечённые показатели</td>
                    <td className="py-2">Ваше согласие (ст. 9, ст. 10 152-ФЗ)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-4">Отправка отчёта, ответы поддержки</td>
                    <td className="py-2 pr-4">Email, переписка</td>
                    <td className="py-2">Исполнение договора (оферты)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-4">Приём оплаты и фискальный чек</td>
                    <td className="py-2 pr-4">Сумма, статус платежа, email</td>
                    <td className="py-2">Требование закона (54-ФЗ, НК РФ)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-4">Защита от злоупотреблений</td>
                    <td className="py-2 pr-4">IP-адрес, User-Agent</td>
                    <td className="py-2">Законный интерес оператора</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-4">Веб-аналитика</td>
                    <td className="py-2 pr-4">Обезличенные данные о посещении</td>
                    <td className="py-2">Законный интерес оператора</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Письма о наших услугах и акциях</td>
                    <td className="py-2 pr-4">Email</td>
                    <td className="py-2">Ваше согласие; отписка в каждом письме</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Мы не принимаем в отношении вас решений на основании исключительно автоматизированной
              обработки, которые порождали бы юридические последствия. Расшифровка носит справочный
              характер, не является медицинским заключением и не заменяет консультацию врача.
            </p>
          </Section>

          <Section n={4} title="Что мы делаем с данными">
            <p>
              Сбор, запись, систематизация, накопление, хранение, уточнение, использование,
              передача обработчикам (см. раздел 5), обезличивание, блокирование, удаление и
              уничтожение — с использованием средств автоматизации.
            </p>
            <p>
              Мы <span className="font-medium text-foreground">не</span> продаём персональные
              данные, не передаём их рекламодателям, брокерам данных, страховым компаниям и
              работодателям и не публикуем их в открытом доступе.
            </p>
          </Section>

          <Section n={5} title="Кому мы передаём данные">
            <p>
              Мы привлекаем подрядчиков-обработчиков, которые действуют по нашему поручению и
              только в объёме, необходимом для их функции:
            </p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>
                <span className="font-medium text-foreground">Расшифровка анализа:</span> Anthropic
                (Claude), Google (Gemini), OpenAI — в эти сервисы передаётся содержимое бланка без
                вашего email. Компании расположены за пределами России.
              </li>
              <li>
                <span className="font-medium text-foreground">Отправка писем:</span> Resend,
                AgentMail — передаётся email и текст письма.
              </li>
              <li>
                <span className="font-medium text-foreground">Приём оплаты и чеки:</span> ЮKassa,
                CloudKassir, оператор фискальных данных — передаются сумма и email для чека.
              </li>
              <li>
                <span className="font-medium text-foreground">Хостинг и хранение файлов:</span>{" "}
                Timeweb Cloud (Россия), Railway (за пределами России).
              </li>
              <li>
                <span className="font-medium text-foreground">Веб-аналитика:</span> Яндекс.Метрика.
                На страницах, где вводятся данные о здоровье, счётчик отключён.
              </li>
            </ul>
            <p>
              Часть обработчиков находится за пределами Российской Федерации, то есть имеет место
              трансграничная передача данных. Мы передаём в такие сервисы только то, что необходимо
              для оказания услуги, и не передаём туда ваш email вместе с содержимым анализа.
            </p>
            <p>
              Данные могут быть предоставлены государственным органам, если этого требует закон.
            </p>
          </Section>

          <Section n={6} title="Сколько мы храним данные">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>
                <span className="font-medium text-foreground">Оригинал загруженного бланка</span> —
                не более 30 дней с момента загрузки, затем удаляется автоматически. Этот срок нужен,
                чтобы поддержка могла перевыпустить отчёт, если что-то пошло не так.
              </li>
              <li>
                <span className="font-medium text-foreground">Отчёт (PDF) и текст расшифровки</span>{" "}
                — 12 месяцев с даты формирования, затем удаляются. После этого ссылка на отчёт
                перестаёт работать, поэтому сохраните файл себе.
              </li>
              <li>
                <span className="font-medium text-foreground">Сведения о заказе и оплате</span> —
                5 лет: столько первичные документы обязаны храниться по налоговому законодательству.
              </li>
              <li>
                <span className="font-medium text-foreground">Email для писем о наших услугах</span>{" "}
                — до отписки или отзыва согласия.
              </li>
              <li>
                <span className="font-medium text-foreground">Переписка с поддержкой</span> — 3 года
                (срок исковой давности).
              </li>
            </ul>
            <p>
              По вашему требованию мы удалим данные раньше указанных сроков, кроме тех, которые
              обязаны хранить по закону.
            </p>
          </Section>

          <Section n={7} title="Ваши права">
            <p>Вы вправе:</p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>узнать, обрабатываем ли мы ваши данные, и получить их копию;</li>
              <li>потребовать исправить неточные данные;</li>
              <li>отозвать согласие и потребовать удалить данные;</li>
              <li>возразить против получения писем о наших услугах;</li>
              <li>обжаловать наши действия в Роскомнадзоре или в суде.</li>
            </ul>
            <p>
              Чтобы воспользоваться любым из этих прав, напишите на{" "}
              <a href="mailto:support@moyanaliz.ru" className="text-primary hover:underline">
                support@moyanaliz.ru
              </a>{" "}
              с того адреса, который вы указывали при заказе, — так мы сможем убедиться, что запрос
              исходит от вас. Мы отвечаем в течение 30 дней, обычно быстрее.
            </p>
            <p>
              Отзыв согласия останавливает обработку данных о здоровье и влечёт удаление файла и
              расшифровки. Уже оказанную услугу это не отменяет, а сведения об оплате мы обязаны
              сохранить по закону.
            </p>
          </Section>

          <Section n={8} title="Как мы защищаем данные">
            <p>
              Данные передаются по зашифрованному соединению (HTTPS). Файлы хранятся в облачном
              хранилище с ограниченным доступом, отчёт открывается по персональной ссылке —
              не пересылайте её посторонним. Доступ к данным внутри сервиса имеют только те, кому
              он нужен для работы поддержки. Мы применяем правовые, организационные и технические
              меры по ст. 19 152-ФЗ.
            </p>
            <p>
              Полностью исключить риски при передаче данных через интернет невозможно. Если вы не
              хотите передавать нам фамилию, закрасьте её на бланке перед загрузкой — на качество
              расшифровки это не влияет.
            </p>
          </Section>

          <Section n={9} title="Дети">
            <p>
              Сервис предназначен для лиц старше 18 лет. Загрузить анализ ребёнка может его
              родитель или законный представитель — в этом случае согласие на обработку данных
              ребёнка даёте вы.
            </p>
          </Section>

          <Section n={10} title="Файлы cookie и аналитика">
            <p>
              Мы используем cookie, необходимые для работы сайта, и Яндекс.Метрику для анализа
              посещаемости. Отключить аналитику можно настройками браузера или блокировщиком;
              на работу сервиса это не влияет.
            </p>
          </Section>

          <Section n={11} title="Изменения политики">
            <p>
              Актуальная редакция всегда опубликована на этой странице с датой обновления. Если
              изменения существенно затронут ваши права, мы сообщим об этом по электронной почте.
            </p>
          </Section>

          <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Смежные документы:{" "}
            <Link href="/consent" className="text-primary hover:underline">
              согласие на обработку персональных данных
            </Link>
            ,{" "}
            <Link href="/offer" className="text-primary hover:underline">
              публичная оферта
            </Link>
            ,{" "}
            <Link href="/guarantee" className="text-primary hover:underline">
              гарантия возврата
            </Link>
            .
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
