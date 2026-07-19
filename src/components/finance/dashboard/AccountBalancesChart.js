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
import { balanceSeriesByAccount } from "../lib/model";
import { formatDate, gbp, gbpShort } from "../lib/format";
import ChartCard, { NoData, chartAxisProps, chartTooltipStyle } from "./ChartCard";

// Per-account balances over time — one line per account that has at least one
// snapshot, coloured by account.colour. Lines start at each account's first
// snapshot (null before that) and carry forward after.

function AccountBalancesChart({ state }) {
  const accountsWithData = state.accounts.filter((account) =>
    state.snapshots.some((snapshot) => snapshot.accountId === account.id)
  );
  const series = balanceSeriesByAccount(state, accountsWithData);

  return (
    <ChartCard title="Account balances">
      {series.length === 0 ? (
        <NoData />
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDate} {...chartAxisProps} minTickGap={40} />
              <YAxis tickFormatter={gbpShort} {...chartAxisProps} width={70} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelFormatter={formatDate}
                formatter={(value) => gbp(value)}
              />
              <Legend wrapperStyle={{ fontSize: "0.8rem", color: "#9ca3af" }} />
              {accountsWithData.map((account) => (
                <Line
                  key={account.id}
                  type="monotone"
                  dataKey={account.id}
                  name={account.name}
                  stroke={account.colour}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default AccountBalancesChart;
