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
import { twrSeriesByAccount } from "../lib/analytics";
import { formatDate, pct } from "../lib/format";
import ChartCard, { NoData, chartAxisProps, chartTooltipStyle } from "./ChartCard";

// Cumulative time-weighted return per account — one line per account that has at
// least one snapshot, coloured by account.colour. Approximate — see TwrChart.

function AccountTwrChart({ state, range }) {
  const accountsWithData = state.accounts.filter((account) =>
    state.snapshots.some((snapshot) => snapshot.accountId === account.id)
  );
  const series = seriesInRange(twrSeriesByAccount(state), range.start, range.end);

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

export default AccountTwrChart;
