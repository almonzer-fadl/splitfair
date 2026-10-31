"use client";

import React, { useState, useMemo } from "react";
import {
  BillSession,
  Diner,
  ReceiptItem,
  DINER_PALETTE,
  PRESET_SCENARIOS,
  calculateSplitFairLedger,
} from "./data";

export default function SplitFairApp() {
  const [session, setSession] = useState<BillSession>(PRESET_SCENARIOS.izakaya);
  const [activeTab, setActiveTab] = useState<"table" | "receipt" | "settlement">("receipt");
  const [currency, setCurrency] = useState("$");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemMode, setNewItemMode] = useState<"equal" | "weighted" | "solo">("equal");
  const [newPersonName, setNewPersonName] = useState("");
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [settledTransferIds, setSettledTransferIds] = useState<Record<string, boolean>>({});
  const [expandedAudits, setExpandedAudits] = useState<Record<string, boolean>>({
    alex: true,
    omar: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  // Live Ledger Calculation
  const ledger = useMemo(() => {
    return calculateSplitFairLedger(session, currency);
  }, [session, currency]);

  // Scenario switch
  const loadScenario = (key: string) => {
    if (PRESET_SCENARIOS[key]) {
      setSession(JSON.parse(JSON.stringify(PRESET_SCENARIOS[key])));
      setSettledTransferIds({});
      showToast(`Loaded ${PRESET_SCENARIOS[key].title}`);
    }
  };

  // Add person
  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    const name = newPersonName.trim();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Date.now().toString().slice(-4);
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const colorIndex = session.diners.length % DINER_PALETTE.length;

    const newDiner: Diner = {
      id,
      name,
      initials,
      colorIndex,
      paidAmount: 0,
      paymentMethod: "Unassigned",
      handle: `${name.toLowerCase()}`,
    };

    // By default, add person with 1 share to all "equal" items
    const updatedItems = session.items.map((item) => ({
      ...item,
      shares: {
        ...item.shares,
        [id]: item.mode === "equal" ? 1 : 0,
      },
    }));

    setSession({
      ...session,
      diners: [...session.diners, newDiner],
      items: updatedItems,
    });
    setNewPersonName("");
    showToast(`Added ${name} to the table`);
  };

  // Remove person
  const handleRemovePerson = (dinerId: string) => {
    if (session.diners.length <= 1) {
      showToast("Table must have at least 1 person");
      return;
    }
    const updatedDiners = session.diners.filter((d) => d.id !== dinerId);
    const updatedItems = session.items.map((item) => {
      const newShares = { ...item.shares };
      delete newShares[dinerId];
      return { ...item, shares: newShares };
    });
    setSession({
      ...session,
      diners: updatedDiners,
      items: updatedItems,
    });
    showToast("Participant removed");
  };

  // Update diner paid amount
  const handleUpdatePaid = (dinerId: string, amount: number) => {
    setSession({
      ...session,
      diners: session.diners.map((d) =>
        d.id === dinerId ? { ...d, paidAmount: Math.max(0, amount) } : d
      ),
    });
  };

  // 1-Click Single Payer
  const handleMakeSinglePayer = (dinerId: string) => {
    setSession({
      ...session,
      diners: session.diners.map((d) => ({
        ...d,
        paidAmount: d.id === dinerId ? ledger.grandTotal : 0,
      })),
    });
    const payer = session.diners.find((d) => d.id === dinerId);
    showToast(`${payer?.name || "Diner"} set as single payer (${currency}${ledger.grandTotal.toFixed(2)})`);
  };

  // Auto-balance remaining difference to largest payer
  const handleAutoBalancePaid = () => {
    if (session.diners.length === 0) return;
    const sorted = [...session.diners].sort((a, b) => b.paidAmount - a.paidAmount);
    const primary = sorted[0];
    const otherTotal = session.diners
      .filter((d) => d.id !== primary.id)
      .reduce((sum, d) => sum + d.paidAmount, 0);
    const needed = Math.max(0, ledger.grandTotal - otherTotal);

    setSession({
      ...session,
      diners: session.diners.map((d) =>
        d.id === primary.id ? { ...d, paidAmount: Math.round(needed * 100) / 100 } : d
      ),
    });
    showToast(`Balanced remaining amount to ${primary.name}`);
  };

  // Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(price) || price < 0) return;

    const itemId = "item-" + Date.now();
    const shares: Record<string, number> = {};

    session.diners.forEach((d, idx) => {
      if (newItemMode === "solo") {
        shares[d.id] = idx === 0 ? 1 : 0;
      } else {
        shares[d.id] = 1;
      }
    });

    const newItem: ReceiptItem = {
      id: itemId,
      name: newItemName.trim(),
      price,
      mode: newItemMode,
      shares,
    };

    setSession({
      ...session,
      items: [...session.items, newItem],
    });
    setNewItemName("");
    setNewItemPrice("");
    showToast(`Added "${newItem.name}" (${currency}${price.toFixed(2)})`);
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    setSession({
      ...session,
      items: session.items.filter((i) => i.id !== itemId),
    });
    showToast("Item removed");
  };

  // Toggle or adjust item shares
  const handleToggleDinerShare = (item: ReceiptItem, dinerId: string) => {
    const current = item.shares[dinerId] || 0;
    const nextVal = current > 0 ? 0 : 1;
    setSession({
      ...session,
      items: session.items.map((it) =>
        it.id === item.id
          ? { ...it, shares: { ...it.shares, [dinerId]: nextVal } }
          : it
      ),
    });
  };

  const handleAdjustWeight = (item: ReceiptItem, dinerId: string, delta: number) => {
    const current = item.shares[dinerId] || 0;
    const nextVal = Math.max(0, current + delta);
    setSession({
      ...session,
      items: session.items.map((it) =>
        it.id === item.id
          ? { ...it, shares: { ...it.shares, [dinerId]: nextVal } }
          : it
      ),
    });
  };

  const handleChangeItemMode = (itemId: string, newMode: "equal" | "weighted" | "solo") => {
    setSession({
      ...session,
      items: session.items.map((it) => {
        if (it.id !== itemId) return it;
        const newShares: Record<string, number> = {};
        session.diners.forEach((d, idx) => {
          if (newMode === "solo") {
            newShares[d.id] = idx === 0 ? 1 : 0;
          } else {
            newShares[d.id] = it.shares[d.id] || 1;
          }
        });
        return { ...it, mode: newMode, shares: newShares };
      }),
    });
  };

  // Quick Paste Parser
  const handleParsePaste = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText.split("\n");
    const parsedItems: ReceiptItem[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      // match price at end: e.g. "Spicy Tuna Roll $14.50" or "Beer 8"
      const match = line.match(/^(.*?)(?:[\$:]|\s+-?\s+|\s+)?(\d+(?:\.\d{1,2})?)\s*$/);
      if (match) {
        const name = match[1].replace(/^[0-9]+[xX\.\)\s-]+\s*/, "").trim() || "Item";
        const price = parseFloat(match[2]);
        if (!isNaN(price) && price > 0) {
          const shares: Record<string, number> = {};
          session.diners.forEach((d) => (shares[d.id] = 1));
          parsedItems.push({
            id: "pasted-" + Math.random().toString(36).slice(2, 9),
            name,
            price,
            mode: "equal",
            shares,
          });
        }
      }
    }

    if (parsedItems.length > 0) {
      setSession({
        ...session,
        items: [...session.items, ...parsedItems],
      });
      setPasteText("");
      setPasteModalOpen(false);
      showToast(`Added ${parsedItems.length} items from paste!`);
    } else {
      showToast("Could not detect items with prices. Check format.");
    }
  };

  // Copy Summary to clipboard
  const handleCopySummary = () => {
    let summary = `🧾 *SplitFair — ${session.title}*\n`;
    summary += `Subtotal: ${currency}${ledger.itemsSubtotal.toFixed(2)} | Grand Total: ${currency}${ledger.grandTotal.toFixed(2)}\n\n`;
    summary += `*Direct Settlements (${ledger.transfers.length} transfers):*\n`;

    if (ledger.transfers.length === 0) {
      summary += `✓ Everyone is settled! Zero transfers required.\n`;
    } else {
      ledger.transfers.forEach((t) => {
        summary += `• ${t.fromDiner.name} pays ${t.toDiner.name} ${currency}${t.amount.toFixed(2)}\n`;
      });
    }

    summary += `\n*Individual Fair Breakdown:*\n`;
    session.diners.forEach((d) => {
      const a = ledger.audits[d.id];
      const diff = a.netBalance;
      const status = diff >= 0 ? `gets back +${currency}${diff.toFixed(2)}` : `owes -${currency}${Math.abs(diff).toFixed(2)}`;
      summary += `• ${d.name}: consumed ${currency}${a.totalOwedForConsumption.toFixed(2)} (paid ${currency}${d.paidAmount.toFixed(2)}) → ${status}\n`;
    });

    navigator.clipboard?.writeText(summary);
    showToast("Settlement summary copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#fef9ee] text-[#1d1c15] flex flex-col font-body">
      {/* Top Ledger Ticker */}
      <div className="bg-[#141413] text-[#fef9ee] py-1.5 px-4 border-b border-[#141413] text-[11px] font-mono-data uppercase tracking-wider flex items-center justify-between overflow-x-auto no-print">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="text-[#6ffbbe] font-bold">✦ SPLITFAIR LEDGER v2.4</span>
          <span>•</span>
          <span>PROPORTIONAL TAX &amp; TIP</span>
          <span>•</span>
          <span>UNEVEN SHARES (1x, 2x, 3x)</span>
          <span>•</span>
          <span>MINIMUM-TRANSFER DEBT ENGINE</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[#dedacf]">
          <span>{session.timestamp}</span>
          <span className="rubber-stamp-flat text-[#6ffbbe] border-[#6ffbbe] text-[10px] py-0 px-1">
            EQUITABLE AUDIT ✓
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#fef9ee]/95 backdrop-blur border-b-2 border-[#141413] shadow-[0px_2px_0px_#141413]">
        <div className="max-w-[1240px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#141413] text-[#fef9ee] border-2 border-[#141413] flex items-center justify-center font-headline font-extrabold text-xl shadow-[2px_2px_0px_#141413]">
              SF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-extrabold text-2xl tracking-tight leading-none uppercase">
                  SplitFair
                </span>
                <span className="rubber-stamp text-[#005236] border-[#005236] text-[10px] py-0.5 px-1.5 leading-none">
                  NO ARGUMENTS
                </span>
              </div>
              <p className="text-xs text-[#464742] hidden sm:block">
                Exact uneven sharing, proportional tax &amp; tip, minimum settlements.
              </p>
            </div>
          </div>

          {/* Preset scenarios bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-mono-data font-bold uppercase text-[#767872] hidden md:inline">
              PRESETS:
            </span>
            <button
              onClick={() => loadScenario("izakaya")}
              className={`px-2.5 py-1 text-xs font-mono-data font-bold border border-[#141413] transition-all shadow-[1px_1px_0px_#141413] ${
                session.id === "izakaya" ? "bg-[#141413] text-[#fef9ee]" : "bg-[#fcfaf6] hover:bg-[#ede8dd]"
              }`}
            >
              🏮 Izakaya
            </button>
            <button
              onClick={() => loadScenario("gdg")}
              className={`px-2.5 py-1 text-xs font-mono-data font-bold border border-[#141413] transition-all shadow-[1px_1px_0px_#141413] ${
                session.id === "gdg" ? "bg-[#141413] text-[#fef9ee]" : "bg-[#fcfaf6] hover:bg-[#ede8dd]"
              }`}
            >
              🍕 GDG Pizza
            </button>
            <button
              onClick={() => loadScenario("roadtrip")}
              className={`px-2.5 py-1 text-xs font-mono-data font-bold border border-[#141413] transition-all shadow-[1px_1px_0px_#141413] ${
                session.id === "roadtrip" ? "bg-[#141413] text-[#fef9ee]" : "bg-[#fcfaf6] hover:bg-[#ede8dd]"
              }`}
            >
              🏡 Cabin
            </button>
            <button
              onClick={() => loadScenario("blank")}
              className={`px-2.5 py-1 text-xs font-mono-data font-bold border border-[#141413] transition-all shadow-[1px_1px_0px_#141413] ${
                session.id === "blank" ? "bg-[#141413] text-[#fef9ee]" : "bg-[#fcfaf6] hover:bg-[#ede8dd]"
              }`}
            >
              ✨ Fresh
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPasteModalOpen(true)}
              className="border border-[#141413] bg-[#fcfaf6] hover:bg-[#ede8dd] px-2.5 py-1 text-xs font-mono-data font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#141413]"
            >
              <span className="material-symbols-outlined text-[15px]">content_paste</span>
              <span className="hidden sm:inline">Paste Lines</span>
            </button>
            <button
              onClick={() => setCurrency(currency === "$" ? "€" : currency === "€" ? "£" : "$")}
              className="border border-[#141413] bg-[#fcfaf6] hover:bg-[#ede8dd] px-2.5 py-1 text-xs font-mono-data font-bold shadow-[1.5px_1.5px_0px_#141413]"
              title="Toggle Currency"
            >
              {currency} Currency
            </button>
          </div>
        </div>
      </header>

      {/* Bill Title Banner & Grand KPI Strip */}
      <section className="bg-[#ede8dd] border-b-2 border-[#141413]">
        <div className="max-w-[1240px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[260px]">
            <label className="text-[10px] font-mono-data text-[#767872] uppercase tracking-wider block font-bold">
              RECEIPT / OCCASION NAME
            </label>
            <input
              type="text"
              value={session.title}
              onChange={(e) => setSession({ ...session, title: e.target.value })}
              className="font-headline font-bold text-xl sm:text-2xl text-[#141413] bg-transparent border-b border-dashed border-[#141413] focus:outline-none focus:border-solid w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#fcfaf6] border border-[#141413] p-2 shadow-[1.5px_1.5px_0px_#141413]">
              <span className="text-[9px] font-mono-data text-[#767872] uppercase block">Subtotal</span>
              <span className="font-mono-data font-bold text-base">{currency}{ledger.itemsSubtotal.toFixed(2)}</span>
            </div>
            <div className="text-sm font-bold text-[#767872]">+</div>
            <div className="bg-[#fcfaf6] border border-[#141413] p-2 shadow-[1.5px_1.5px_0px_#141413]">
              <span className="text-[9px] font-mono-data text-[#b45309] uppercase block">Tax &amp; Tip</span>
              <span className="font-mono-data font-bold text-base text-[#b45309]">
                {currency}{(ledger.taxAmount + ledger.tipAmount).toFixed(2)}
              </span>
            </div>
            <div className="text-sm font-bold text-[#767872]">=</div>
            <div className="bg-[#141413] text-[#fef9ee] border border-[#141413] p-2 shadow-[2px_2px_0px_#767872]">
              <span className="text-[9px] font-mono-data text-[#dedacf] uppercase block">Grand Total</span>
              <span className="font-mono-data font-bold text-lg text-[#6ffbbe]">
                {currency}{ledger.grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Payment Balance Badge */}
            <div
              className={`p-2 border font-mono-data text-xs flex flex-col justify-center ${
                Math.abs(ledger.unaccountedPaymentDiff) < 0.05
                  ? "bg-[#6ffbbe]/25 border-[#009668] text-[#005236]"
                  : "bg-[#ffdad4] border-[#b61809] text-[#b61809]"
              }`}
            >
              <span className="text-[9px] uppercase font-bold">Upfront Covered</span>
              <span className="font-bold">
                {Math.abs(ledger.unaccountedPaymentDiff) < 0.05
                  ? "100% Balanced ✓"
                  : `${currency}${Math.abs(ledger.unaccountedPaymentDiff).toFixed(2)} ${
                      ledger.unaccountedPaymentDiff > 0 ? "Underpaid" : "Overpaid"
                    }`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Navigation Tabs (Phone friendly) */}
      <div className="lg:hidden sticky top-[61px] z-30 bg-[#f3ede2] border-b border-[#141413] px-4 py-2 flex items-center justify-around font-mono-data text-xs font-bold">
        <button
          onClick={() => setActiveTab("table")}
          className={`px-3 py-1.5 border border-[#141413] shadow-[1px_1px_0px_#141413] ${
            activeTab === "table" ? "bg-[#141413] text-[#fef9ee]" : "bg-[#fcfaf6]"
          }`}
        >
          1. Diners ({session.diners.length})
        </button>
        <button
          onClick={() => setActiveTab("receipt")}
          className={`px-3 py-1.5 border border-[#141413] shadow-[1px_1px_0px_#141413] ${
            activeTab === "receipt" ? "bg-[#141413] text-[#fef9ee]" : "bg-[#fcfaf6]"
          }`}
        >
          2. Receipt ({session.items.length})
        </button>
        <button
          onClick={() => setActiveTab("settlement")}
          className={`px-3 py-1.5 border border-[#141413] shadow-[1px_1px_0px_#141413] ${
            activeTab === "settlement" ? "bg-[#141413] text-[#fef9ee]" : "bg-[#fcfaf6]"
          }`}
        >
          3. Settle ({ledger.transfers.length})
        </button>
      </div>

      {/* Main 3-Column Responsive Workspace */}
      <main className="max-w-[1240px] mx-auto px-4 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================
              COLUMN 1: THE TABLE (DINERS & UPFRONT PAYERS)
             ======================================================== */}
          <section
            className={`lg:col-span-3 flex flex-col gap-4 ${
              activeTab !== "table" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Diners List Card */}
            <div className="bg-[#f8f3e8] border-2 border-[#141413] shadow-[3px_3px_0px_#141413] p-4">
              <div className="flex justify-between items-center border-b border-[#141413] pb-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono-data bg-[#141413] text-[#fef9ee] px-1.5 py-0.5 font-bold">
                    STEP 01
                  </span>
                  <h2 className="font-headline font-bold text-lg mt-1">The Table</h2>
                </div>
                <span className="text-xs font-mono-data font-bold px-2 py-0.5 bg-[#fcfaf6] border border-[#141413]">
                  {session.diners.length} Diners
                </span>
              </div>

              {/* Add Person Form */}
              <form onSubmit={handleAddPerson} className="flex gap-1.5 mb-3">
                <input
                  type="text"
                  placeholder="Name (e.g. Tariq)..."
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="font-body text-xs bg-[#fcfaf6] border border-[#141413] px-2 py-1.5 flex-1 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#141413] text-[#fef9ee] font-mono-data text-xs px-3 py-1.5 font-bold border border-[#141413] hover:bg-[#1c1c1a] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  + Add
                </button>
              </form>

              {/* Diners List */}
              <div className="space-y-2">
                {session.diners.map((diner) => {
                  const palette = DINER_PALETTE[diner.colorIndex % DINER_PALETTE.length];
                  const audit = ledger.audits[diner.id];
                  const net = audit?.netBalance || 0;

                  return (
                    <div
                      key={diner.id}
                      className="p-2 bg-[#fcfaf6] border border-[#141413] flex items-center justify-between shadow-[1px_1px_0px_#141413]"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full border-2 ${palette.border} ${palette.bg} flex items-center justify-center font-mono-data font-bold text-xs ${palette.text}`}
                        >
                          {diner.initials}
                        </div>
                        <div>
                          <h4 className="font-headline font-bold text-sm leading-none">{diner.name}</h4>
                          <span className="text-[10px] font-mono-data text-[#767872]">
                            Paid: {currency}{diner.paidAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono-data text-xs font-bold px-1.5 py-0.5 border ${
                            net >= 0
                              ? "bg-[#6ffbbe]/30 text-[#005236] border-[#009668]"
                              : "bg-[#ffdad4] text-[#b61809] border-[#b61809]"
                          }`}
                        >
                          {net >= 0 ? `+${currency}${net.toFixed(2)}` : `-${currency}${Math.abs(net).toFixed(2)}`}
                        </span>
                        <button
                          onClick={() => handleRemovePerson(diner.id)}
                          className="text-[#767872] hover:text-[#b61809] text-xs px-1"
                          title="Remove diner"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Who Paid Upfront Card */}
            <div className="bg-[#f8f3e8] border-2 border-[#141413] shadow-[3px_3px_0px_#141413] p-4">
              <div className="flex justify-between items-center border-b border-[#141413] pb-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono-data bg-[#141413] text-[#fef9ee] px-1.5 py-0.5 font-bold">
                    STEP 02
                  </span>
                  <h3 className="font-headline font-bold text-lg mt-1">Who Paid the Bill?</h3>
                </div>
                <button
                  onClick={handleAutoBalancePaid}
                  className="text-[11px] font-mono-data font-bold underline hover:text-[#2563eb]"
                >
                  Auto-Balance
                </button>
              </div>

              {/* 1-Click single payer chips */}
              <div className="mb-3">
                <span className="text-[10px] font-mono-data text-[#767872] font-bold block mb-1">
                  1-CLICK FULL PAYER:
                </span>
                <div className="flex flex-wrap gap-1">
                  {session.diners.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleMakeSinglePayer(d.id)}
                      className={`text-[11px] font-mono-data px-2 py-0.5 border border-[#141413] font-bold ${
                        d.paidAmount >= ledger.grandTotal && ledger.grandTotal > 0
                          ? "bg-[#141413] text-[#fef9ee]"
                          : "bg-[#fcfaf6] hover:bg-[#ede8dd]"
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upfront inputs per person */}
              <div className="space-y-2 mb-3">
                {session.diners.map((diner) => (
                  <div
                    key={diner.id}
                    className="flex justify-between items-center text-xs font-mono-data bg-[#fcfaf6] p-2 border border-[#141413]"
                  >
                    <span className="font-bold">{diner.name}</span>
                    <div className="flex items-center gap-1">
                      <span>{currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={diner.paidAmount || ""}
                        placeholder="0.00"
                        onChange={(e) => handleUpdatePaid(diner.id, parseFloat(e.target.value) || 0)}
                        className="w-20 font-bold bg-[#fef9ee] border border-[#141413] px-1.5 py-0.5 text-right focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Upfront coverage indicator */}
              <div className="border border-[#141413] bg-[#fcfaf6] p-2 font-mono-data text-xs">
                <div className="flex justify-between text-[11px] mb-1 font-bold">
                  <span>Paid Upfront: {currency}{ledger.totalPaidUpfront.toFixed(2)}</span>
                  <span>Bill: {currency}{ledger.grandTotal.toFixed(2)}</span>
                </div>
                <div className="w-full bg-[#ede8dd] h-2 border border-[#141413] overflow-hidden">
                  <div
                    className="bg-[#2563eb] h-full transition-all"
                    style={{
                      width: `${Math.min(100, ledger.grandTotal > 0 ? (ledger.totalPaidUpfront / ledger.grandTotal) * 100 : 0)}%`,
                    }}
                  />
                </div>
                {Math.abs(ledger.unaccountedPaymentDiff) > 0.05 && (
                  <p className="text-[10px] text-[#b61809] font-bold mt-1.5">
                    ⚠ Difference of {currency}{Math.abs(ledger.unaccountedPaymentDiff).toFixed(2)}. Click Auto-Balance to match the grand total.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ========================================================
              COLUMN 2: ITEM MATRIX THERMAL RECEIPT
             ======================================================== */}
          <section
            className={`lg:col-span-5 flex flex-col items-center ${
              activeTab !== "receipt" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* The Physical Receipt Container */}
            <div className="w-full bg-[#fcfaf6] border-2 border-[#141413] shadow-[4px_4px_0px_#141413] relative receipt-sawtooth-top receipt-sawtooth-bottom py-6 px-4 sm:px-6">
              
              {/* Receipt Header */}
              <div className="text-center border-b-2 border-dashed border-[#141413] pb-4 mb-4">
                <div className="flex justify-between text-[10px] font-mono-data text-[#767872] uppercase tracking-widest mb-1">
                  <span>STORE #3102</span>
                  <span>{session.tableNumber}</span>
                </div>
                <h2 className="font-headline font-extrabold text-2xl uppercase tracking-tight text-[#141413] leading-none">
                  {session.venue}
                </h2>
                <p className="text-xs font-mono-data text-[#767872] mt-1">{session.subtitle}</p>
                <div className="inline-block mt-2 border-y border-dashed border-[#141413] py-1 px-3">
                  <span className="font-mono-data text-[11px] font-bold tracking-wider">
                    {session.slipCode}
                  </span>
                </div>
              </div>

              {/* Add Item Bar */}
              <form onSubmit={handleAddItem} className="bg-[#f3ede2] p-2.5 border-2 border-dashed border-[#141413] mb-4">
                <div className="text-[10px] font-mono-data font-bold text-[#767872] uppercase mb-1">
                  + QUICK ADD DISH / ITEM
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Dish name (e.g. Wagyu Skewers)..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="font-body text-xs bg-[#fcfaf6] border border-[#141413] px-2 py-1.5 flex-1 focus:outline-none"
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="w-20 font-mono-data text-xs bg-[#fcfaf6] border border-[#141413] px-2 py-1.5 text-right focus:outline-none"
                      required
                    />
                    <select
                      value={newItemMode}
                      onChange={(e) => setNewItemMode(e.target.value as any)}
                      className="font-mono-data text-xs bg-[#fcfaf6] border border-[#141413] px-1.5 py-1.5 focus:outline-none"
                    >
                      <option value="equal">Equal (=)</option>
                      <option value="weighted">Shares (1x, 2x)</option>
                      <option value="solo">Solo</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-[#141413] text-[#fef9ee] font-mono-data text-xs px-3 py-1.5 font-bold border border-[#141413] hover:bg-[#1c1c1a]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>

              {/* Line Items List */}
              <div className="space-y-3 mb-4">
                {session.items.map((item, index) => {
                  const activeCount = session.diners.filter((d) => (item.shares[d.id] || 0) > 0).length;
                  const totalShares = Object.values(item.shares).reduce((a, b) => a + (b || 0), 0);

                  return (
                    <div
                      key={item.id}
                      className="border-b border-dashed border-[#c7c7c0] pb-2.5 hover:bg-[#f8f3e8]/50 p-1.5 rounded transition-colors"
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-body font-bold text-sm text-[#141413]">
                            {index + 1}. {item.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono-data font-bold uppercase px-1 py-0.2 border ${
                              item.mode === "weighted"
                                ? "bg-[#2563eb] text-white border-[#2563eb]"
                                : item.mode === "solo"
                                ? "bg-[#ffdad4] text-[#b61809] border-[#b61809]"
                                : "bg-[#ede8dd] text-[#141413] border-[#767872]"
                            }`}
                          >
                            {item.mode === "weighted" ? "SHARES" : item.mode === "solo" ? "SOLO" : "EQUAL"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-data font-bold text-sm">
                            {currency}{item.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-[#767872] hover:text-[#b61809] text-xs"
                            title="Delete item"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Mode switcher & per-person sharing controls */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs mt-1">
                        <div className="flex items-center gap-1 font-mono-data text-[10px] text-[#767872]">
                          <span>Split:</span>
                          <button
                            onClick={() => handleChangeItemMode(item.id, "equal")}
                            className={`px-1 py-0.2 border ${item.mode === "equal" ? "bg-[#141413] text-white" : "bg-white"}`}
                          >
                            Equal
                          </button>
                          <button
                            onClick={() => handleChangeItemMode(item.id, "weighted")}
                            className={`px-1 py-0.2 border ${item.mode === "weighted" ? "bg-[#141413] text-white" : "bg-white"}`}
                          >
                            Weights
                          </button>
                          <button
                            onClick={() => handleChangeItemMode(item.id, "solo")}
                            className={`px-1 py-0.2 border ${item.mode === "solo" ? "bg-[#141413] text-white" : "bg-white"}`}
                          >
                            Solo
                          </button>
                        </div>

                        {/* Diner Share Tokens */}
                        <div className="flex flex-wrap items-center gap-1">
                          {session.diners.map((diner) => {
                            const weight = item.shares[diner.id] || 0;
                            const palette = DINER_PALETTE[diner.colorIndex % DINER_PALETTE.length];

                            if (item.mode === "weighted") {
                              return (
                                <div
                                  key={diner.id}
                                  className={`flex items-center border border-[#141413] bg-white px-1 py-0.5 text-[10px] font-mono-data ${
                                    weight > 0 ? "opacity-100" : "opacity-40"
                                  }`}
                                >
                                  <span className={`font-bold mr-1 ${palette.text}`}>{diner.name}</span>
                                  <button
                                    onClick={() => handleAdjustWeight(item, diner.id, -1)}
                                    className="px-1 hover:bg-[#ede8dd] font-bold"
                                  >
                                    -
                                  </button>
                                  <span className={`font-bold px-1 ${palette.badgeBg}`}>
                                    {weight}x
                                  </span>
                                  <button
                                    onClick={() => handleAdjustWeight(item, diner.id, 1)}
                                    className="px-1 hover:bg-[#ede8dd] font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              );
                            }

                            // Equal or Solo toggle
                            return (
                              <button
                                key={diner.id}
                                onClick={() => handleToggleDinerShare(item, diner.id)}
                                className={`text-[10px] font-mono-data font-bold px-1.5 py-0.5 border border-[#141413] transition-all ${
                                  weight > 0
                                    ? `${palette.badgeBg} ${palette.text} shadow-[1px_1px_0px_#141413]`
                                    : "bg-white text-[#767872] opacity-40 line-through"
                                }`}
                              >
                                {diner.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tax & Tip Ledger Settings */}
              <div className="border-t-2 border-[#141413] pt-3 space-y-2 font-mono-data text-xs">
                <div className="flex justify-between font-bold">
                  <span>Food &amp; Drinks Subtotal:</span>
                  <span>{currency}{ledger.itemsSubtotal.toFixed(2)}</span>
                </div>

                {/* Tax line */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>Tax:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={session.taxRate}
                      onChange={(e) => setSession({ ...session, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-14 bg-white border border-[#141413] px-1 py-0.5 text-right font-bold"
                    />
                    <span>%</span>
                    <span className="text-[9px] bg-[#ede8dd] px-1 border border-[#767872]">PROPORTIONAL</span>
                  </div>
                  <span className="font-bold">+{currency}{ledger.taxAmount.toFixed(2)}</span>
                </div>

                {/* Tip line */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>Tip:</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={session.tipRate}
                      onChange={(e) => setSession({ ...session, tipRate: parseFloat(e.target.value) || 0 })}
                      className="w-14 bg-white border border-[#141413] px-1 py-0.5 text-right font-bold"
                    />
                    <span>%</span>
                    <div className="flex gap-1 ml-1">
                      {[15, 18, 20].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setSession({ ...session, tipRate: rate })}
                          className={`text-[9px] px-1 border border-[#141413] font-bold ${
                            session.tipRate === rate ? "bg-[#141413] text-white" : "bg-white"
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="font-bold text-[#b45309]">+{currency}{ledger.tipAmount.toFixed(2)}</span>
                </div>

                {/* Discount line */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>Discount / Promo:</span>
                    <span>{currency}</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={session.discountAmount}
                      onChange={(e) => setSession({ ...session, discountAmount: parseFloat(e.target.value) || 0 })}
                      className="w-14 bg-white border border-[#141413] px-1 py-0.5 text-right font-bold"
                    />
                  </div>
                  <span className="font-bold text-[#005236]">-{currency}{ledger.discountAmount.toFixed(2)}</span>
                </div>

                <div className="perforated-border my-2" />

                {/* Grand Total */}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-headline font-extrabold text-lg uppercase">
                    Grand Total Reconciled
                  </span>
                  <span className="font-mono-data font-bold text-2xl text-[#141413]">
                    {currency}{ledger.grandTotal.toFixed(2)}
                  </span>
                </div>

                <p className="text-[10px] text-center text-[#767872] pt-2">
                  *** SPLITFAIR HASH: 9F8B-4322-AA10-EQUITY ***
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================
              COLUMN 3: ZERO-ARGUMENT SETTLEMENT ENGINE
             ======================================================== */}
          <section
            className={`lg:col-span-4 flex flex-col gap-4 ${
              activeTab !== "settlement" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Direct Transfers Card */}
            <div className="bg-[#f8f3e8] border-2 border-[#141413] shadow-[3px_3px_0px_#141413] p-4">
              <div className="flex justify-between items-start border-b border-[#141413] pb-2 mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#005236] text-[18px]">hub</span>
                    <h3 className="font-headline font-bold text-lg">Who Owes Whom</h3>
                  </div>
                  <p className="text-[10px] font-mono-data text-[#767872] mt-0.5">
                    Optimized to {ledger.transfers.length} direct payments
                  </p>
                </div>
                <button
                  onClick={handleCopySummary}
                  className="bg-[#141413] text-[#fef9ee] font-mono-data text-xs px-2.5 py-1 font-bold border border-[#141413] shadow-[1.5px_1.5px_0px_#767872] hover:bg-[#1c1c1a] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  📋 Copy All
                </button>
              </div>

              {ledger.transfers.length === 0 ? (
                <div className="p-4 bg-[#6ffbbe]/20 border border-[#009668] text-center text-xs font-mono-data text-[#005236] font-bold">
                  ✓ Table is fully settled! Nobody owes anyone.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {ledger.transfers.map((t) => {
                    const isSettled = settledTransferIds[t.id];
                    return (
                      <div
                        key={t.id}
                        className={`bg-[#fcfaf6] border-2 border-[#141413] p-2.5 shadow-[2px_2px_0px_#141413] transition-all ${
                          isSettled ? "opacity-50 bg-[#ede8dd]" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2 font-mono-data text-xs">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-[#b61809] bg-[#ffdad4] px-1 border border-[#b61809]">
                              {t.fromDiner.name}
                            </span>
                            <span className="material-symbols-outlined text-[15px] text-[#767872]">
                              arrow_forward
                            </span>
                            <span className="text-[#2563eb] bg-[#2563eb]/15 px-1 border border-[#2563eb]">
                              {t.toDiner.name}
                            </span>
                          </div>
                          <span className="font-mono-data font-bold text-base">
                            {currency}{t.amount.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex gap-1.5 font-mono-data text-[10px]">
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(
                                `Pay ${t.toDiner.name} ${currency}${t.amount.toFixed(2)} for ${session.title}`
                              );
                              showToast(`Copied payment memo for ${t.toDiner.name}!`);
                            }}
                            className="flex-1 bg-[#ede8dd] hover:bg-[#e7e2d7] border border-[#141413] py-1 px-2 font-bold text-center"
                          >
                            Copy Pay Note
                          </button>
                          <button
                            onClick={() => {
                              setSettledTransferIds({
                                ...settledTransferIds,
                                [t.id]: !isSettled,
                              });
                              showToast(isSettled ? "Marked unsettled" : `Transfer of ${currency}${t.amount.toFixed(2)} marked settled!`);
                            }}
                            className={`px-2.5 py-1 font-bold border border-[#141413] ${
                              isSettled
                                ? "bg-[#005236] text-white"
                                : "bg-[#141413] text-[#fef9ee] hover:bg-[#1c1c1a]"
                            }`}
                          >
                            {isSettled ? "✓ Settled" : "Mark Settled"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Individual Proof-of-Fairness Accordions */}
            <div className="bg-[#f8f3e8] border-2 border-[#141413] shadow-[3px_3px_0px_#141413] p-4">
              <div className="flex justify-between items-center border-b border-[#141413] pb-2 mb-3">
                <h3 className="font-headline font-bold text-lg">Fairness Math Audit</h3>
                <span className="text-[10px] font-mono-data bg-[#fcfaf6] border border-[#141413] px-1.5 py-0.5">
                  Exact Breakdown
                </span>
              </div>

              <div className="space-y-2">
                {session.diners.map((diner) => {
                  const audit = ledger.audits[diner.id];
                  const isExpanded = expandedAudits[diner.id];
                  const palette = DINER_PALETTE[diner.colorIndex % DINER_PALETTE.length];

                  return (
                    <div
                      key={diner.id}
                      className="bg-[#fcfaf6] border border-[#141413] p-2 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedAudits({
                            ...expandedAudits,
                            [diner.id]: !isExpanded,
                          })
                        }
                        className="w-full flex justify-between items-center font-mono-data text-xs font-bold text-left focus:outline-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 inline-block border border-[#141413]`}
                            style={{ backgroundColor: palette.hex }}
                          />
                          {diner.name}&apos;s Share
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={audit.netBalance >= 0 ? "text-[#005236]" : "text-[#b61809]"}
                          >
                            {audit.netBalance >= 0
                              ? `+${currency}${audit.netBalance.toFixed(2)}`
                              : `-${currency}${Math.abs(audit.netBalance).toFixed(2)}`}
                          </span>
                          <span className="text-[14px]">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-dashed border-[#c7c7c0] font-mono-data text-[11px] space-y-1 text-[#464742]">
                          <div className="flex justify-between">
                            <span>Dishes &amp; Shared Food:</span>
                            <span className="text-[#141413] font-bold">
                              {currency}{audit.totalItemSubtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Proportional Tax ({session.taxRate}%):</span>
                            <span className="text-[#141413]">
                              +{currency}{audit.taxShare.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Proportional Tip ({session.tipRate}%):</span>
                            <span className="text-[#141413]">
                              +{currency}{audit.tipShare.toFixed(2)}
                            </span>
                          </div>
                          {audit.discountShare > 0 && (
                            <div className="flex justify-between text-[#005236]">
                              <span>Discount Share:</span>
                              <span>-{currency}{audit.discountShare.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-[#141413] border-t border-[#c7c7c0] pt-1">
                            <span>Total Due:</span>
                            <span>{currency}{audit.totalOwedForConsumption.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Already Paid Upfront:</span>
                            <span>{currency}{diner.paidAmount.toFixed(2)}</span>
                          </div>
                          <div
                            className={`flex justify-between font-bold p-1 border mt-1 ${
                              audit.netBalance >= 0
                                ? "bg-[#6ffbbe]/20 text-[#005236] border-[#009668]"
                                : "bg-[#ffdad4] text-[#b61809] border-[#b61809]"
                            }`}
                          >
                            <span>{audit.netBalance >= 0 ? "RECEIVES BACK:" : "FINAL NET OWED:"}</span>
                            <span>
                              {audit.netBalance >= 0 ? "+" : "-"}
                              {currency}
                              {Math.abs(audit.netBalance).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Quick Paste Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141413]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fcfaf6] border-2 border-[#141413] shadow-[6px_6px_0px_#141413] max-w-lg w-full p-5 relative">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-mono-data bg-[#141413] text-[#fef9ee] px-1.5 py-0.5 font-bold">
                  FAST RECEIPT PARSER
                </span>
                <h3 className="font-headline font-bold text-xl mt-1">Paste Receipt Items</h3>
              </div>
              <button
                onClick={() => setPasteModalOpen(false)}
                className="text-lg font-bold text-[#767872] hover:text-[#141413]"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#464742] mb-3 font-body">
              Paste lines from a notes app or text receipt. Formats like &quot;Truffle Fries 14.50&quot; or &quot;Coffee $4.00&quot; are automatically parsed!
            </p>
            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Spicy Tuna Roll $16.00\nWagyu Gyoza 14.50\nMatcha Latte 6.00\nPitcher Beer 22.00`}
              className="w-full bg-[#fef9ee] border border-[#141413] p-2.5 font-mono-data text-xs focus:outline-none mb-3"
            />
            <div className="flex justify-end gap-2 font-mono-data text-xs">
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="border border-[#141413] bg-[#ede8dd] px-3 py-1.5 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParsePaste}
                className="bg-[#141413] text-[#fef9ee] border border-[#141413] px-4 py-1.5 font-bold hover:bg-[#1c1c1a]"
              >
                + Parse &amp; Add Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#141413] text-[#fef9ee] border-2 border-[#141413] shadow-[4px_4px_0px_#767872] px-4 py-2 font-mono-data text-xs z-50 flex items-center gap-2">
          <span className="text-[#6ffbbe]">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
