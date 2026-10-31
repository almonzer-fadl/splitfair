export type SplitMode = "equal" | "weighted" | "solo" | "exact";

export interface DinerColor {
  id: string;
  name: string;
  border: string;
  bg: string;
  text: string;
  badgeBg: string;
  hex: string;
}

export const DINER_PALETTE: DinerColor[] = [
  {
    id: "cobalt",
    name: "Cobalt",
    border: "border-[#2563EB]",
    bg: "bg-[#2563EB]/10",
    text: "text-[#2563EB]",
    badgeBg: "bg-[#2563EB]/15",
    hex: "#2563EB",
  },
  {
    id: "amber",
    name: "Amber",
    border: "border-[#F59E0B]",
    bg: "bg-[#F59E0B]/15",
    text: "text-[#b45309]",
    badgeBg: "bg-[#F59E0B]/20",
    hex: "#F59E0B",
  },
  {
    id: "purple",
    name: "Purple",
    border: "border-purple-600",
    bg: "bg-purple-50",
    text: "text-purple-700",
    badgeBg: "bg-purple-100",
    hex: "#9333EA",
  },
  {
    id: "rose",
    name: "Rose",
    border: "border-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    badgeBg: "bg-rose-100",
    hex: "#F43F5E",
  },
  {
    id: "teal",
    name: "Teal",
    border: "border-teal-600",
    bg: "bg-teal-50",
    text: "text-teal-700",
    badgeBg: "bg-teal-100",
    hex: "#0D9488",
  },
  {
    id: "emerald",
    name: "Emerald",
    border: "border-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    badgeBg: "bg-emerald-100",
    hex: "#059669",
  },
  {
    id: "indigo",
    name: "Indigo",
    border: "border-indigo-600",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    badgeBg: "bg-indigo-100",
    hex: "#4F46E5",
  },
  {
    id: "orange",
    name: "Orange",
    border: "border-orange-600",
    bg: "bg-orange-50",
    text: "text-orange-800",
    badgeBg: "bg-orange-100",
    hex: "#EA580C",
  },
];

export interface Diner {
  id: string;
  name: string;
  initials: string;
  colorIndex: number;
  paidAmount: number;
  paymentMethod: string;
  handle: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  mode: SplitMode;
  // Map of dinerId -> weight/shares (for 'equal', 1 = included, 0 = excluded; for 'weighted', 1, 2, 3...; for 'solo', 1 for solo owner; for 'exact', exact dollar amount)
  shares: Record<string, number>;
}

export interface BillSession {
  id: string;
  title: string;
  venue: string;
  subtitle: string;
  tableNumber: string;
  slipCode: string;
  timestamp: string;
  taxRate: number;
  taxMode: "percent" | "fixed";
  tipRate: number;
  tipMode: "percent" | "fixed";
  discountAmount: number;
  distributionMode: "proportional" | "equal";
  diners: Diner[];
  items: ReceiptItem[];
}

