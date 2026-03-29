"use client";

import { useState } from "react";
import type { MutableRefObject } from "react";
import type { PreviewData, Gender } from "@/lib/types";
import { AnalysisScanner } from "@/components/analysis-scanner";
import { User, Calendar, ArrowRight } from "lucide-react";

interface AnalyzingStepProps {
  onComplete: () => void;
  isReady: MutableRefObject<boolean>;
  preview: PreviewData | null;
  detectedSex?: Gender | null;
  detectedAge?: number | null;
  onFormSubmit?: (sex: Gender, age: number) => void;
}

export function AnalyzingStep({ onComplete, isReady, preview, detectedSex, detectedAge, onFormSubmit }: AnalyzingStepProps) {
  const [phase, setPhase] = useState<"form" | "scanning">("form");
  const [sex, setSex] = useState<Gender | null>(null);
  const [age, setAge] = useState("");
  const [ageError, setAgeError] = useState("");

  const handleSubmit = () => {
    if (!sex) return;
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setAgeError("Введите возраст от 1 до 120");
      return;
    }
    setAgeError("");
    setPhase("scanning");
    onFormSubmit?.(sex, ageNum);
  };

  const handleAgeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isValid = sex !== null && age !== "" && !isNaN(parseInt(age, 10)) && parseInt(age, 10) >= 1 && parseInt(age, 10) <= 120;

  if (phase === "form") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* Header */}
          <div className="mb-5 text-center">
            <h2 className="text-lg font-semibold text-foreground">Уточните данные</h2>
            <p className="mt-1 text-sm text-muted-foreground">Нормы показателей зависят от пола и возраста</p>
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">Пол</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSex("male")}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  sex === "male"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                Мужской
              </button>
              <button
                type="button"
                onClick={() => setSex("female")}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  sex === "female"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                Женский
              </button>
            </div>
          </div>

          {/* Age */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-foreground">Возраст</label>
            <input
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => { setAge(e.target.value); setAgeError(""); }}
              onKeyDown={handleAgeKeyDown}
              placeholder="Например, 35"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {ageError && <p className="mt-1.5 text-xs text-destructive">{ageError}</p>}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            Начать анализ
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-8">
      {detectedSex && detectedAge && (
        <div className="mb-4 flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {detectedSex === "male" ? "Мужской" : "Женский"}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {detectedAge} лет
          </span>
        </div>
      )}
      <AnalysisScanner isReady={isReady} onComplete={onComplete} preview={preview} />
    </div>
  );
}
