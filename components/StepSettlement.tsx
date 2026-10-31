"use client";

import React, { useState } from "react";
import {
  BillSession,
  DinerAudit,
  SettlementTransfer,
  DINER_PALETTE,
} from "../app/data";

interface StepSettlementProps {
  session: BillSession;
  grandTotal: number;
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  discountAmount: number;
  audits: DinerAudit[];
  transfers: SettlementTransfer[];
  currency: string;
  onPrevStep: () => void;
  onResetSession: () => void;
  onShowToast: (msg: string) => void;
}

export default function StepSettlement({
  session,
  grandTotal,
  subtotal,
  taxAmount,
  tipAmount,
  discountAmount,
  audits,
  transfers,
  currency,
  onPrevStep,
  onResetSession,
  onShowToast,
}: StepSettlementProps) {
  const [settledMap, setSettledMap] = useState<Record<string, boolean>>({});
  const [expandedDiners, setExpandedDiners] = useState<Record<string, boolean>>({});
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  const toggleSettled = (id: string) => {
    setSettledMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleExpand = (id: string) => {
    setExpandedDiners((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Build share text
  const generateShareSummary = () => {
    let text = `🧾 SplitFair Summary: ${session.title || "Group Expense"}\n`;
    text += `Total: ${currency}${grandTotal.toFixed(2)} (${session.diners.length} diners)\n`;
    text += `--------------------------------\n`;
    text += `💰 SETTLEMENT TRANSFERS (${transfers.length} payments):\n`;

    if (transfers.length === 0) {
      text += `All settled! Everyone paid their exact fair share.\n`;
    } else {
      transfers.forEach((t) => {
        text += `• ${t.fromDiner.name} pays ${t.toDiner.name}: ${currency}${t.amount.toFixed(2)}\n`;
      });
    }

    text += `\n📊 INDIVIDUAL BREAKDOWN (Tax & Tip Proportional):\n`;
    audits.forEach((a) => {
      text += `• ${a.diner.name}: Fair Share ${currency}${a.totalOwedForConsumption.toFixed(2)} (Paid upfront ${currency}${a.paidUpfront.toFixed(2)})\n`;
    });

    text += `\nCalculated mathematically with SplitFair • Zero Arguments.`;
    return text;
  };

  const handleCopySummary = async () => {
    const text = generateShareSummary();
    try {
      await navigator.clipboard.writeText(text);
      onShowToast("Copied settlement summary to clipboard!");
    } catch {
      onShowToast("Unable to copy to clipboard");
    }
  };

  const handleNativeShare = async () => {
    const text = generateShareSummary();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `SplitFair — ${session.title}`,
          text,
        });
        onShowToast("Share sheet opened!");
      } catch {
        handleCopySummary();
      }
    } else {
      handleCopySummary();
    }
  };

  const handleCopyPayNote = (t: SettlementTransfer) => {
    const note = `SplitFair (${session.title}): ${t.fromDiner.name} pays ${t.toDiner.name} ${currency}${t.amount.toFixed(2)}`;
    navigator.clipboard.writeText(note);
    onShowToast(`Copied payment memo for ${t.fromDiner.name}!`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#fcfaf6] border-2 border-[#141413] shadow-[4px_4px_0px_#141413] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-[#141413] pb-4 mb-4 gap-3">
          <div>
            <span className="text-[10px] font-mono-data bg-[#005236] text-[#6ffbbe] px-2 py-0.5 font-bold uppercase">
              Step 05 of 05 • Solved
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl mt-1 text-[#141413]">
              Zero-Argument Settlement
            </h2>
            <p className="text-xs sm:text-sm text-[#464742] mt-1">
              Minimum transfers computed. Tap any transfer to mark it settled or copy a clean payment note for Venmo/Zelle/CashApp.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="bg-[#141413] text-[#fef9ee] font-mono-data text-xs px-3.5 py-2 font-bold border-2 border-[#141413] shadow-[2px_2px_0px_#767872] flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>Share Group Bill</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPrintSlip(!showPrintSlip)}
              className="bg-[#fef9ee] hover:bg-[#ede8dd] text-[#141413] font-mono-data text-xs px-3 py-2 font-bold border-2 border-[#141413] shadow-[2px_2px_0px_#141413] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">receipt</span>
              <span>{showPrintSlip ? "Hide Slip" : "Receipt"}</span>
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Modal/Collapse */}
        {showPrintSlip && (
          <div className="mb-6 p-4 sm:p-6 bg-[#fef9ee] border-2 border-[#141413] shadow-[3px_3px_0px_#141413] font-mono-data text-xs text-[#141413] max-w-md mx-auto">
            <div className="text-center border-b border-dashed border-[#141413] pb-3 mb-3">
              <h3 className="font-headline font-extrabold text-lg uppercase tracking-wider">
                SPLITFAIR RECEIPT
              </h3>
              <p className="text-[11px] text-[#767872]">{session.title} • {session.timestamp || "Today"}</p>
              <div className="inline-block mt-1 px-2 py-0.5 border border-[#141413] text-[10px] font-bold">
                AUDITED &amp; VERIFIED
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {session.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{currency}{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-[#141413] pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({session.taxRate}%):</span>
                <span>+{currency}{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tip ({session.tipRate}%):</span>
                <span>+{currency}{tipAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#005236]">
                  <span>Discount:</span>
                  <span>-{currency}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-[#141413] pt-1 flex justify-between font-bold text-sm">
                <span>GRAND TOTAL:</span>
                <span>{currency}{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-[#141413] mt-3 pt-3">
              <p className="font-bold text-[11px] mb-1">SETTLEMENT PAYMENTS:</p>
              {transfers.length === 0 ? (
                <p className="text-[10px] text-[#005236]">All even! Zero transfers needed.</p>
              ) : (
                transfers.map((t) => (
                  <div key={t.id} className="flex justify-between text-[11px]">
                    <span>{t.fromDiner.name} ➔ {t.toDiner.name}</span>
                    <span className="font-bold">{currency}{t.amount.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full mt-4 py-2 border border-[#141413] bg-[#ede8dd] hover:bg-[#e2dcce] font-bold text-xs"
            >
              🖨️ Print Thermal Slip
            </button>
          </div>
        )}

        {/* Transfers Cards: Minimum Debt Graph */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline font-bold text-lg text-[#141413] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#2563eb]">swap_horiz</span>
              <span>Fastest Transfers ({transfers.length})</span>
            </h3>
            <button
              type="button"
              onClick={handleCopySummary}
              className="text-xs font-mono-data text-[#2563eb] hover:underline font-bold"
            >
              Copy Text Summary
            </button>
          </div>

          {transfers.length === 0 ? (
            <div className="p-6 bg-[#6ffbbe]/20 border-2 border-[#005236] text-center">
              <span className="material-symbols-outlined text-4xl text-[#005236] mb-2">task_alt</span>
              <h4 className="font-headline font-bold text-base text-[#005236]">
                Every single diner is completely even!
              </h4>
              <p className="text-xs text-[#005236] mt-1">
                Everyone paid upfront exactly what their meal cost. No debts owed!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {transfers.map((t) => {
                const isSettled = !!settledMap[t.id];
                const fromPalette = DINER_PALETTE[t.fromDiner.colorIndex % DINER_PALETTE.length];
                const toPalette = DINER_PALETTE[t.toDiner.colorIndex % DINER_PALETTE.length];

                return (
                  <div
                    key={t.id}
                    className={`border-2 p-3.5 transition-all ${
                      isSettled
                        ? "bg-[#ede8dd] border-[#c2b9a7] opacity-60 shadow-none"
                        : "bg-[#fef9ee] border-[#141413] shadow-[3px_3px_0px_#141413]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono-data font-bold border ${fromPalette.border} ${fromPalette.bg} ${fromPalette.text}`}
                        >
                          {t.fromDiner.initials}
                        </span>
                        <span className="font-headline font-bold text-sm text-[#141413]">
                          {t.fromDiner.name}
                        </span>
                        <span className="material-symbols-outlined text-sm text-[#767872]">
                          arrow_forward
                        </span>
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono-data font-bold border ${toPalette.border} ${toPalette.bg} ${toPalette.text}`}
                        >
                          {t.toDiner.initials}
                        </span>
                        <span className="font-headline font-bold text-sm text-[#141413]">
                          {t.toDiner.name}
                        </span>
                      </div>

                      <span className="font-mono-data font-bold text-lg text-[#141413]">
                        {currency}{t.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#141413]/20 pt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleSettled(t.id)}
                        className={`flex items-center gap-1 font-mono-data text-xs px-2 py-0.5 border ${
                          isSettled
                            ? "bg-[#005236] text-[#6ffbbe] border-[#005236] font-bold"
                            : "bg-[#ede8dd] text-[#141413] border-[#141413] hover:bg-[#dfd9cd]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isSettled ? "check" : "radio_button_unchecked"}
                        </span>
                        <span>{isSettled ? "Settled ✓" : "Mark as Paid"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyPayNote(t)}
                        className="text-[11px] font-mono-data text-[#464742] hover:text-[#141413] flex items-center gap-1 underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        <span>Copy Pay Memo</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Proof-of-Fairness Itemized Audit Accordions */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg text-[#141413] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#005236]">verified</span>
              <span>Individual Proof-of-Fairness Audits</span>
            </h3>
            <span className="text-[11px] font-mono-data text-[#767872]">
              Mathematical transparency
            </span>
          </div>

          <div className="space-y-2.5">
            {audits.map((audit) => {
              const { diner, totalItemSubtotal, taxShare, tipShare, discountShare, totalOwedForConsumption, paidUpfront, netBalance } = audit;
              const isExpanded = !!expandedDiners[diner.id];
              const palette = DINER_PALETTE[diner.colorIndex % DINER_PALETTE.length];
              const isCreditor = netBalance > 0.05;
              const isDebtor = netBalance < -0.05;

              return (
                <div
                  key={diner.id}
                  className="bg-[#fef9ee] border-2 border-[#141413] shadow-[2px_2px_0px_#141413] overflow-hidden"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(diner.id)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#f8f2e4] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full border-2 ${palette.border} ${palette.bg} flex items-center justify-center font-mono-data font-bold text-xs ${palette.text}`}
                      >
                        {diner.initials}
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-sm sm:text-base text-[#141413]">
                          {diner.name}
                        </h4>
                        <span className="text-[11px] font-mono-data text-[#767872]">
                          Fair Share: {currency}{totalOwedForConsumption.toFixed(2)} • Paid: {currency}{paidUpfront.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCreditor && (
                        <span className="px-2 py-0.5 bg-[#6ffbbe] text-[#005236] border border-[#005236] font-mono-data font-bold text-xs">
                          Gets back +{currency}{netBalance.toFixed(2)}
                        </span>
                      )}
                      {isDebtor && (
                        <span className="px-2 py-0.5 bg-[#ffdad4] text-[#b61809] border border-[#b61809] font-mono-data font-bold text-xs">
                          Owes -{currency}{Math.abs(netBalance).toFixed(2)}
                        </span>
                      )}
                      {!isCreditor && !isDebtor && (
                        <span className="px-2 py-0.5 bg-[#ede8dd] text-[#464742] border border-[#464742] font-mono-data font-bold text-xs">
                          Even {currency}0.00
                        </span>
                      )}
                      <span className="material-symbols-outlined text-[#767872] text-sm">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-[#141413] bg-[#fcfaf6] p-3 sm:p-4 text-xs font-mono-data space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-dashed border-[#141413]">
                        <div>
                          <span className="text-[10px] text-[#767872] block">DISHES CONSUMED</span>
                          <span className="font-bold text-[#141413]">{currency}{totalItemSubtotal.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#767872] block">PROPORTIONAL TAX</span>
                          <span className="font-bold text-[#141413]">+{currency}{taxShare.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#767872] block">PROPORTIONAL TIP</span>
                          <span className="font-bold text-[#141413]">+{currency}{tipShare.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#767872] block">DISCOUNT/VOUCHER</span>
                          <span className="font-bold text-[#005236]">-{currency}{discountShare.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Itemized portions */}
                      <div className="pt-1">
                        <span className="text-[10px] text-[#767872] font-bold uppercase block mb-1">
                          Consumed Line Items:
                        </span>
                        <div className="space-y-1">
                          {audit.items.map((itemAudit, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] text-[#464742]">
                              <span>
                                {itemAudit.itemName}{" "}
                                <span className="text-[#767872]">
                                  ({itemAudit.formulaLabel})
                                </span>
                              </span>
                              <span className="font-bold text-[#141413]">
                                {currency}{itemAudit.myCost.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t-2 border-dashed border-[#141413] pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            type="button"
            onClick={onPrevStep}
            className="w-full sm:w-auto border-2 border-[#141413] bg-[#fef9ee] hover:bg-[#ede8dd] font-mono-data text-xs px-4 py-2.5 font-bold flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back: Who Paid?</span>
          </button>

          <button
            type="button"
            onClick={onResetSession}
            className="w-full sm:w-auto bg-[#ede8dd] hover:bg-[#e2dcce] text-[#141413] font-mono-data text-xs px-4 py-2.5 font-bold border-2 border-[#141413] shadow-[2px_2px_0px_#141413] flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Start New Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
