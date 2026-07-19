import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { seriesInRange } from "../lib/model";
import { twrSeriesByProvider } from "../lib/analytics";
import { colourFor, formatDate, pct } from "../lib/format";
import ChartCard, { NoData, chartAxisProps, chartTooltipStyle, useHiddenSeries } from "./ChartCard";

// Cumulative time-weighted return per provider (company) — one line per provider
// that has at least one snapshot across its accounts. Approximate — see TwrChart.

function ProviderTwrChart({ state, range }) {
  const { hidden, legendProps } = useHiddenSeries();
  const providers = [
    ...new Set(
      state.accounts
        .filter((account) => state.snapshots.some((snapshot) => snapshot.accountId === account.id))
        .map((account) => account.provider || "Unknown")
    ),
  ];
  const series = seriesInRange(twrSeriesByProvider(state), range.start, range.end);

  return (
    <ChartCard title="Time-weighted return by provider">
      {series.length === 0 ? (
        <NoData />
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDate} {...chartAxisProps} minTickGap={40} />
              <YAxis tickFormatter={pct} {...chartAxisProps} width={70} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelFormatter={formatDate}
                formatter={(value) => pct(value)}
              />
              <Legend {...legendProps} />
              {providers.map((provider, index) => (
                <Line
                  key={provider}
                  type="monotone"
                  dataKey={provider}
                  name={provider}
                  stroke={colourFor(index)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                  hide={hidden.has(provider)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default ProviderTwrChart;
