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
import { providerColour } from "../lib/model";
import { twrSeriesByProviderOverRange } from "../lib/analytics";
import { colourFor, formatDate, pct } from "../lib/format";
import ChartCard, { NoData, chartAxisProps, chartTooltipStyle, useHiddenSeries } from "./ChartCard";

// Time-weighted return per provider (company) over the selected dashboard range.
// Each line is rebased to 0 at the range start. Approximate — see TwrChart.

function ProviderTwrChart({ state, range }) {
  const { hidden, legendProps } = useHiddenSeries();
  const providers = [
    ...new Set(
      state.accounts
        .filter((account) => state.snapshots.some((snapshot) => snapshot.accountId === account.id))
        .map((account) => account.provider || "Unknown")
    ),
  ];
  const series = twrSeriesByProviderOverRange(state, range.start, range.end);

  const legendPayload = providers.map((provider, index) => ({
    value: provider,
    dataKey: provider,
    type: "line",
    color: providerColour(state, provider) ?? colourFor(index),
    payload: { provider },
  }));

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
              <Legend {...legendProps} payload={legendPayload} />
              {providers.map((provider, index) => (
                <Line
                  key={provider}
                  type="monotone"
                  dataKey={provider}
                  name={provider}
                  stroke={providerColour(state, provider) ?? colourFor(index)}
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
