"use client";

import React from "react";

export type StepId = "people" | "items" | "taxtip" | "payers" | "settle";

export interface StepDef {
  id: StepId;
  number: number;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const STEPS: StepDef[] = [
  {
    id: "people",
    number: 1,
    label: "The Table",
    shortLabel: "People",
    icon: "group",
    description: "Who is splitting?",
  },
  {
    id: "items",
    number: 2,
    label: "Dishes & Shares",
    shortLabel: "Dishes",
    icon: "receipt_long",
    description: "What did each person order?",
  },
  {
    id: "taxtip",
    number: 3,
    label: "Tax, Tip & Extra",
    shortLabel: "Tax & Tip",
    icon: "percent",
    description: "Proportional gratuity & fees",
  },
  {
    id: "payers",
    number: 4,
    label: "Who Paid?",
    shortLabel: "Payers",
    icon: "credit_card",
    description: "Card or cash upfront",
  },
  {
    id: "settle",
    number: 5,
    label: "Zero-Argument Settle",
    shortLabel: "Settle",
    icon: "payments",
    description: "Who owes whom exactly",
  },
];

interface StepProgressProps {
  currentStep: StepId;
  onSelectStep: (step: StepId) => void;
  peopleCount: number;
  itemCount: number;
  isPaidBalanced: boolean;
  transfersCount: number;
}

export default function StepProgress({
  currentStep,
  onSelectStep,
  peopleCount,
  itemCount,
  isPaidBalanced,
  transfersCount,
}: StepProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-[#f3ede2] border-b-2 border-[#141413]">
      {/* Top Stepper Track for Desktop & Tablet */}
      <div className="max-w-[1240px] mx-auto px-3 sm:px-4 py-2">
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {STEPS.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isCompleted = idx < currentIndex;

            let badgeText = "";
            if (step.id === "people") badgeText = `${peopleCount}`;
            if (step.id === "items") badgeText = `${itemCount}`;
            if (step.id === "payers") badgeText = isPaidBalanced ? "✓" : "!";
            if (step.id === "settle") badgeText = `${transfersCount}`;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelectStep(step.id)}
                className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5 p-1.5 sm:p-2 border-2 transition-all text-left ${
                  isActive
                    ? "bg-[#141413] text-[#fef9ee] border-[#141413] shadow-[2px_2px_0px_#767872] z-10"
                    : isCompleted
                    ? "bg-[#fcfaf6] text-[#141413] border-[#141413] hover:bg-[#ede8dd]"
                    : "bg-[#f8f3e8] text-[#767872] border-[#c7c7c0] hover:border-[#141413]"
                }`}
              >
                {/* Step Circle Badge */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono-data text-xs font-bold shrink-0 ${
                    isActive
                      ? "bg-[#6ffbbe] text-[#141413]"
                      : isCompleted
                      ? "bg-[#141413] text-[#fef9ee]"
                      : "bg-[#dedacf] text-[#767872]"
                  }`}
                >
                  {isCompleted ? "✓" : step.number}
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-between gap-1">
                    <span className="font-headline font-bold text-xs sm:text-sm truncate leading-tight">
                      <span className="hidden md:inline">{step.label}</span>
                      <span className="md:hidden">{step.shortLabel}</span>
                    </span>
                    {badgeText && (
                      <span
                        className={`hidden sm:inline-block text-[10px] font-mono-data px-1 border leading-none font-bold ${
                          isActive
                            ? "bg-[#2563eb] text-white border-[#2563eb]"
                            : "bg-[#ede8dd] text-[#141413] border-[#767872]"
                        }`}
                      >
                        {badgeText}
                      </span>
                    )}
                  </div>
                  <p
                    className={`hidden lg:block text-[10px] font-mono-data truncate mt-0.5 ${
                      isActive ? "text-[#dedacf]" : "text-[#767872]"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-[#ede8dd] h-1.5 border border-[#141413] mt-2 overflow-hidden">
          <div
            className="bg-[#2563eb] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
