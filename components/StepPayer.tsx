"use client";

import React from "react";
import { Diner, DINER_PALETTE } from "../app/data";

interface StepPayerProps {
  diners: Diner[];
  grandTotal: number;
  currency: string;
  onUpdatePaid: (dinerId: string, amount: number) => void;
  onMakeSinglePayer: (dinerId: string) => void;
  onAutoBalancePaid: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export default function StepPayer({
  diners,
  grandTotal,
  currency,
  onUpdatePaid,
  onMakeSinglePayer,
  onAutoBalancePaid,
  onNextStep,
  onPrevStep,
}: StepPayerProps) {
  const totalPaid = diners.reduce((sum, d) => sum + (d.paidAmount || 0), 0);
  const diff = Math.round((totalPaid - grandTotal) * 100) / 100;
  const isBalanced = Math.abs(diff) <= 0.05;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="bg-[#fcfaf6] border-2 border-[#141413] shadow-[4px_4px_0px_#141413] p-4 sm:p-6">
        <div className="border-b-2 border-dashed border-[#141413] pb-4 mb-5">
          <span className="text-[10px] font-mono-data bg-[#141413] text-[#fef9ee] px-2 py-0.5 font-bold uppercase">
            Step 04 of 05
          </span>
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl mt-1 text-[#141413]">
            Who Paid the Bill?
          </h2>
          <p className="text-xs sm:text-sm text-[#464742] mt-1">
            Did one friend swipe their credit card for points, or did multiple people throw in cash and card? Enter who paid what upfront.
          </p>
        </div>

        {/* Balance Status Banner */}
        <div
          className={`p-4 border-2 mb-6 ${
            isBalanced
              ? "bg-[#6ffbbe]/20 border-[#005236] text-[#005236]"
              : diff < 0
              ? "bg-[#ffdad4]/40 border-[#b61809] text-[#b61809]"
              : "bg-[#fef3c7] border-[#d97706] text-[#92400e]"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-data font-bold text-xs uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">
                {isBalanced ? "check_circle" : diff < 0 ? "warning" : "error"}
              </span>
              <span>
                {isBalanced
                  ? "Fully Balanced"
                  : diff < 0
                  ? `Short by ${currency}${Math.abs(diff).toFixed(2)}`
                  : `Overpaid by ${currency}${diff.toFixed(2)}`}
              </span>
            </span>
            <span className="font-mono-data font-bold text-sm">
              {currency}{totalPaid.toFixed(2)} / {currency}{grandTotal.toFixed(2)}
            </span>
          </div>

          <div className="w-full bg-[#141413]/10 h-2 rounded-full overflow-hidden my-2">
            <div
              className={`h-full transition-all duration-300 ${
                isBalanced ? "bg-[#005236]" : diff < 0 ? "bg-[#b61809]" : "bg-[#d97706]"
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, (totalPaid / (grandTotal || 1)) * 100))}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-2">
            <span className="text-current opacity-90">
              {isBalanced
                ? "Every dollar paid matches the final restaurant total."
                : diff < 0
                ? "Total entered payments do not yet cover the grand total."
                : "Total entered payments exceed the grand total."}
            </span>
            {!isBalanced && (
              <button
                type="button"
                onClick={onAutoBalancePaid}
                className="font-mono-data font-bold text-xs underline hover:opacity-80 ml-2 whitespace-nowrap"
              >
                Auto-balance remainder
              </button>
            )}
          </div>
        </div>

        {/* 1-Click Single Cardholder Shortcuts */}
        <div className="mb-6 p-3 bg-[#fef9ee] border-2 border-[#141413]">
          <span className="block text-[10px] font-mono-data uppercase font-bold text-[#767872] mb-2">
            ⚡ 1-Click Single Payer (Swiped card for whole table):
          </span>
          <div className="flex flex-wrap gap-2">
            {diners.map((diner) => {
              const palette = DINER_PALETTE[diner.colorIndex % DINER_PALETTE.length];
              const isFullPayer = diner.paidAmount >= grandTotal - 0.05 && diner.paidAmount > 0;

              return (
                <button
                  key={diner.id}
                  type="button"
                  onClick={() => onMakeSinglePayer(diner.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-data font-bold border-2 transition-all ${
                    isFullPayer
                      ? "bg-[#141413] text-[#fef9ee] border-[#141413] shadow-[2px_2px_0px_#767872]"
                      : "bg-[#fcfaf6] text-[#141413] border-[#141413] hover:bg-[#ede8dd]"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] border ${palette.border} ${palette.bg} ${palette.text}`}
                  >
                    {diner.initials}
                  </span>
                  <span>{diner.name} paid 100%</span>
                  {isFullPayer && <span className="text-[#6ffbbe]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diner Paid Table */}
        <div className="space-y-3 mb-6">
          <span className="block text-[10px] font-mono-data uppercase font-bold text-[#767872]">
            Detailed Multi-Payer Breakdown:
          </span>

          {diners.map((diner) => {
            const palette = DINER_PALETTE[diner.colorIndex % DINER_PALETTE.length];

            return (
              <div
                key={diner.id}
                className="bg-[#fef9ee] border-2 border-[#141413] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#141413]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full border-2 ${palette.border} ${palette.bg} flex items-center justify-center font-mono-data font-bold text-xs ${palette.text}`}
                  >
                    {diner.initials}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-base text-[#141413] leading-tight">
                      {diner.name}
                    </h4>
                    <span className="text-[11px] font-mono-data text-[#767872]">
                      {diner.paidAmount > 0 ? (
                        <span className="text-[#005236] font-semibold">
                          Paid upfront: {currency}{diner.paidAmount.toFixed(2)}
                        </span>
                      ) : (
                        "Paid nothing upfront"
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-mono-data text-[#767872]">
                      {currency}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={diner.paidAmount === 0 ? "" : diner.paidAmount}
                      placeholder="0.00"
                      onChange={(e) => onUpdatePaid(diner.id, parseFloat(e.target.value) || 0)}
                      className="w-32 bg-[#fcfaf6] border-2 border-[#141413] pl-6 pr-2 py-1.5 font-mono-data font-bold text-sm text-right focus:outline-none shadow-[1px_1px_0px_#141413]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onMakeSinglePayer(diner.id)}
                    className="px-2 py-1.5 text-[11px] font-mono-data border border-[#141413] bg-[#ede8dd] hover:bg-[#e2dcce] whitespace-nowrap"
                    title="Set this person as paying the entire bill"
                  >
                    All
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="border-t-2 border-dashed border-[#141413] pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            type="button"
            onClick={onPrevStep}
            className="w-full sm:w-auto border-2 border-[#141413] bg-[#fef9ee] hover:bg-[#ede8dd] font-mono-data text-xs px-4 py-2.5 font-bold flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back: Tax &amp; Tip</span>
          </button>

          <button
            type="button"
            onClick={onNextStep}
            className="w-full sm:w-auto bg-[#141413] text-[#fef9ee] font-mono-data text-sm px-6 py-3 font-bold border-2 border-[#141413] shadow-[3px_3px_0px_#767872] hover:bg-[#1c1c1a] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2"
          >
            <span>Next: Settle &amp; Proof of Fairness</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
