"use client";

import React, { useState } from "react";
import { Diner, DINER_PALETTE } from "../app/data";

interface StepPeopleProps {
  diners: Diner[];
  currency: string;
  onAddDiner: (name: string) => void;
  onRemoveDiner: (id: string) => void;
  onNextStep: () => void;
}

export default function StepPeople({
  diners,
  currency,
  onAddDiner,
  onRemoveDiner,
  onNextStep,
}: StepPeopleProps) {
  const [nameInput, setNameInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onAddDiner(nameInput.trim());
    setNameInput("");
  };

  const handleQuickAdd = (names: string[]) => {
    names.forEach((n) => onAddDiner(n));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="bg-[#fcfaf6] border-2 border-[#141413] shadow-[4px_4px_0px_#141413] p-4 sm:p-6">
        <div className="flex items-start justify-between border-b-2 border-dashed border-[#141413] pb-4 mb-4">
          <div>
            <span className="text-[10px] font-mono-data bg-[#141413] text-[#fef9ee] px-2 py-0.5 font-bold uppercase">
              Step 01 of 05
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl mt-1 text-[#141413]">
              The Table &amp; Friends
            </h2>
            <p className="text-xs sm:text-sm text-[#464742] mt-1">
              Who was at the table? Everyone gets a distinct color token so you can tag shared food with one tap.
            </p>
          </div>
          <span className="font-mono-data font-bold text-sm px-2.5 py-1 bg-[#f3ede2] border border-[#141413] shadow-[1px_1px_0px_#141413] whitespace-nowrap">
            {diners.length} Diners
          </span>
        </div>

        {/* Add Person Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Type friend's name (e.g. Tariq, Alex, Sarah)..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="flex-1 bg-[#fef9ee] border-2 border-[#141413] px-3 py-2.5 font-body text-sm focus:outline-none shadow-[2px_2px_0px_#141413]"
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#141413] text-[#fef9ee] font-mono-data text-xs sm:text-sm px-4 py-2.5 font-bold border-2 border-[#141413] shadow-[2px_2px_0px_#767872] hover:bg-[#1c1c1a] active:translate-x-[1px] active:translate-y-[1px]"
          >
            + Add Person
          </button>
        </form>

        {/* Quick add suggestions */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs mb-6">
          <span className="font-mono-data text-[10px] text-[#767872] uppercase font-bold">
            QUICK SUGGESTIONS:
          </span>
          {["Sam", "Zaid", "Omar", "Elena", "Maya", "Leo"].map((suggested) => {
            const alreadyExists = diners.some((d) => d.name.toLowerCase() === suggested.toLowerCase());
            if (alreadyExists) return null;
            return (
              <button
                key={suggested}
                type="button"
                onClick={() => onAddDiner(suggested)}
                className="text-[11px] font-mono-data px-2 py-0.5 bg-[#ede8dd] hover:bg-[#e7e2d7] border border-[#141413]"
              >
                +{suggested}
              </button>
            );
          })}
        </div>

        {/* Diners List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          {diners.map((diner) => {
            const palette = DINER_PALETTE[diner.colorIndex % DINER_PALETTE.length];

            return (
              <div
                key={diner.id}
                className="p-3 bg-[#fef9ee] border-2 border-[#141413] flex items-center justify-between shadow-[2px_2px_0px_#141413]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full border-2 ${palette.border} ${palette.bg} flex items-center justify-center font-mono-data font-bold text-xs ${palette.text}`}
                  >
                    {diner.initials}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-base leading-none text-[#141413]">
                      {diner.name}
                    </h4>
                    <span className="text-[10px] font-mono-data text-[#767872]">
                      Token Color: {palette.name}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveDiner(diner.id)}
                  className="w-7 h-7 flex items-center justify-center border border-[#141413] bg-[#fcfaf6] hover:bg-[#ffdad4] hover:text-[#b61809] text-xs font-bold transition-colors"
                  title="Remove from bill"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Next Step CTA */}
        <div className="border-t-2 border-dashed border-[#141413] pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs font-mono-data text-[#767872]">
            Next: Enter the ordered food &amp; drinks or paste your receipt.
          </p>
          <button
            type="button"
            onClick={onNextStep}
            disabled={diners.length === 0}
            className="w-full sm:w-auto bg-[#141413] text-[#fef9ee] font-mono-data text-sm px-6 py-3 font-bold border-2 border-[#141413] shadow-[3px_3px_0px_#767872] hover:bg-[#1c1c1a] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2"
          >
            <span>Next: Enter Dishes &amp; Shares</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
