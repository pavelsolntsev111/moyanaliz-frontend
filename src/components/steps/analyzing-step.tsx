"use client";

import type { MutableRefObject } from "react";
import type { PreviewData } from "@/lib/types";
import { AnalysisScanner } from "@/components/analysis-scanner";

interface AnalyzingStepProps {
  onComplete: () => void;
  isReady: MutableRefObject<boolean>;
  preview: PreviewData | null;
}

export function AnalyzingStep({ onComplete, isReady, preview }: AnalyzingStepProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-8">
      <AnalysisScanner isReady={isReady} onComplete={onComplete} preview={preview} />
    </div>
  );
}
