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
import { twrSeriesByAccountOverRange } from "../lib/analytics";
import { formatDate, pct, accountLabel } from "../lib/format";
import ChartCard, { NoData, chartAxisProps, chartTooltipStyle, useHiddenSeries } from "./ChartCard";

// Time-weighted return per account over the selected dashboard range. Each line
// is rebased to 0 at the range start so it shows return accumulated during the
// period. Approximate — see TwrChart.

function AccountTwrChart({ state, range }) {
  const { hidden, legendProps } = useHiddenSeries();
  const accountsWithData = state.accounts.filter((account) =>
    state.snapshots.some((snapshot) => snapshot.accountId === account.id)
  );
  const series = twrSeriesByAccountOverRange(state, range.start, range.end);

  const legendPayload = accountsWithData.map((account) => ({
    value: accountLabel(account),
    dataKey: account.id,
    type: "line",
    color: account.colour,
    payload: account,
  }));

  return (
    <ChartCard title="Time-weighted return by account">
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
              {accountsWithData.map((account) => (
                <Line
                  key={account.id}
                  type="monotone"
                  dataKey={account.id}
                  name={accountLabel(account)}
                  stroke={account.colour}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                  hide={hidden.has(account.id)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default AccountTwrChart;
