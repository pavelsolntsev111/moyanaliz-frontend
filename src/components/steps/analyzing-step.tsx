"use client";

import type { MutableRefObject } from "react";
import type { PreviewData, Gender } from "@/lib/types";
import { AnalysisScanner } from "@/components/analysis-scanner";
import { User, Calendar } from "lucide-react";

interface AnalyzingStepProps {
  onComplete: () => void;
  isReady: MutableRefObject<boolean>;
  preview: PreviewData | null;
  detectedSex?: Gender | null;
  detectedAge?: number | null;
}

export function AnalyzingStep({ onComplete, isReady, preview, detectedSex, detectedAge }: AnalyzingStepProps) {
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