export const PRESET_SCENARIOS: Record<string, BillSession> = {
  izakaya: {
    id: "izakaya",
    title: "Friday Izakaya Night 🏮",
    venue: "TOKYO DINING",
    subtitle: "IZAKAYA & SAKE PARLOR • EAST VILLAGE",
    tableNumber: "Table #14",
    slipCode: "SPLITFAIR FISCAL SLIP #88291-IZK",
    timestamp: "Oct 31, 2026 • 21:42 PM",
    taxRate: 8.875,
    taxMode: "percent",
    tipRate: 20.0,
    tipMode: "percent",
    discountAmount: 0,
    distributionMode: "proportional",
    diners: [
      {
        id: "alex",
        name: "Alex",
        initials: "AL",
        colorIndex: 0,
        paidAmount: 215.0,
        paymentMethod: "Amex •••• 4012",
        handle: "Venmo @alex-k",
      },
      {
        id: "maya",
        name: "Maya",
        initials: "MY",
        colorIndex: 1,
        paidAmount: 56.28,
        paymentMethod: "Physical Cash",
        handle: "CashApp $maya_izk",
      },
      {
        id: "omar",
        name: "Omar",
        initials: "OM",
        colorIndex: 2,
        paidAmount: 0,
        paymentMethod: "No upfront payment",
        handle: "Zelle omar@dev.io",
      },
      {
        id: "priya",
        name: "Priya",
        initials: "PR",
        colorIndex: 3,
        paidAmount: 0,
        paymentMethod: "No upfront payment",
        handle: "Venmo @priya-s",
      },
      {
        id: "sam",
        name: "Sam",
        initials: "SM",
        colorIndex: 4,
        paidAmount: 0,
        paymentMethod: "No upfront payment",
        handle: "Apple Cash",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Truffle Edamame (2x)",
        price: 14.0,
        mode: "equal",
        shares: { alex: 1, maya: 1, omar: 1, priya: 0, sam: 1 },
      },
      {
        id: "item-2",
        name: "Wagyu Skewers & Sushi Boat",
        price: 96.0,
        mode: "weighted",
        shares: { alex: 2, maya: 1, omar: 3, priya: 0, sam: 0 },
      },
      {
        id: "item-3",
        name: "Crispy Pork Gyoza (12pc)",
        price: 18.0,
        mode: "equal",
        shares: { alex: 1, maya: 0, omar: 0, priya: 1, sam: 1 },
      },
      {
        id: "item-4",
        name: "Matcha Tiramisu",
        price: 12.5,
        mode: "solo",
        shares: { alex: 0, maya: 0, omar: 0, priya: 1, sam: 0 },
      },
      {
        id: "item-5",
        name: "Sake Carafe (Dassai 23)",
        price: 48.0,
        mode: "weighted",
        shares: { alex: 2, maya: 0, omar: 2, priya: 0, sam: 1 },
      },
      {
        id: "item-6",
        name: "Asahi Draft Pitcher",
        price: 22.0,
        mode: "equal",
        shares: { alex: 1, maya: 1, omar: 1, priya: 0, sam: 0 },
      },
    ],
  },

  gdg: {
    id: "gdg",
    title: "GDG DevFest Late-Night Pizza Run 🍕",
    venue: "NAPOLI ARTISAN PIES",
    subtitle: "WOOD-FIRED PIZZA & ESPRESSO BAR",
    tableNumber: "Order #GDG-404",
    slipCode: "SPLITFAIR FISCAL SLIP #40412-GDG",
    timestamp: "Oct 31, 2026 • 19:15 PM",
    taxRate: 8.0,
    taxMode: "percent",
    tipRate: 15.0,
    tipMode: "percent",
    discountAmount: 10.0,
    distributionMode: "proportional",
    diners: [
      {
        id: "zaid",
        name: "Zaid",
        initials: "ZD",
        colorIndex: 0,
        paidAmount: 110.0,
        paymentMethod: "Visa •••• 8819",
        handle: "STC Pay / Instant",
      },
      {
        id: "lina",
        name: "Lina",
        initials: "LN",
        colorIndex: 3,
        paidAmount: 35.12,
        paymentMethod: "Apple Pay",
        handle: "Apple Cash @lina",
      },
      {
        id: "kareem",
        name: "Kareem",
        initials: "KR",
        colorIndex: 2,
        paidAmount: 0,
        paymentMethod: "No upfront payment",
        handle: "Venmo @kareem",
      },
      {
        id: "sara",
        name: "Sara",
        initials: "SR",
        colorIndex: 4,
        paidAmount: 0,
        paymentMethod: "No upfront payment",
        handle: "Zelle @sara",
      },
    ],
    items: [
      {
        id: "gdg-1",
        name: "XL Burrata & Hot Honey Pie (8 Slices)",
        price: 40.0,
        mode: "weighted",
        shares: { zaid: 3, lina: 1, kareem: 3, sara: 1 },
      },
      {
        id: "gdg-2",
        name: "Truffle Mushroom Pie (6 Slices)",
        price: 36.0,
        mode: "weighted",
        shares: { zaid: 1, lina: 2, kareem: 1, sara: 2 },
      },
      {
        id: "gdg-3",
        name: "Garlic Knots & Marinara Platter",
        price: 16.0,
        mode: "equal",
        shares: { zaid: 1, lina: 1, kareem: 1, sara: 1 },
      },
      {
        id: "gdg-4",
        name: "Cold Brew & Oat Latte Cans (5x)",
        price: 25.0,
        mode: "weighted",
        shares: { zaid: 2, lina: 1, kareem: 2, sara: 0 },
      },
      {
        id: "gdg-5",
        name: "Gluten-Free Pistachio Cannoli",
        price: 11.0,
        mode: "solo",
        shares: { zaid: 0, lina: 0, kareem: 0, sara: 1 },
      },
    ],
  },

  roadtrip: {
    id: "roadtrip",
    title: "Mountain Retreat & Grocery Haul 🏡",
    venue: "ALPINE CABIN CO-OP",
    subtitle: "LODGING, FUEL & PROVISIONS LEDGER",
    tableNumber: "Cabin #07",
    slipCode: "SPLITFAIR FISCAL SLIP #90114-CAB",
    timestamp: "Oct 31, 2026 • 11:00 AM",
    taxRate: 0,
    taxMode: "percent",
    tipRate: 0,
    tipMode: "percent",
    discountAmount: 0,
    distributionMode: "proportional",
    diners: [
      {
        id: "noor",
        name: "Noor",
        initials: "NR",
        colorIndex: 5,
        paidAmount: 360.0,
        paymentMethod: "Airbnb Card",
        handle: "Bank Transfer @noor",
      },
      {
        id: "ryan",
        name: "Ryan",
        initials: "RY",
        colorIndex: 0,
        paidAmount: 145.0,
        paymentMethod: "Chase Sapphire",
        handle: "Venmo @ryan",
      },
      {
        id: "chloe",
        name: "Chloe",
        initials: "CH",
        colorIndex: 1,
        paidAmount: 0,
        paymentMethod: "No upfront payment",
        handle: "Zelle @chloe",
      },
      {
        id: "devon",
        name: "Devon",
        initials: "DV",
        colorIndex: 2,
        paidAmount: 0,
        paymentMethod: "No upfront payment",
        handle: "CashApp $devon",
      },
    ],
    items: [
      {
        id: "cab-1",
        name: "2-Night Cabin (Master Suite vs Bunk Rooms)",
        price: 360.0,
        mode: "weighted",
        shares: { noor: 3, ryan: 2, chloe: 2, devon: 2 },
      },
      {
        id: "cab-2",
        name: "SUV Highway Gas & Tolls",
        price: 65.0,
        mode: "equal",
        shares: { noor: 1, ryan: 1, chloe: 1, devon: 1 },
      },
      {
        id: "cab-3",
        name: "BBQ Steaks & Charcoal (Meat Eaters)",
        price: 80.0,
        mode: "equal",
        shares: { noor: 1, ryan: 1, chloe: 0, devon: 1 },
      },
    ],
  },

  blank: {
    id: "blank",
    title: "New Group Expense Slip ✨",
    venue: "CUSTOM RECEIPT",
    subtitle: "ITEMIZED FAIRNESS LEDGER",
    tableNumber: "Table #01",
    slipCode: "SPLITFAIR FISCAL SLIP #10001-NEW",
    timestamp: "Just Now",
    taxRate: 8.0,
    taxMode: "percent",
    tipRate: 15.0,
    tipMode: "percent",
    discountAmount: 0,
    distributionMode: "proportional",
    diners: [
      {
        id: "d1",
        name: "You",
        initials: "YO",
        colorIndex: 0,
        paidAmount: 30.24,
        paymentMethod: "Card",
        handle: "Instant Transfer",
      },
      {
        id: "d2",
        name: "Jordan",
        initials: "JR",
        colorIndex: 1,
        paidAmount: 0,
        paymentMethod: "No upfront payment",
        handle: "Venmo @jordan",
      },
      {
        id: "d3",
        name: "Taylor",
        initials: "TY",
        colorIndex: 2,
        paidAmount: 0,
        paymentMethod: "No upfront payment",
        handle: "CashApp $taylor",
      },
    ],
    items: [
      {
        id: "b-1",
        name: "Shared Appetizer Platter",
        price: 24.0,
        mode: "equal",
        shares: { d1: 1, d2: 1, d3: 1 },
      },
    ],
  },
};

