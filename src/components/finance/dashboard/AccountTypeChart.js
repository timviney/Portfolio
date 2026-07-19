import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { balanceSeriesByType, seriesInRange } from "../lib/model";
import { colourFor, formatDate, gbp, gbpShort } from "../lib/format";
import ChartCard, { NoData, chartAxisProps, chartTooltipStyle, useHiddenSeries } from "./ChartCard";

// Balances over time grouped by account type (stacked area). Same rendering rules
// as AccountBalancesChart: zeros (not nulls) in the stack, linear interpolation.

function AccountTypeChart({ state, range }) {
  const { hidden, legendProps } = useHiddenSeries();
  const types = [
    ...new Set(
      state.accounts
        .filter((account) => state.snapshots.some((snapshot) => snapshot.accountId === account.id))
        .map((account) => account.type || "Unknown")
    ),
  ];
  const series = seriesInRange(balanceSeriesByType(state), range.start, range.end).map((point) => {
    const next = { ...point };
    for (const type of types) next[type] = next[type] ?? 0;
    return next;
  });

  return (
    <ChartCard title="Balances by account type">
      {series.length === 0 ? (
        <NoData />
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDate} {...chartAxisProps} minTickGap={40} />
              <YAxis tickFormatter={gbpShort} {...chartAxisProps} width={70} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelFormatter={formatDate}
                formatter={(value) => gbp(value)}
              />
              <Legend {...legendProps} />
              {types.map((type, index) => (
                <Area
                  key={type}
                  type="linear"
                  dataKey={type}
                  stackId="1"
                  stroke={colourFor(index)}
                  fill={colourFor(index)}
                  fillOpacity={0.4}
                  hide={hidden.has(type)}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default AccountTypeChart;
