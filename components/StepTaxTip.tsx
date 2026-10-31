"use client";

import React from "react";
import { BillSession } from "../app/data";

interface StepTaxTipProps {
  session: BillSession;
  currency: string;
  onUpdateSession: (updated: Partial<BillSession>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export default function StepTaxTip({
  session,
  currency,
  onUpdateSession,
  onNextStep,
  onPrevStep,
}: StepTaxTipProps) {
  const subtotal = session.items.reduce((sum, item) => sum + item.price, 0);

  const taxAmount = (subtotal * (session.taxRate || 0)) / 100;
  const tipAmount = (subtotal * (session.tipRate || 0)) / 100;
  const discountAmount = session.discountAmount || 0;
  const grandTotal = Math.max(0, subtotal + taxAmount + tipAmount - discountAmount);

  const tipPresets = [0, 10, 15, 18, 20];
  const isProportional = session.distributionMode === "proportional";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="bg-[#fcfaf6] border-2 border-[#141413] shadow-[4px_4px_0px_#141413] p-4 sm:p-6">
        <div className="border-b-2 border-dashed border-[#141413] pb-4 mb-5">
          <span className="text-[10px] font-mono-data bg-[#141413] text-[#fef9ee] px-2 py-0.5 font-bold uppercase">
            Step 03 of 05
          </span>
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl mt-1 text-[#141413]">
            Tax, Tip &amp; Discounts
          </h2>
          <p className="text-xs sm:text-sm text-[#464742] mt-1">
            Configure restaurant taxes and gratuity. SplitFair uses proportional distribution by default so lighter eaters don&apos;t subsidize high-roller tip bills.
          </p>
        </div>

        {/* Proportional vs Equal Gratuity Banner */}
        <div className="mb-6 p-3 sm:p-4 bg-[#fef9ee] border-2 border-[#141413] shadow-[2px_2px_0px_#141413]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-headline font-bold text-sm text-[#141413] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#2563eb]">balance</span>
              <span>Proportional Fair Tax &amp; Tip</span>
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateSession({
                  distributionMode: isProportional ? "equal" : "proportional",
                })
              }
              className={`relative inline-flex h-6 w-11 items-center border-2 border-[#141413] transition-colors ${
                isProportional ? "bg-[#005236]" : "bg-[#c2b9a7]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform bg-[#fef9ee] border border-[#141413] transition-transform ${
                  isProportional ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-[#464742] leading-relaxed">
            {isProportional ? (
              <span className="text-[#005236] font-medium">
                <strong>Active: Proportional.</strong> If Sarah ate $10 and Alex ate $50, Alex pays 5× more of the tax &amp; tip. Clean, mathematically fair, zero arguments.
              </span>
            ) : (
              <span className="text-[#767872]">
                <strong>Active: Equal Flat Split.</strong> Total tax &amp; tip will be divided equally by {session.diners.length} people regardless of what each person consumed.
              </span>
            )}
          </p>
        </div>

        <div className="space-y-5 mb-6">
          {/* Tax Rate Input */}
          <div className="bg-[#fef9ee] border-2 border-[#141413] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="font-headline font-bold text-sm text-[#141413]">
                Sales Tax Rate (%)
              </label>
              <span className="font-mono-data font-bold text-sm text-[#141413]">
                {currency}{taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="50"
                  value={session.taxRate || 0}
                  onChange={(e) => onUpdateSession({ taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#fcfaf6] border-2 border-[#141413] px-3 py-2 font-mono-data font-bold text-base focus:outline-none shadow-[2px_2px_0px_#141413]"
                />
                <span className="absolute right-3 top-2.5 font-mono-data text-xs text-[#767872]">%</span>
              </div>
              <div className="flex gap-1">
                {[0, 8.875, 10, 13].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => onUpdateSession({ taxRate: rate })}
                    className={`px-2 py-1.5 font-mono-data text-xs border ${
                      session.taxRate === rate
                        ? "bg-[#141413] text-[#fef9ee] border-[#141413] font-bold"
                        : "bg-[#ede8dd] text-[#141413] border-[#141413] hover:bg-[#dfd9cd]"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tip / Gratuity */}
          <div className="bg-[#fef9ee] border-2 border-[#141413] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="font-headline font-bold text-sm text-[#141413]">
                Gratuity / Tip (%)
              </label>
              <span className="font-mono-data font-bold text-sm text-[#141413]">
                {currency}{tipAmount.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-2.5">
              {tipPresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onUpdateSession({ tipRate: pct })}
                  className={`py-2 text-center font-mono-data text-sm font-bold border-2 transition-all ${
                    session.tipRate === pct
                      ? "bg-[#141413] text-[#fef9ee] border-[#141413] shadow-[2px_2px_0px_#767872]"
                      : "bg-[#fcfaf6] text-[#141413] border-[#141413] hover:bg-[#ede8dd]"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-data text-[#767872] whitespace-nowrap">
                Custom Tip %:
              </span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={session.tipRate || 0}
                onChange={(e) => onUpdateSession({ tipRate: parseFloat(e.target.value) || 0 })}
                className="w-24 bg-[#fcfaf6] border-2 border-[#141413] px-2 py-1 font-mono-data text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Discount / Voucher */}
          <div className="bg-[#fef9ee] border-2 border-[#141413] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="font-headline font-bold text-sm text-[#141413]">
                Discount / Voucher / Promo ({currency})
              </label>
              {discountAmount > 0 && (
                <span className="font-mono-data font-bold text-sm text-[#005236]">
                  -{currency}{discountAmount.toFixed(2)}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 font-mono-data text-xs text-[#767872]">{currency}</span>
              <input
                type="number"
                step="0.50"
                min="0"
                placeholder="0.00"
                value={session.discountAmount || ""}
                onChange={(e) => onUpdateSession({ discountAmount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#fcfaf6] border-2 border-[#141413] pl-8 pr-3 py-2 font-mono-data font-bold text-sm focus:outline-none shadow-[2px_2px_0px_#141413]"
              />
            </div>
          </div>
        </div>

        {/* Calculation Total Summary Box */}
        <div className="bg-[#141413] text-[#fef9ee] p-4 border-2 border-[#141413] shadow-[3px_3px_0px_#767872] mb-6">
          <div className="flex items-center justify-between text-xs font-mono-data text-[#c2b9a7] mb-1">
            <span>Dishes Subtotal:</span>
            <span>{currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono-data text-[#c2b9a7] mb-1">
            <span>Sales Tax ({session.taxRate || 0}%):</span>
            <span>+{currency}{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono-data text-[#c2b9a7] mb-1">
            <span>Gratuity / Tip ({session.tipRate || 0}%):</span>
            <span>+{currency}{tipAmount.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-xs font-mono-data text-[#6ffbbe] mb-1">
              <span>Promo / Voucher:</span>
              <span>-{currency}{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-[#464742] pt-2 mt-2 flex items-center justify-between font-mono-data">
            <span className="font-bold text-sm uppercase">Total Bill with Extras:</span>
            <span className="font-bold text-xl text-[#6ffbbe]">
              {currency}{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="border-t-2 border-dashed border-[#141413] pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            type="button"
            onClick={onPrevStep}
            className="w-full sm:w-auto border-2 border-[#141413] bg-[#fef9ee] hover:bg-[#ede8dd] font-mono-data text-xs px-4 py-2.5 font-bold flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back: Dishes &amp; Shares</span>
          </button>

          <button
            type="button"
            onClick={onNextStep}
            className="w-full sm:w-auto bg-[#141413] text-[#fef9ee] font-mono-data text-sm px-6 py-3 font-bold border-2 border-[#141413] shadow-[3px_3px_0px_#767872] hover:bg-[#1c1c1a] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2"
          >
            <span>Next: Who Paid?</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
