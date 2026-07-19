import React, { useState } from "react";

// Shared card wrapper for dashboard charts, plus the Recharts style constants so
// every chart matches the site's dark theme. Charts keep zero business logic —
// they render selector output from lib/.

export const chartTooltipStyle = {
  backgroundColor: "#191b1e",
  border: "1px solid #4b5563",
  borderRadius: "0.5rem",
  color: "#e5e7eb",
  fontSize: "0.875rem",
};

export const chartAxisProps = {
  stroke: "#9ca3af",
  fontSize: 12,
  tickLine: false,
};

/**
 * Legend click-to-toggle (Highcharts-style). Wire `legendProps` into <Legend> and
 * pass `hide={hidden.has(key)}` to each series. Hidden entries are dimmed.
 */
export function useHiddenSeries() {
  const [hidden, setHidden] = useState(new Set());
  const legendProps = {
    onClick: (entry) => {
      const key = entry.dataKey ?? entry.value;
      setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    formatter: (value, entry) => (
      <span style={{ opacity: hidden.has(entry.dataKey ?? entry.value) ? 0.35 : 1 }}>{value}</span>
    ),
    wrapperStyle: { fontSize: "0.8rem", color: "#9ca3af", cursor: "pointer" },
  };
  return { hidden, legendProps };
}

function ChartCard({ title, footnote, children }) {
  return (
    <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-6">
      <h3 className="text-lg font-titleFont font-bold text-lightText mb-4">{title}</h3>
      {children}
      {footnote && <p className="text-xs text-gray-400 font-bodyFont mt-4">{footnote}</p>}
    </div>
  );
}

export function NoData() {
  return (
    <p className="text-sm text-gray-400 font-bodyFont">
      No snapshots yet — add some from the Update tab.
    </p>
  );
}

export default ChartCard;
