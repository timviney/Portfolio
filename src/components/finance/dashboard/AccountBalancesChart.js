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
import { balanceSeriesByAccount, seriesInRange } from "../lib/model";
import { formatDate, gbp, gbpShort, accountLabel } from "../lib/format";
import ChartCard, { NoData, chartAxisProps, chartTooltipStyle, useHiddenSeries } from "./ChartCard";

// Per-account balances over time (stacked area) — one area per account that has at
// least one snapshot, coloured by account.colour. Areas are zero before the account
// starts (nulls in a stack make Recharts misalign the areas) and use linear
// interpolation (monotone smoothing overshoots at zero and makes areas overlap).

function AccountBalancesChart({ state, range }) {
  const { hidden, legendProps } = useHiddenSeries();
  const accountsWithData = state.accounts.filter((account) =>
    state.snapshots.some((snapshot) => snapshot.accountId === account.id)
  );
  const series = seriesInRange(balanceSeriesByAccount(state, accountsWithData), range.start, range.end).map(
    (point) => {
      const next = { ...point };
      for (const account of accountsWithData) next[account.id] = next[account.id] ?? 0;
      return next;
    }
  );

  return (
    <ChartCard title="Account balances">
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
              {accountsWithData.map((account) => (
                <Area
                  key={account.id}
                  type="linear"
                  dataKey={account.id}
                  name={accountLabel(account)}
                  stackId="1"
                  stroke={account.colour}
                  fill={account.colour}
                  fillOpacity={0.4}
                  hide={hidden.has(account.id)}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default AccountBalancesChart;
