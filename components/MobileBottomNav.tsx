"use client";

import React from "react";
import { StepId, STEPS } from "./StepProgress";

interface MobileBottomNavProps {
  currentStep: StepId;
  onSelectStep: (step: StepId) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  canGoNext: boolean;
  grandTotal: number;
  currency: string;
}

export default function MobileBottomNav({
  currentStep,
  onSelectStep,
  onNextStep,
  onPrevStep,
  canGoNext,
  grandTotal,
  currency,
}: MobileBottomNavProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const currentStepDef = STEPS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEPS.length - 1;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#141413] text-[#fef9ee] border-t-2 border-[#141413] px-3 pt-2 pb-safe sm:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Step indicator dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(step.id)}
              className={`w-6 h-6 flex items-center justify-center font-mono-data text-[10px] font-bold border ${
                step.id === currentStep
                  ? "bg-[#6ffbbe] text-[#005236] border-[#6ffbbe]"
                  : idx < currentIndex
                  ? "bg-[#2b2b28] text-[#6ffbbe] border-[#464742]"
                  : "bg-[#1c1c1a] text-[#767872] border-[#383834]"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Live Total */}
        <div className="text-right">
          <span className="text-[10px] font-mono-data text-[#c2b9a7] uppercase block leading-none">
            Bill Total
          </span>
          <span className="font-mono-data font-bold text-sm text-[#6ffbbe]">
            {currency}{grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-2 pb-1">
        {!isFirst ? (
          <button
            type="button"
            onClick={onPrevStep}
            className="w-12 h-11 flex items-center justify-center border-2 border-[#fef9ee] bg-[#2b2b28] text-[#fef9ee] font-bold active:bg-[#383834]"
            aria-label="Previous step"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        ) : (
          <div className="w-12" />
        )}

        <button
          type="button"
          onClick={onNextStep}
          disabled={!canGoNext && !isLast}
          className="flex-1 h-11 bg-[#6ffbbe] text-[#005236] font-mono-data text-xs font-black uppercase tracking-wider border-2 border-[#6ffbbe] flex items-center justify-center gap-2 active:bg-[#58e2a8] disabled:opacity-50"
        >
          {isLast ? (
            <>
              <span>✓ All Steps Completed</span>
            </>
          ) : (
            <>
              <span>Next: {STEPS[currentIndex + 1]?.shortLabel || "Continue"}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
