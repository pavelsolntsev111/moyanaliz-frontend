"use client";

import { useState, useEffect } from "react";
import type { Gender } from "@/lib/types";
import { X } from "lucide-react";

interface GenderAgeModalProps {
  fileName: string;
  detecting?: boolean;
  suggestedSex?: "male" | "female" | null;
  suggestedAge?: number | null;
  onSubmit: (gender: Gender, age: number) => void;
  onClose: () => void;
}

export function GenderAgeModal({
  fileName,
  detecting = false,
  suggestedSex,
  suggestedAge,
  onSubmit,
  onClose,
}: GenderAgeModalProps) {
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (suggestedSex) setGender(suggestedSex);
    if (suggestedAge) setAge(String(suggestedAge));
  }, [suggestedSex, suggestedAge]);

  const isValid =
    gender !== null && Number(age) >= 1 && Number(age) <= 120 && age !== "";

  function handleSubmit() {
    if (!gender) {
      setError("Выберите пол");
      return;
    }
    const ageNum = Number(age);
    if (!ageNum || ageNum < 1 || ageNum > 120) {
      setError("Укажите корректный возраст (1–120)");
      return;
    }
    onSubmit(gender, ageNum);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-2xl"
        style={{
          background: 'var(--border)',
          borderRadius: 16,
          padding: '2px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.06), 0 20px 48px rgba(0,180,188,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
      <div
        style={{
          background: 'linear-gradient(145deg, var(--card) 0%, var(--background) 100%)',
          borderRadius: '14px',
          padding: '28px 28px 32px',
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress indicator */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="h-1 w-8 rounded-full bg-primary" />
            <div className="h-2 w-2 rounded-full bg-primary/30" />
            <div className="h-1 w-8 rounded-full bg-muted" />
            <div className="h-2 w-2 rounded-full bg-primary/30" />
          </div>
          <span className="text-xs text-muted-foreground">Шаг 2 из 3</span>
        </div>

        <h2 className="text-lg font-bold text-card-foreground">
          Уточните данные
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Нормы анализов зависят от пола и возраста — без этих данных расшифровка будет неточной
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <p className="truncate text-xs text-muted-foreground flex-1">{fileName}</p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-xs text-primary hover:underline"
          >
            ← Изменить
          </button>
        </div>

        {/* Loading state */}
        {detecting ? (
          <div className="mt-8 mb-6 flex flex-col items-center gap-3 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">
              Читаем документ, определяем данные пациента…
            </p>
          </div>
        ) : (
          <>
            {(suggestedSex || suggestedAge) && (
              <p className="mt-2 text-xs text-primary/70">
                Данные определены из документа — проверьте и при необходимости исправьте
              </p>
            )}

            {/* Gender */}
            <fieldset className="mt-5">
              <legend className="text-sm font-medium text-card-foreground">
                Пол
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "male", label: "Мужской" },
                    { value: "female", label: "Женский" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setGender(option.value);
                      setError("");
                    }}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                      gender === option.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-card-foreground hover:border-primary/40"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Age */}
            <div className="mt-5">
              <label
                htmlFor="age-input"
                className="text-sm font-medium text-card-foreground"
              >
                Возраст
              </label>
              <input
                id="age-input"
                type="number"
                min={1}
                max={120}
                placeholder="Например, 35"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid) handleSubmit();
                }}
                className="mt-2 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Продолжить
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
