"use client";

import React, { useState } from "react";
import { Diner, ReceiptItem } from "../app/data";

interface PasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  diners: Diner[];
  onAddParsedItems: (items: ReceiptItem[]) => void;
}

export default function PasteModal({
  isOpen,
  onClose,
  diners,
  onAddParsedItems,
}: PasteModalProps) {
  const [pasteText, setPasteText] = useState("");

  if (!isOpen) return null;

  const handleParse = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText.split("\n");
    const parsedItems: ReceiptItem[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Match item name and price at end
      const match = line.match(/^(.*?)(?:[\$:]|\s+-?\s+|\s+)?(\d+(?:\.\d{1,2})?)\s*$/);
      if (match) {
        let name = match[1].trim();
        name = name.replace(/^[0-9]+[\.\)\s-]+\s*/, "").trim() || "Item";

        const price = parseFloat(match[2]);
        if (!isNaN(price) && price > 0) {
          const shares: Record<string, number> = {};
          diners.forEach((d) => (shares[d.id] = 1));

          parsedItems.push({
            id: "item_" + Date.now().toString().slice(-4) + "_" + Math.floor(Math.random() * 1000),
            name,
            price,
            mode: "equal",
            shares,
          });
        }
      }
    }

    if (parsedItems.length > 0) {
      onAddParsedItems(parsedItems);
      setPasteText("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141413]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#fcfaf6] border-2 border-[#141413] shadow-[6px_6px_0px_#141413] max-w-lg w-full p-5">
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#141413] pb-3 mb-3">
          <h3 className="font-headline font-bold text-lg text-[#141413]">
            Quick Paste Receipt
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-[#141413] hover:bg-[#ede8dd]"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-[#464742] mb-3">
          Paste lines copied from an SMS, email, mobile banking, or OCR receipt scanner. Each line should contain an item name and a price.
        </p>

        <textarea
          rows={6}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={`Spicy Tuna Roll $16.00\nWagyu Gyoza 14.50\nMatcha Latte 6.00\nPitcher Sapporo Beer 22.00`}
          className="w-full bg-[#fef9ee] border-2 border-[#141413] p-3 font-mono-data text-xs focus:outline-none mb-4 shadow-[2px_2px_0px_#141413]"
          autoFocus
        />

        <div className="flex justify-end gap-2 font-mono-data text-xs">
          <button
            type="button"
            onClick={onClose}
            className="border border-[#141413] bg-[#ede8dd] px-4 py-2 font-bold hover:bg-[#dfd9cd]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleParse}
            disabled={!pasteText.trim()}
            className="bg-[#141413] text-[#fef9ee] border-2 border-[#141413] px-5 py-2 font-bold hover:bg-[#1c1c1a] shadow-[2px_2px_0px_#767872] disabled:opacity-50"
          >
            + Parse &amp; Add Items
          </button>
        </div>
      </div>
    </div>
  );
}
