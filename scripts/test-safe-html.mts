import {formatInlineSafe, safeHref, jsonLdScript} from "../src/lib/safe-html.ts";
const cases = [
  ['<img src=x onerror=alert(1)>', t=>!t.includes("<img")],
  ['<script>alert(1)</script>',    t=>!t.includes("<script")],
  ['[клик](javascript:alert(1))',  t=>!/javascript:/i.test(t) && t.includes("клик")],
  ['[клик](data:text/html,x)',     t=>!t.includes("<a")],
  ['[клик](//evil.com)',           t=>!t.includes("<a")],
  ['[норма](/indicators/ferritin)',t=>t.includes('href="/indicators/ferritin"')],
  ['[ок](https://aif.ru/a?b=1&c=2)',t=>t.includes('href="https://aif.ru/a?b=1&amp;c=2"')],
  ['**жирный** и *курсив*',        t=>t.includes("<strong>жирный</strong>") && t.includes("<em>курсив</em>")],
  ['5 < 7 и a & b',                t=>t.includes("&lt;") && t.includes("&amp;")],
];
let bad=0;
for (const [input, ok] of cases) {
  const out = formatInlineSafe(input);
  const pass = ok(out);
  if (!pass) bad++;
  console.log(`${pass?"ok  ":"ПРОВАЛ"} ${JSON.stringify(input).slice(0,42).padEnd(44)} → ${out.slice(0,60)}`);
}
const ld = jsonLdScript({t:"</script><script>alert(1)</script>"});
const ldOk = !ld.includes("</script>");
console.log(`${ldOk?"ok  ":"ПРОВАЛ"} JSON-LD не закрывает тег → ${ld.slice(0,60)}`);
if(!ldOk) bad++;
console.log(bad ? `\nПРОВАЛОВ: ${bad}` : "\nвсе проверки пройдены");
process.exit(bad?1:0);
