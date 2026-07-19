import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { seriesInRange } from "../lib/model";
import { twrSeries } from "../lib/analytics";
import { formatDate, pct } from "../lib/format";
import ChartCard, { NoData, chartAxisProps, chartTooltipStyle } from "./ChartCard";

// Cumulative time-weighted return over time. Approximate — see the footnote.

const TWR_FOOTNOTE =
  "Approximate time-weighted return (Modified-Dietz-style): flows are treated as landing exactly on snapshot dates, so accuracy depends on how often balances are recorded.";

function TwrChart({ state, range }) {
  const series = seriesInRange(twrSeries(state), range.start, range.end);

  return (
    <ChartCard title="Time-weighted return" footnote={TWR_FOOTNOTE}>
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
                formatter={(value) => [pct(value), "TWR"]}
              />
              <Line
                type="monotone"
                dataKey="twr"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default TwrChart;
