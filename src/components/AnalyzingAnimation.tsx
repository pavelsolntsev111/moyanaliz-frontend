"use client";

import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

const STEPS = [
  "Загружаем файл...",
  "Распознаём текст...",
  "Анализируем показатели...",
];
const DURATION = 2500;

export default function AnalyzingAnimation({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, DURATION / STEPS.length);

    const timeout = setTimeout(onComplete, DURATION);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-border" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium">{STEPS[step]}</p>
      </div>
      <div className="w-64 h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
