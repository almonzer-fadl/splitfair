"use client";

import React from "react";
import { PRESET_SCENARIOS } from "../app/data";

interface NavbarProps {
  currentScenarioKey: string;
  onSelectScenario: (key: string) => void;
  currency: string;
  onSelectCurrency: (c: string) => void;
}

export default function Navbar({
  currentScenarioKey,
  onSelectScenario,
  currency,
  onSelectCurrency,
}: NavbarProps) {
  return (
    <header className="bg-[#141413] text-[#fef9ee] border-b-2 border-[#141413] px-3 sm:px-6 py-3">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#6ffbbe] text-[#005236] border-2 border-[#fef9ee] flex items-center justify-center font-headline font-black text-lg shadow-[2px_2px_0px_#fef9ee]">
              SF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-extrabold text-xl tracking-tight text-[#fef9ee]">
                  SPLITFAIR
                </h1>
                <span className="text-[10px] font-mono-data bg-[#005236] text-[#6ffbbe] px-1.5 py-0.5 border border-[#6ffbbe] uppercase font-bold tracking-wider">
                  GDG EDITION
                </span>
              </div>
              <p className="text-[11px] font-mono-data text-[#c2b9a7] hidden sm:block">
                Group expenses without arguments • Weighted portions &amp; minimum transfers
              </p>
            </div>
          </div>

          {/* Currency Switcher on mobile */}
          <div className="flex md:hidden items-center border border-[#767872] p-0.5 bg-[#1c1c1a] text-xs font-mono-data">
            {["$", "€", "£"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSelectCurrency(c)}
                className={`px-2 py-0.5 font-bold ${
                  currency === c ? "bg-[#6ffbbe] text-[#005236]" : "text-[#c2b9a7]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Controls: Preset Scenarios & Currency */}
        <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[10px] font-mono-data text-[#c2b9a7] uppercase font-bold mr-1 hidden sm:inline">
              PRESETS:
            </span>
            {Object.entries(PRESET_SCENARIOS).map(([key, sc]) => {
              const isSelected = currentScenarioKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectScenario(key)}
                  className={`text-xs font-mono-data px-2.5 py-1 border transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[#6ffbbe] text-[#005236] border-[#6ffbbe] font-bold shadow-[2px_2px_0px_#005236]"
                      : "bg-[#2b2b28] text-[#c2b9a7] border-[#464742] hover:bg-[#383834] hover:text-[#fef9ee]"
                  }`}
                >
                  {sc.title}
                </button>
              );
            })}
          </div>

          {/* Desktop Currency Switcher */}
          <div className="hidden md:flex items-center border border-[#767872] p-0.5 bg-[#1c1c1a] text-xs font-mono-data ml-2">
            {["$", "€", "£"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSelectCurrency(c)}
                className={`px-2 py-0.5 font-bold ${
                  currency === c ? "bg-[#6ffbbe] text-[#005236]" : "text-[#c2b9a7] hover:text-[#fef9ee]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
