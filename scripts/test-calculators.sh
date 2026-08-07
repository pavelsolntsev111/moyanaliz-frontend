#!/bin/bash
# Регрессионный тест формул калькуляторов: транспилирует engine и сверяет с эталонными значениями.
set -e
cd "$(dirname "$0")/.."
npx --yes esbuild src/lib/calculators-engine.ts --format=esm --outfile=.calc-engine.mjs --log-level=error
node scripts/test-calculators.mjs
rm -f .calc-engine.mjs
