import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { allocationBy } from "../lib/model";
import { gbp, pct } from "../lib/format";
import ChartCard, { NoData, chartTooltipStyle } from "./ChartCard";

// One reusable allocation pie. groupBy: "account" | "type" | "provider" | "owner".
// Allocations are valued as of the dashboard range's end date.
// Rendered four times on the dashboard with different groupings.

function AllocationChart({ state, groupBy, title, asOf }) {
  const slices = allocationBy(state, groupBy, asOf);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <ChartCard title={title}>
      {slices.length === 0 ? (
        <NoData />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius="45%"
                outerRadius="75%"
                paddingAngle={2}
                stroke="none"
              >
                {slices.map((slice) => (
                  <Cell key={slice.name} fill={slice.colour} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value) => [`${gbp(value)} (${pct(value / total)})`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "0.8rem", color: "#9ca3af" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default AllocationChart;
