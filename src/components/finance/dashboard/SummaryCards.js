import React from "react";
import { summaryTotals } from "../lib/model";
import { gbp } from "../lib/format";

// The seven summary cards: total, savings, investments, ISA, GIA, taxable, tax-free.
// All figures come from summaryTotals over active accounts' latest balances.

const CARDS = [
  ["Total", "total"],
  ["Savings", "savings"],
  ["Investments", "investments"],
  ["ISA", "isa"],
  ["GIA", "gia"],
  ["Taxable", "taxable"],
  ["Tax-free", "taxFree"],
];

function SummaryCards({ state, asOf }) {
  const totals = summaryTotals(state, asOf);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {CARDS.map(([label, key]) => (
        <div
          key={key}
          className="bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-4"
        >
          <p className="text-xs text-gray-400 font-bodyFont mb-1">{label}</p>
          <p className="text-lg font-titleFont font-bold text-lightText whitespace-nowrap overflow-hidden text-ellipsis">
            {gbp(totals[key])}
          </p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
