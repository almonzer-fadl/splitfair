"use client";

import React, { useState } from "react";
import { Diner, ReceiptItem, SplitMode, DINER_PALETTE } from "../app/data";

interface StepItemsProps {
  diners: Diner[];
  items: ReceiptItem[];
  currency: string;
  onAddItem: (item: Omit<ReceiptItem, "id">) => void;
  onUpdateItem: (itemId: string, updated: Partial<ReceiptItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenPasteModal: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export default function StepItems({
  diners,
  items,
  currency,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onOpenPasteModal,
  onNextStep,
  onPrevStep,
}: StepItemsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [mode, setMode] = useState<SplitMode>("equal");
  const [selectedSoloDiner, setSelectedSoloDiner] = useState<string>(diners[0]?.id || "");

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    if (!name.trim() || isNaN(p) || p <= 0) return;

    const initialShares: Record<string, number> = {};
    diners.forEach((d) => {
      if (mode === "solo") {
        initialShares[d.id] = d.id === selectedSoloDiner ? 1 : 0;
      } else {
        initialShares[d.id] = 1;
      }
    });

    onAddItem({
      name: name.trim(),
      price: p,
      mode,
      shares: initialShares,
    });

    setName("");
    setPrice("");
    setShowAddForm(false);
  };

  const handleToggleEqualShare = (item: ReceiptItem, dinerId: string) => {
    const current = item.shares[dinerId] || 0;
    const newShares = { ...item.shares, [dinerId]: current > 0 ? 0 : 1 };
    onUpdateItem(item.id, { shares: newShares });
  };

  const handleCycleWeightedShare = (item: ReceiptItem, dinerId: string) => {
    const current = item.shares[dinerId] || 0;
    // Cycle 0 -> 1 -> 2 -> 3 -> 0
    const nextVal = current === 0 ? 1 : current === 1 ? 2 : current === 2 ? 3 : 0;
    const newShares = { ...item.shares, [dinerId]: nextVal };
    onUpdateItem(item.id, { shares: newShares });
  };

  const handleSetSoloDiner = (item: ReceiptItem, dinerId: string) => {
    const newShares: Record<string, number> = {};
    diners.forEach((d) => {
      newShares[d.id] = d.id === dinerId ? 1 : 0;
    });
    onUpdateItem(item.id, { shares: newShares, mode: "solo" });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="bg-[#fcfaf6] border-2 border-[#141413] shadow-[4px_4px_0px_#141413] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-[#141413] pb-4 mb-4 gap-3">
          <div>
            <span className="text-[10px] font-mono-data bg-[#141413] text-[#fef9ee] px-2 py-0.5 font-bold uppercase">
              Step 02 of 05
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl mt-1 text-[#141413]">
              Dishes &amp; Shares
            </h2>
            <p className="text-xs sm:text-sm text-[#464742] mt-1">
              Add what everyone ordered. Tap any friend&apos;s token to split equally, weight by portions (1x, 2x, 3x), or mark as solo.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onOpenPasteModal}
              className="bg-[#fef9ee] hover:bg-[#ede8dd] text-[#141413] font-mono-data text-xs px-3 py-2 font-bold border-2 border-[#141413] shadow-[2px_2px_0px_#141413] flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-[16px]">content_paste</span>
              <span>Paste Receipt</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#141413] hover:bg-[#1c1c1a] text-[#fef9ee] font-mono-data text-xs px-3.5 py-2 font-bold border-2 border-[#141413] shadow-[2px_2px_0px_#767872] flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span className="material-symbols-outlined text-[16px]">
                {showAddForm ? "close" : "add"}
              </span>
              <span>{showAddForm ? "Close Form" : "Add Dish"}</span>
            </button>
          </div>
        </div>

        {/* Inline Add Dish Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateItem}
            className="mb-6 p-4 bg-[#fef9ee] border-2 border-[#141413] shadow-[3px_3px_0px_#141413] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#141413] pb-2">
              <span className="font-mono-data font-bold text-xs uppercase text-[#141413]">
                + New Order Line Item
              </span>
              <span className="text-[11px] font-mono-data text-[#767872]">
                Supports equal, weighted, or solo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-[10px] font-mono-data uppercase font-bold text-[#464742] mb-1">
                  Dish / Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wagyu Ribeye, Cocktails, Truffle Fries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#fcfaf6] border-2 border-[#141413] px-3 py-2 text-sm font-body focus:outline-none shadow-[2px_2px_0px_#141413]"
                  autoFocus
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-mono-data uppercase font-bold text-[#464742] mb-1">
                  Price ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-mono-data text-[#767872]">{currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#fcfaf6] border-2 border-[#141413] pl-7 pr-3 py-2 text-sm font-mono-data font-bold focus:outline-none shadow-[2px_2px_0px_#141413]"
                  />
                </div>
              </div>
            </div>

            {/* Sharing Mode Selection */}
            <div className="pt-1">
              <label className="block text-[10px] font-mono-data uppercase font-bold text-[#464742] mb-1">
                Sharing Model
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#ede8dd] p-1 border border-[#141413] max-w-md">
                <button
                  type="button"
                  onClick={() => setMode("equal")}
                  className={`py-1 text-xs font-mono-data font-bold ${
                    mode === "equal"
                      ? "bg-[#141413] text-[#fef9ee] shadow-[1px_1px_0px_#767872]"
                      : "text-[#141413] hover:bg-[#dfd9cd]"
                  }`}
                >
                  Equal
                </button>
                <button
                  type="button"
                  onClick={() => setMode("weighted")}
                  className={`py-1 text-xs font-mono-data font-bold ${
                    mode === "weighted"
                      ? "bg-[#141413] text-[#fef9ee] shadow-[1px_1px_0px_#767872]"
                      : "text-[#141413] hover:bg-[#dfd9cd]"
                  }`}
                >
                  Weighted
                </button>
                <button
                  type="button"
                  onClick={() => setMode("solo")}
                  className={`py-1 text-xs font-mono-data font-bold ${
                    mode === "solo"
                      ? "bg-[#141413] text-[#fef9ee] shadow-[1px_1px_0px_#767872]"
                      : "text-[#141413] hover:bg-[#dfd9cd]"
                  }`}
                >
                  Solo
                </button>
              </div>
            </div>

            {mode === "solo" && (
              <div>
                <label className="block text-[10px] font-mono-data uppercase font-bold text-[#464742] mb-1">
                  Who ordered this solo item?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {diners.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedSoloDiner(d.id)}
                      className={`text-xs font-mono-data font-bold px-3 py-1 border-2 transition-all ${
                        selectedSoloDiner === d.id
                          ? "bg-[#141413] text-[#fef9ee] border-[#141413] shadow-[2px_2px_0px_#767872]"
                          : "bg-[#fcfaf6] text-[#141413] border-[#141413]"
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#141413]">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-[#141413] font-mono-data text-xs hover:bg-[#ede8dd]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#141413] text-[#fef9ee] font-mono-data text-xs font-bold px-5 py-2 border-2 border-[#141413] shadow-[2px_2px_0px_#767872] hover:bg-[#1c1c1a]"
              >
                + Add to Bill
              </button>
            </div>
          </form>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-[#141413] bg-[#fef9ee]">
            <span className="material-symbols-outlined text-4xl text-[#767872] mb-2">receipt_long</span>
            <h3 className="font-headline font-bold text-lg text-[#141413]">No dishes added yet</h3>
            <p className="text-xs text-[#767872] max-w-sm mx-auto mt-1 mb-4">
              Type dishes above or click &ldquo;Paste Receipt&rdquo; to paste a raw text bill from your camera, SMS or receipt.
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="bg-[#141413] text-[#fef9ee] font-mono-data text-xs font-bold px-4 py-2 border-2 border-[#141413]"
            >
              + Add First Dish
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {items.map((item, index) => {
              const totalItemPrice = item.price;
              const totalShares = Object.values(item.shares).reduce((a, b) => a + b, 0);
              const participatingDinersCount = Object.values(item.shares).filter((s) => s > 0).length;

              return (
                <div
                  key={item.id}
                  className="bg-[#fef9ee] border-2 border-[#141413] shadow-[3px_3px_0px_#141413] p-3 sm:p-4 transition-all"
                >
                  {/* Top Bar: Item title, price & delete */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#141413] pb-2.5 mb-2.5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono-data bg-[#ede8dd] px-1.5 py-0.5 border border-[#141413] font-bold">
                          #{index + 1}
                        </span>
                        <h3 className="font-headline font-bold text-base text-[#141413]">
                          {item.name}
                        </h3>
                        <span className="text-[10px] font-mono-data uppercase px-1.5 py-0.5 bg-[#e7e2d7] text-[#464742]">
                          {item.mode}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono-data text-[#767872] mt-0.5">
                        <span>Price: {currency}{totalItemPrice.toFixed(2)}</span>
                        {totalShares > 0 && (
                          <span className="ml-2 font-bold text-[#141413]">
                            • {currency}{(totalItemPrice / totalShares).toFixed(2)} per portion
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="font-mono-data font-bold text-base text-[#141413]">
                          {currency}{totalItemPrice.toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="w-7 h-7 flex items-center justify-center border border-[#141413] bg-[#fcfaf6] hover:bg-[#ffdad4] hover:text-[#b61809] text-xs font-bold transition-colors ml-1"
                        title="Delete item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Mode switcher tabs */}
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-[10px] font-mono-data uppercase font-bold text-[#767872]">
                      Sharing Model:
                    </span>
                    <div className="inline-flex border border-[#141413] bg-[#ede8dd] p-0.5 text-[11px] font-mono-data">
                      <button
                        type="button"
                        onClick={() => onUpdateItem(item.id, { mode: "equal" })}
                        className={`px-2 py-0.5 ${
                          item.mode === "equal"
                            ? "bg-[#141413] text-[#fef9ee] font-bold"
                            : "text-[#141413] hover:bg-[#dfd9cd]"
                        }`}
                      >
                        Equal ({participatingDinersCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateItem(item.id, { mode: "weighted" })}
                        className={`px-2 py-0.5 ${
                          item.mode === "weighted"
                            ? "bg-[#141413] text-[#fef9ee] font-bold"
                            : "text-[#141413] hover:bg-[#dfd9cd]"
                        }`}
                      >
                        Weighted Portions
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateItem(item.id, { mode: "solo" })}
                        className={`px-2 py-0.5 ${
                          item.mode === "solo"
                            ? "bg-[#141413] text-[#fef9ee] font-bold"
                            : "text-[#141413] hover:bg-[#dfd9cd]"
                        }`}
                      >
                        Solo Order
                      </button>
                    </div>
                  </div>

                  {/* Diners Token Chips with Interaction */}
                  <div className="bg-[#fcfaf6] border border-[#141413] p-2 sm:p-2.5">
                    <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono-data text-[#767872]">
                      <span>
                        {item.mode === "equal" && "Tap person to include/exclude:"}
                        {item.mode === "weighted" && "Tap person to cycle portions (1x, 2x, 3x, 0):"}
                        {item.mode === "solo" && "Tap person who ate this solo:"}
                      </span>
                      {item.mode === "equal" && (
                        <button
                          type="button"
                          onClick={() => {
                            const allSelected = diners.every((d) => (item.shares[d.id] || 0) > 0);
                            const newShares: Record<string, number> = {};
                            diners.forEach((d) => {
                              newShares[d.id] = allSelected ? 0 : 1;
                            });
                            onUpdateItem(item.id, { shares: newShares });
                          }}
                          className="underline hover:text-[#141413]"
                        >
                          {diners.every((d) => (item.shares[d.id] || 0) > 0) ? "Deselect All" : "Select All"}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {diners.map((diner) => {
                        const palette = DINER_PALETTE[diner.colorIndex % DINER_PALETTE.length];
                        const shareWeight = item.shares[diner.id] || 0;
                        const isIncluded = shareWeight > 0;

                        if (item.mode === "equal") {
                          return (
                            <button
                              key={diner.id}
                              type="button"
                              onClick={() => handleToggleEqualShare(item, diner.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 border-2 text-xs font-mono-data font-bold transition-all ${
                                isIncluded
                                  ? `${palette.bg} ${palette.text} ${palette.border} shadow-[1.5px_1.5px_0px_#141413]`
                                  : "bg-[#ede8dd] text-[#767872] border-[#c2b9a7] opacity-60 hover:opacity-100"
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] border ${
                                  isIncluded ? `${palette.border} bg-[#fef9ee]` : "border-[#767872]"
                                }`}
                              >
                                {diner.initials}
                              </span>
                              <span>{diner.name}</span>
                              {isIncluded && <span>✓</span>}
                            </button>
                          );
                        }

                        if (item.mode === "weighted") {
                          return (
                            <button
                              key={diner.id}
                              type="button"
                              onClick={() => handleCycleWeightedShare(item, diner.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 border-2 text-xs font-mono-data font-bold transition-all ${
                                isIncluded
                                  ? `${palette.bg} ${palette.text} ${palette.border} shadow-[2px_2px_0px_#141413]`
                                  : "bg-[#ede8dd] text-[#767872] border-[#c2b9a7] opacity-50 hover:opacity-100"
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-current bg-[#fef9ee]">
                                {diner.initials}
                              </span>
                              <span>{diner.name}</span>
                              <span className="px-1 bg-[#141413] text-[#fef9ee] text-[10px] rounded-sm">
                                {shareWeight}x
                              </span>
                            </button>
                          );
                        }

                        // Solo Mode
                        const isSolo = isIncluded;
                        return (
                          <button
                            key={diner.id}
                            type="button"
                            onClick={() => handleSetSoloDiner(item, diner.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 border-2 text-xs font-mono-data font-bold transition-all ${
                              isSolo
                                ? "bg-[#141413] text-[#fef9ee] border-[#141413] shadow-[2px_2px_0px_#767872]"
                                : "bg-[#ede8dd] text-[#464742] border-[#c2b9a7] hover:bg-[#dfd9cd]"
                            }`}
                          >
                            <span>{diner.name}</span>
                            {isSolo && <span className="text-[10px] bg-[#6ffbbe] text-[#005236] px-1 font-bold">SOLO</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Subtotal & Next/Prev Controls */}
        <div className="border-t-2 border-dashed border-[#141413] pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={onPrevStep}
              className="border-2 border-[#141413] bg-[#fef9ee] hover:bg-[#ede8dd] font-mono-data text-xs px-3 py-2 font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back: The Table</span>
            </button>
            <div className="font-mono-data text-xs">
              <span className="text-[#767872]">Subtotal: </span>
              <span className="font-bold text-sm text-[#141413]">{currency}{subtotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onNextStep}
            disabled={items.length === 0}
            className="w-full sm:w-auto bg-[#141413] text-[#fef9ee] font-mono-data text-sm px-6 py-3 font-bold border-2 border-[#141413] shadow-[3px_3px_0px_#767872] hover:bg-[#1c1c1a] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Next: Tax, Tip &amp; Extra</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
