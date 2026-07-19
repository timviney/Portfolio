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
import { portfolioSeries } from "../lib/model";
import { formatDate, gbp, gbpShort } from "../lib/format";
import ChartCard, { NoData, chartAxisProps, chartTooltipStyle } from "./ChartCard";

// Total portfolio value over time (carry-forward across every snapshot date).

function PortfolioValueChart({ state }) {
  const series = portfolioSeries(state);

  return (
    <ChartCard title="Portfolio value">
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
                formatter={(value) => [gbp(value), "Total"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#5d7bff"
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

export default PortfolioValueChart;
