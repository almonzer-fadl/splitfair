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
import Navbar from "../components/Navbar";
import StepProgress, { StepId, STEPS } from "../components/StepProgress";
import StepPeople from "../components/StepPeople";
import StepItems from "../components/StepItems";
import StepTaxTip from "../components/StepTaxTip";
import StepPayer from "../components/StepPayer";
import StepSettlement from "../components/StepSettlement";
import MobileBottomNav from "../components/MobileBottomNav";
import PasteModal from "../components/PasteModal";

export default function SplitFairPage() {
  const [currentScenarioKey, setCurrentScenarioKey] = useState<string>("izakaya");
  const [session, setSession] = useState<BillSession>(PRESET_SCENARIOS.izakaya);
  const [currentStep, setCurrentStep] = useState<StepId>("people");
  const [currency, setCurrency] = useState<string>("$");
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  // Recalculate ledger live whenever session or currency changes
  const ledger = useMemo(() => {
    return calculateSplitFairLedger(session, currency);
  }, [session, currency]);

  // Handle Scenario Switching
  const handleSelectScenario = (key: string) => {
    if (PRESET_SCENARIOS[key]) {
      setCurrentScenarioKey(key);
      setSession(JSON.parse(JSON.stringify(PRESET_SCENARIOS[key])));
      showToast(`Loaded ${PRESET_SCENARIOS[key].title}`);
    }
  };

  // Step Navigation Handlers
  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNextStep = () => {
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Diner management
  const handleAddDiner = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Date.now().toString().slice(-4);
    const initials = trimmed
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const colorIndex = session.diners.length % DINER_PALETTE.length;

    const newDiner: Diner = {
      id,
      name: trimmed,
      initials,
      colorIndex,
      paidAmount: 0,
      paymentMethod: "Unassigned",
      handle: trimmed.toLowerCase(),
    };

    // Update existing items to include or exclude
    const updatedItems = session.items.map((it) => ({
      ...it,
      shares: {
        ...it.shares,
        [id]: it.mode === "equal" ? 1 : 0,
      },
    }));

    setSession({
      ...session,
      diners: [...session.diners, newDiner],
      items: updatedItems,
    });
    showToast(`Added ${trimmed} to table!`);
  };

  const handleRemoveDiner = (dinerId: string) => {
    if (session.diners.length <= 1) {
      showToast("Keep at least one person at table");
      return;
    }
    const updatedDiners = session.diners.filter((d) => d.id !== dinerId);
    const updatedItems = session.items.map((it) => {
      const newShares = { ...it.shares };
      delete newShares[dinerId];
      return { ...it, shares: newShares };
    });

    setSession({
      ...session,
      diners: updatedDiners,
      items: updatedItems,
    });
    showToast("Participant removed");
  };

  // Item management
  const handleAddItem = (item: Omit<ReceiptItem, "id">) => {
    const newItem: ReceiptItem = {
      ...item,
      id: "item_" + Date.now().toString().slice(-5),
    };
    setSession({
      ...session,
      items: [...session.items, newItem],
    });
    showToast(`Added ${item.name}!`);
  };

  const handleUpdateItem = (itemId: string, updated: Partial<ReceiptItem>) => {
    setSession({
      ...session,
      items: session.items.map((it) => (it.id === itemId ? { ...it, ...updated } : it)),
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setSession({
      ...session,
      items: session.items.filter((it) => it.id !== itemId),
    });
    showToast("Item deleted");
  };

  const handleAddParsedItems = (newItems: ReceiptItem[]) => {
    setSession({
      ...session,
      items: [...session.items, ...newItems],
    });
    showToast(`Parsed & added ${newItems.length} items from receipt!`);
  };

  // Tax/Tip session updates
  const handleUpdateSession = (updated: Partial<BillSession>) => {
    setSession({
      ...session,
      ...updated,
    });
  };

  // Payer management
  const handleUpdatePaid = (dinerId: string, amount: number) => {
    setSession({
      ...session,
      diners: session.diners.map((d) =>
        d.id === dinerId ? { ...d, paidAmount: Math.max(0, amount) } : d
      ),
    });
  };

  const handleMakeSinglePayer = (dinerId: string) => {
    setSession({
      ...session,
      diners: session.diners.map((d) => ({
        ...d,
        paidAmount: d.id === dinerId ? ledger.grandTotal : 0,
      })),
    });
    const payer = session.diners.find((d) => d.id === dinerId);
    showToast(`${payer?.name || "Diner"} marked as full payer!`);
  };

  const handleAutoBalancePaid = () => {
    if (session.diners.length === 0) return;
    const sorted = [...session.diners].sort((a, b) => b.paidAmount - a.paidAmount);
    const primary = sorted[0];
    const otherTotal = session.diners
      .filter((d) => d.id !== primary.id)
      .reduce((sum, d) => sum + d.paidAmount, 0);
    const needed = Math.max(0, Math.round((ledger.grandTotal - otherTotal) * 100) / 100);

    setSession({
      ...session,
      diners: session.diners.map((d) => (d.id === primary.id ? { ...d, paidAmount: needed } : d)),
    });
    showToast(`Balanced remaining to ${primary.name}`);
  };

  const handleResetSession = () => {
    handleSelectScenario("blank");
    setCurrentStep("people");
  };

  return (
    <div className="min-h-screen bg-[#fef9ee] text-[#141413] flex flex-col font-body pb-24 sm:pb-12">
      {/* Top Navbar */}
      <Navbar
        currentScenarioKey={currentScenarioKey}
        onSelectScenario={handleSelectScenario}
        currency={currency}
        onSelectCurrency={setCurrency}
      />

      {/* Step Stepper Progress Bar */}
      <StepProgress
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        peopleCount={session.diners.length}
        itemCount={session.items.length}
        isPaidBalanced={Math.abs(ledger.unaccountedPaymentDiff) <= 0.05}
        transfersCount={ledger.transfers.length}
      />

      {/* Main Step Content Area */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {currentStep === "people" && (
          <StepPeople
            diners={session.diners}
            currency={currency}
            onAddDiner={handleAddDiner}
            onRemoveDiner={handleRemoveDiner}
            onNextStep={handleNextStep}
          />
        )}

        {currentStep === "items" && (
          <StepItems
            diners={session.diners}
            items={session.items}
            currency={currency}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onOpenPasteModal={() => setPasteModalOpen(true)}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
          />
        )}

        {currentStep === "taxtip" && (
          <StepTaxTip
            session={session}
            currency={currency}
            onUpdateSession={handleUpdateSession}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
          />
        )}

        {currentStep === "payers" && (
          <StepPayer
            diners={session.diners}
            grandTotal={ledger.grandTotal}
            currency={currency}
            onUpdatePaid={handleUpdatePaid}
            onMakeSinglePayer={handleMakeSinglePayer}
            onAutoBalancePaid={handleAutoBalancePaid}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
          />
        )}

        {currentStep === "settle" && (
          <StepSettlement
            session={session}
            grandTotal={ledger.grandTotal}
            subtotal={ledger.itemsSubtotal}
            taxAmount={ledger.taxAmount}
            tipAmount={ledger.tipAmount}
            discountAmount={ledger.discountAmount}
            audits={Object.values(ledger.audits)}
            transfers={ledger.transfers}
            currency={currency}
            onPrevStep={handlePrevStep}
            onResetSession={handleResetSession}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Mobile Bottom Sticky Bar */}
      <MobileBottomNav
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        onNextStep={handleNextStep}
        onPrevStep={handlePrevStep}
        canGoNext={session.diners.length > 0}
        grandTotal={ledger.grandTotal}
        currency={currency}
      />

      {/* Paste Receipt Modal */}
      <PasteModal
        isOpen={pasteModalOpen}
        onClose={() => setPasteModalOpen(false)}
        diners={session.diners}
        onAddParsedItems={handleAddParsedItems}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 bg-[#141413] text-[#fef9ee] border-2 border-[#141413] shadow-[4px_4px_0px_#767872] px-4 py-2 font-mono-data text-xs z-50 flex items-center gap-2">
          <span className="text-[#6ffbbe]">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
