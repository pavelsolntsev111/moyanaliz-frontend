"use client";

import { useEffect, useState } from "react";

interface AnalyzingStepProps {
  onComplete: () => void;
}

export function AnalyzingStep({ onComplete }: AnalyzingStepProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const interval = 30;
    const steps = duration / interval;
    const increment = 100 / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        setProgress(100);
        clearInterval(timer);
        setTimeout(onComplete, 300);
      } else {
        setProgress(current);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      {/* Pulsing circles */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/30" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <svg
            className="h-8 w-8 animate-spin text-primary-foreground"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-bold text-foreground">
        Анализируем ваши результаты
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Это займёт несколько секунд...
      </p>

      <div className="mt-8 w-full max-w-xs">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
