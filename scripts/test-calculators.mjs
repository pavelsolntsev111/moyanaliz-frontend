import { engines, getEngine } from "../.calc-engine.mjs";

const cases = [
  // [slug, inputs, expected value, tolerance, описание источника-эталона]
  ["skf-ckd-epi", {crea:"79.6", age:"50", sex:"f"}, 77.9, 1.5, "CKD-EPI 2021, ж 50 лет, Scr 0.9 мг/дл"],
  ["skf-ckd-epi", {crea:"88.4", age:"60", sex:"m"}, 88.6, 4, "CKD-EPI 2021, м 60 лет, Scr 1.0 мг/дл"],
  ["klirens-kreatinina", {crea:"79.6", age:"50", weight:"70", sex:"f"}, 82.6, 1.5, "Кокрофт-Голт"],
  ["homa-ir", {glu:"5.5", ins:"10"}, 2.44, 0.05, "HOMA-IR = Г×И/22.5"],
  ["lpnp-fridvald", {tc:"5.2", hdl:"1.3", tg:"1.7"}, 3.13, 0.03, "Фридвальд ммоль/л"],
  ["koefficient-aterogennosti", {tc:"5.2", hdl:"1.3"}, 3.0, 0.02, "КА=(ОХ−ЛПВП)/ЛПВП"],
  ["ne-lpvp-holesterin", {tc:"5.2", hdl:"1.3"}, 3.9, 0.02, "не-ЛПВП"],
  ["koefficient-de-ritisa", {ast:"40", alt:"20"}, 2.0, 0.01, "АСТ/АЛТ"],
  ["nasyshchenie-transferrina", {iron:"15", mode:"tibc", second:"60"}, 25, 0.2, "TSAT=Fe/ОЖСС×100"],
  ["indeks-mentzera", {mcv:"70", rbc:"5.5"}, 12.7, 0.1, "MCV/RBC → талассемия"],
  ["skorrektirovannyj-kalcij", {ca:"2.2", alb:"30"}, 2.4, 0.01, "Ca+0.02×(40−альб)"],
  ["osmolyarnost-plazmy", {na:"140", glu:"5", urea:"5"}, 290, 0.5, "2Na+глю+моч"],
  ["anionnaya-raznica", {na:"140", cl:"104", hco3:"24"}, 12, 0.1, "Na−(Cl+HCO3)"],
  ["abs-chislo-nejtrofilov", {wbc:"5", seg:"50", band:"0"}, 2.5, 0.01, "АЧН"],
  ["nlr-nejtrofily-limfocity", {neu:"5", lym:"2"}, 2.5, 0.01, "НЛР"],
  ["hba1c-srednyaya-glyukoza", {a1c:"6.5"}, 7.77, 0.05, "ADAG: 6.5% ≈ 7.8 ммоль/л"],
  ["fib-4", {age:"50", ast:"40", alt:"50", plt:"200"}, 1.414, 0.01, "FIB-4"],
  ["reticulocytarnyj-indeks", {ret:"2", hct:"45"}, 2.0, 0.01, "рет×Ht/45"],
  ["skf-deti-shvarc", {height:"120", crea:"40"}, 109.5, 1, "Шварц"],
  ["imt-kalkulyator", {height:"175", weight:"70"}, 22.9, 0.1, "ИМТ"],
  ["tyg-indeks", {tg:"1.7", glu:"5.5"}, 8.92, 0.05, "TyG"],
  ["konverter-edinic-analizov", {what:"glu", value:"5.5", dir:"si2us"}, 99.1, 0.2, "глюкоза 5.5 ммоль/л = 99 мг/дл"],
];

let ok=0, bad=0;
for (const [slug, inp, exp, tol, desc] of cases) {
  const e = getEngine(slug);
  if (!e) { console.log(`  ❌ НЕТ движка ${slug}`); bad++; continue; }
  const r = e.compute(inp);
  if (r.value === null) { console.log(`  ❌ ${slug}: null (${desc})`); bad++; continue; }
  const diff = Math.abs(r.value - exp);
  if (diff <= tol) { console.log(`  ✅ ${slug.padEnd(30)} = ${r.value.toFixed(2).padStart(8)} (эталон ${exp}) · ${r.band?.label ?? "—"}`); ok++; }
  else { console.log(`  ❌ ${slug.padEnd(30)} = ${r.value.toFixed(3)} ОЖИДАЛОСЬ ${exp}±${tol} · ${desc}`); bad++; }
}
// граничные случаи
const fw = getEngine("lpnp-fridvald").compute({tc:"5.2",hdl:"1.3",tg:"5.0"});
console.log(fw.value===null ? "  ✅ Фридвальд при ТГ>4.5 корректно отказывает" : "  ❌ Фридвальд не отказал при ТГ>4.5");
const gz = getEngine("deficit-zheleza-ganzoni").compute({weight:"70",hb:"100",target:"140"});
console.log(`  ℹ️  Ганзони 70кг 100→140 г/л = ${gz.value?.toFixed(0)} мг (ожидаем ~1172)`);
console.log(`\nдвижков всего: ${engines.length} · тестов пройдено ${ok}, провалено ${bad}`);