export interface DinerItemBreakdown {
  itemId: string;
  itemName: string;
  itemPrice: number;
  mode: SplitMode;
  myWeight: number;
  totalWeight: number;
  myCost: number;
  formulaLabel: string;
}

export interface DinerAudit {
  diner: Diner;
  items: DinerItemBreakdown[];
  soloSubtotal: number;
  sharedSubtotal: number;
  totalItemSubtotal: number;
  taxShare: number;
  tipShare: number;
  discountShare: number;
  totalOwedForConsumption: number;
  paidUpfront: number;
  netBalance: number; // positive = is owed money (creditor), negative = owes money (debtor)
}

export interface SettlementTransfer {
  id: string;
  fromDiner: Diner;
  toDiner: Diner;
  amount: number;
}

export interface LedgerCalculationResult {
  itemsSubtotal: number;
  taxAmount: number;
  tipAmount: number;
  discountAmount: number;
  grandTotal: number;
  totalPaidUpfront: number;
  unaccountedPaymentDiff: number; // grandTotal - totalPaidUpfront
  audits: Record<string, DinerAudit>;
  transfers: SettlementTransfer[];
  unassignedItemsCount: number;
}

export function calculateSplitFairLedger(
  session: BillSession,
  currencySymbol = "$"
): LedgerCalculationResult {
  const diners = session.diners;
  const items = session.items;

  let itemsSubtotal = 0;
  let unassignedItemsCount = 0;

  const audits: Record<string, DinerAudit> = {};
  for (const d of diners) {
    audits[d.id] = {
      diner: d,
      items: [],
      soloSubtotal: 0,
      sharedSubtotal: 0,
      totalItemSubtotal: 0,
      taxShare: 0,
      tipShare: 0,
      discountShare: 0,
      totalOwedForConsumption: 0,
      paidUpfront: Number(d.paidAmount) || 0,
      netBalance: 0,
    };
  }

  for (const item of items) {
    const price = Math.max(0, Number(item.price) || 0);
    itemsSubtotal += price;

    // Calculate weights across active diners
    let totalWeight = 0;
    const activeDinerIds: string[] = [];

    for (const d of diners) {
      const w = Math.max(0, Number(item.shares[d.id]) || 0);
      if (w > 0) {
        totalWeight += w;
        activeDinerIds.push(d.id);
      }
    }

    if (totalWeight <= 0 || activeDinerIds.length === 0) {
      unassignedItemsCount++;
      continue;
    }

    for (const dId of activeDinerIds) {
      const myWeight = Math.max(0, Number(item.shares[dId]) || 0);
      let myCost = 0;
      let formulaLabel = "";

      if (item.mode === "exact") {
        // In exact mode, weights are dollar amounts, scaled if they don't sum to price
        myCost = (myWeight / totalWeight) * price;
        formulaLabel = `Exact (${currencySymbol}${myWeight.toFixed(2)})`;
      } else if (item.mode === "solo" || activeDinerIds.length === 1) {
        myCost = price;
        formulaLabel = `Solo 100%`;
      } else if (item.mode === "weighted") {
        myCost = (myWeight / totalWeight) * price;
        formulaLabel = `${myWeight}x of ${totalWeight} shares`;
      } else {
        // Equal
        myCost = price / activeDinerIds.length;
        formulaLabel = `${currencySymbol}${price.toFixed(2)} ÷ ${activeDinerIds.length}`;
      }

      const audit = audits[dId];
      if (audit) {
        audit.items.push({
          itemId: item.id,
          itemName: item.name,
          itemPrice: price,
          mode: item.mode,
          myWeight,
          totalWeight,
          myCost,
          formulaLabel,
        });
        if (activeDinerIds.length === 1 || item.mode === "solo") {
          audit.soloSubtotal += myCost;
        } else {
          audit.sharedSubtotal += myCost;
        }
        audit.totalItemSubtotal += myCost;
      }
    }
  }

  const taxAmount =
    session.taxMode === "percent"
      ? itemsSubtotal * (Math.max(0, Number(session.taxRate) || 0) / 100)
      : Math.max(0, Number(session.taxRate) || 0);

  const tipAmount =
    session.tipMode === "percent"
      ? itemsSubtotal * (Math.max(0, Number(session.tipRate) || 0) / 100)
      : Math.max(0, Number(session.tipRate) || 0);

  const discountAmount = Math.min(
    itemsSubtotal + taxAmount + tipAmount,
    Math.max(0, Number(session.discountAmount) || 0)
  );

  const grandTotal = Math.max(
    0,
    itemsSubtotal + taxAmount + tipAmount - discountAmount
  );

  const dinerCount = Math.max(1, diners.length);

  for (const d of diners) {
    const audit = audits[d.id];
    const proportion =
      itemsSubtotal > 0
        ? audit.totalItemSubtotal / itemsSubtotal
        : 1 / dinerCount;

    if (session.distributionMode === "proportional") {
      audit.taxShare = taxAmount * proportion;
      audit.tipShare = tipAmount * proportion;
      audit.discountShare = discountAmount * proportion;
    } else {
      audit.taxShare = taxAmount / dinerCount;
      audit.tipShare = tipAmount / dinerCount;
      audit.discountShare = discountAmount / dinerCount;
    }

    audit.totalOwedForConsumption = Math.max(
      0,
      audit.totalItemSubtotal +
        audit.taxShare +
        audit.tipShare -
        audit.discountShare
    );

    audit.netBalance = audit.paidUpfront - audit.totalOwedForConsumption;
  }

  const totalPaidUpfront = diners.reduce(
    (acc, d) => acc + (Number(d.paidAmount) || 0),
    0
  );
  const unaccountedPaymentDiff = grandTotal - totalPaidUpfront;

  // Minimum-Transfer Debt Simplification Algorithm
  // Note: If totalPaidUpfront doesn't equal grandTotal yet, we scale or use virtual balances based on consumption vs paid
  // Specifically, to ensure transfers always settle exact consumption even if paidUpfront is slightly off,
  // we use paidUpfront if totalPaidUpfront > 0, adjusting the largest payer by any rounding cent.
  const debtors: { diner: Diner; amount: number }[] = [];
  const creditors: { diner: Diner; amount: number }[] = [];

  for (const d of diners) {
    const net = audits[d.id].netBalance;
    if (net < -0.005) {
      debtors.push({ diner: d, amount: -net });
    } else if (net > 0.005) {
      creditors.push({ diner: d, amount: net });
    }
  }

  // Sort largest first for greedy minimum-edge matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: SettlementTransfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmt = Math.min(debtor.amount, creditor.amount);

    if (settledAmt >= 0.01) {
      transfers.push({
        id: `${debtor.diner.id}-to-${creditor.diner.id}`,
        fromDiner: debtor.diner,
        toDiner: creditor.diner,
        amount: Math.round(settledAmt * 100) / 100,
      });
    }

    debtor.amount -= settledAmt;
    creditor.amount -= settledAmt;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return {
    itemsSubtotal,
    taxAmount,
    tipAmount,
    discountAmount,
    grandTotal,
    totalPaidUpfront,
    unaccountedPaymentDiff,
    audits,
    transfers,
    unassignedItemsCount,
  };
}
