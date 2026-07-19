// Display formatting helpers and the fixed colour palette used for grouping.
// Dates are built from split parts, never `new Date(isoString)` (UTC-shift bug).

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

/** £12,345.67 */
export const gbp = (value) => GBP.format(value ?? 0);

/** £12.3k — compact form for chart axis labels. */
export const gbpShort = (value) =>
  Math.abs(value) >= 1000 ? `£${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : gbp(value);

/** 0.123 -> "12.3%" (input is a ratio). */
export const pct = (ratio) => `${((ratio ?? 0) * 100).toFixed(1)}%`;

/** "2026-07-01" -> "1 Jul 2026" */
export function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Today's date as a local YYYY-MM-DD string (not toISOString — that uses UTC). */
export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Fixed palette, legible on the site's dark background. First entry = designColor.
const PALETTE = [
  "#5d7bff", "#4fc3f7", "#4ade80", "#facc15", "#fb923c",
  "#f472b6", "#a78bfa", "#34d399", "#f87171", "#94a3b8",
];

/** Stable colour for the Nth item in a grouping. */
export const colourFor = (index) => PALETTE[index % PALETTE.length];
