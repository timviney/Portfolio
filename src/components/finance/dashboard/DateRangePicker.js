import React from "react";

// Start/end date inputs driving every chart and stat on the dashboard.
// Start is clamped to not exceed end (and vice versa) so the range stays valid.

const inputClass =
  "h-8 rounded-lg border-b-[1px] border-b-gray-600 bg-[#191b1e] text-lightText px-2 text-sm outline-none focus-visible:outline-designColor focus-visible:border-b-transparent duration-300";

function DateRangePicker({ range, onChange }) {
  const patch = (key) => (event) => {
    const next = { ...range, [key]: event.target.value };
    if (next.start && next.end && next.start > next.end) {
      next[key === "start" ? "end" : "start"] = next[key];
    }
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne px-6 py-4">
      <span className="text-sm font-titleFont font-bold text-lightText">Date range</span>
      <label className="flex items-center gap-2 text-sm text-gray-400 font-bodyFont">
        From
        <input type="date" className={inputClass} value={range.start} onChange={patch("start")} />
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-400 font-bodyFont">
        To
        <input type="date" className={inputClass} value={range.end} onChange={patch("end")} />
      </label>
    </div>
  );
}

export default DateRangePicker;
