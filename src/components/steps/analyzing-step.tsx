"use client";

import type { MutableRefObject } from "react";
import { AnalysisScanner } from "@/components/analysis-scanner";

interface AnalyzingStepProps {
  onComplete: () => void;
  isReady: MutableRefObject<boolean>;
}

export function AnalyzingStep({ onComplete, isReady }: AnalyzingStepProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-8">
      <AnalysisScanner isReady={isReady} onComplete={onComplete} />
    </div>
  );
}
