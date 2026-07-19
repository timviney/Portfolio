import React from "react";
import { portfolioSeries } from "../lib/model";
import {
  growthOverPeriod,
  flowTotals,
  twrOverRange,
  growthByAccount,
  growthByType,
} from "../lib/analytics";
import { formatDate, gbp, pct, accountLabel } from "../lib/format";
import ChartCard, { NoData } from "./ChartCard";

// Stats panel: the design doc's Analytics v1 list over the dashboard's selected
// date range. Growth/pct/TWR come from lib/analytics; this component only formats
// them. Allocation percentages live in the pies, not here.

const TWR_FOOTNOTE =
  "Time-weighted return is a Modified-Dietz-style approximation: flows are treated as landing exactly on snapshot dates, so it's only as accurate as the snapshot data allows. Growth percentages use a simple approximation that ignores the timing of flows within the period.";

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-gray-700 last:border-b-0">
      <span className="text-sm text-gray-400 font-bodyFont">{label}</span>
      <span className="font-titleFont font-bold text-lightText whitespace-nowrap">{value}</span>
    </div>
  );
}

function GrowthTable({ rows, nameKey }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-bodyFont text-lightText">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-600">
            <th className="py-2 pr-4 font-normal">Name</th>
            <th className="py-2 pr-4 font-normal text-right">Growth</th>
            <th className="py-2 font-normal text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[nameKey]} className="border-b border-gray-700">
              <td className="py-2 pr-4">{row[nameKey]}</td>
              <td
                className={`py-2 pr-4 text-right whitespace-nowrap ${
                  row.growth < 0 ? "text-red-400" : ""
                }`}
              >
                {gbp(row.growth)}
              </td>
              <td className="py-2 text-right whitespace-nowrap">
                {row.pct === null ? "—" : pct(row.pct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatsPanel({ state, range }) {
  const series = portfolioSeries(state);

  if (series.length === 0) {
    return (
      <ChartCard title="Statistics">
        <NoData />
      </ChartCard>
    );
  }

  const { start, end } = range;
  const period = growthOverPeriod(state, start, end);
  const flows = flowTotals(state, start, end);
  const twr = twrOverRange(state, start, end);
  const byAccount = growthByAccount(state, start, end).map((row) => ({
    ...row,
    name: accountLabel(row.account),
  }));
  const byType = growthByType(state, start, end).map((row) => ({ ...row, name: row.type }));

  return (
    <ChartCard
      title={`Statistics — ${formatDate(start)} to ${formatDate(end)}`}
      footnote={TWR_FOOTNOTE}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <div>
          <Stat label="Total growth" value={gbp(period.growth)} />
          <Stat label="Percentage growth" value={period.pct === null ? "—" : pct(period.pct)} />
          <Stat label="Contributions" value={gbp(flows.contributions)} />
          <Stat label="Withdrawals" value={gbp(flows.withdrawals)} />
          <Stat label="Net contributions" value={gbp(flows.net)} />
          <Stat label="Time-weighted return" value={twr === null ? "—" : pct(twr)} />
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-sm font-titleFont text-lightText mb-2">Growth by account</h4>
            <GrowthTable rows={byAccount} nameKey="name" />
          </div>
          <div>
            <h4 className="text-sm font-titleFont text-lightText mb-2">Growth by account type</h4>
            <GrowthTable rows={byType} nameKey="name" />
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

export default StatsPanel;
