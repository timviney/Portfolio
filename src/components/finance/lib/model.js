// Selectors: derive display-ready data from the document.
// Pure functions, no React. All date comparisons are lexicographic (YYYY-MM-DD strings).

import { colourFor } from "./format";

export const activeAccounts = (state) => state.accounts.filter((account) => !account.archived);

/**
 * Latest snapshot per account: max date; same-date ties go to the later array entry.
 * Scanning in array order with `>=` implements exactly that. Returns Map(accountId -> snapshot).
 * Pass asOf (YYYY-MM-DD) to ignore snapshots after that date.
 */
export function latestByAccount(state, asOf = null) {
  const latest = new Map();
  for (const snapshot of state.snapshots) {
    if (asOf && snapshot.date > asOf) continue;
    const best = latest.get(snapshot.accountId);
    if (!best || snapshot.date >= best.date) latest.set(snapshot.accountId, snapshot);
  }
  return latest;
}

/**
 * Restricts a dated series to [start, end]. A synthetic first point at `start`
 * carries forward the last known values before the range, so charts begin at the
 * range edge (carry-forward only — if nothing exists before start, the series
 * simply begins at the first point inside the range).
 */
export function seriesInRange(series, start, end) {
  let before = null;
  const inside = [];
  for (const point of series) {
    if (point.date < start) before = point;
    else if (point.date <= end) inside.push(point);
  }
  if (inside.length > 0 && inside[0].date === start) return inside;
  return before ? [{ ...before, date: start }, ...inside] : inside;
}

/**
 * Per-type balance series over the union of all snapshot dates (for the stacked
 * area chart). Returns [{ date, [type]: balance|null }]: a type is null until the
 * first snapshot of any account of that type, then the carried sum of its balances.
 */
export function balanceSeriesByType(state) {
  if (state.snapshots.length === 0) return [];
  const types = [...new Set(state.accounts.map((account) => account.type || "Unknown"))];
  const dates = [...new Set(state.snapshots.map((snapshot) => snapshot.date))].sort();
  const histories = new Map(state.accounts.map((account) => [account.id, accountHistory(state, account.id)]));
  const cursors = new Map(state.accounts.map((account) => [account.id, 0]));

  return dates.map((date) => {
    const point = { date };
    const sums = new Map();
    for (const account of state.accounts) {
      const history = histories.get(account.id);
      let cursor = cursors.get(account.id);
      while (cursor < history.length && history[cursor].date <= date) cursor++;
      cursors.set(account.id, cursor);
      if (cursor > 0) {
        const type = account.type || "Unknown";
        sums.set(type, (sums.get(type) ?? 0) + history[cursor - 1].balance);
      }
    }
    for (const type of types) point[type] = sums.get(type) ?? null;
    return point;
  });
}

/** Snapshots of one account, date-ascending; same-date snapshots keep array order (stable sort). */
export function accountHistory(state, accountId) {
  return state.snapshots
    .filter((snapshot) => snapshot.accountId === accountId)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * Portfolio series: for every date that has at least one snapshot, the total value,
 * where each account contributes its most recent snapshot <= that date (carry-forward only,
 * never back-fill). Returns [{ date, value }] ascending.
 */
export function portfolioSeries(state) {
  if (state.snapshots.length === 0) return [];
  const dates = [...new Set(state.snapshots.map((snapshot) => snapshot.date))].sort();
  const histories = new Map(state.accounts.map((account) => [account.id, accountHistory(state, account.id)]));
  const cursors = new Map(state.accounts.map((account) => [account.id, 0]));

  return dates.map((date) => {
    let value = 0;
    for (const account of state.accounts) {
      const history = histories.get(account.id);
      let cursor = cursors.get(account.id);
      // Advance through every snapshot <= date; ties end on the last same-date entry.
      while (cursor < history.length && history[cursor].date <= date) cursor++;
      cursors.set(account.id, cursor);
      if (cursor > 0) value += history[cursor - 1].balance;
    }
    return { date, value };
  });
}

/**
 * Per-account balance series over the union of all snapshot dates, for the multi-line chart.
 * Returns [{ date, [accountId]: balance|null }]. An account is null before its first
 * snapshot (line hasn't started), carried forward after.
 */
export function balanceSeriesByAccount(state, accounts = state.accounts) {
  if (state.snapshots.length === 0) return [];
  const dates = [...new Set(state.snapshots.map((snapshot) => snapshot.date))].sort();
  const histories = new Map(accounts.map((account) => [account.id, accountHistory(state, account.id)]));
  const cursors = new Map(accounts.map((account) => [account.id, 0]));

  return dates.map((date) => {
    const point = { date };
    for (const account of accounts) {
      const history = histories.get(account.id);
      let cursor = cursors.get(account.id);
      while (cursor < history.length && history[cursor].date <= date) cursor++;
      cursors.set(account.id, cursor);
      point[account.id] = cursor > 0 ? history[cursor - 1].balance : null;
    }
    return point;
  });
}

/**
 * Summary card totals over ACTIVE accounts' latest balances (pass asOf to value
 * them at a past date).
 * Savings = type in config.savingsTypes; investments = everything else; ISA = type in
 * config.isaTypes; GIA = the literal "GIA" type; taxable = type in config.taxableTypes.
 * Savings/investments and taxable/tax-free are independent axes (a GIA is a taxable
 * investment, a Cash ISA is tax-free savings).
 */
export function summaryTotals(state, asOf = null) {
  const latest = latestByAccount(state, asOf);
  const totals = { total: 0, savings: 0, isa: 0, gia: 0, taxable: 0 };
  for (const account of activeAccounts(state)) {
    const balance = latest.get(account.id)?.balance ?? 0;
    totals.total += balance;
    if (state.config.savingsTypes.includes(account.type)) totals.savings += balance;
    if (state.config.isaTypes.includes(account.type)) totals.isa += balance;
    if (state.config.taxableTypes.includes(account.type)) totals.taxable += balance;
    if (account.type === "GIA") totals.gia += balance;
  }
  return {
    ...totals,
    investments: totals.total - totals.savings,
    taxFree: totals.total - totals.taxable,
  };
}

/**
 * Allocation of ACTIVE accounts' latest balances (pass asOf for a past date).
 * groupBy: "account" | "type" | "provider" | "owner".
 * Returns [{ name, value, colour }] (zero-value slices dropped), value descending.
 */
export function allocationBy(state, groupBy, asOf = null) {
  const latest = latestByAccount(state, asOf);
  const groups = new Map();
  for (const account of activeAccounts(state)) {
    const balance = latest.get(account.id)?.balance ?? 0;
    if (balance <= 0) continue;
    const name = groupBy === "account" ? account.name : account[groupBy] || "Unknown";
    const colour = groupBy === "account" ? account.colour : undefined;
    const group = groups.get(name) ?? { name, value: 0, colour };
    group.value += balance;
    groups.set(name, group);
  }
  return [...groups.values()]
    .sort((a, b) => b.value - a.value)
    .map((group, index) => ({ ...group, colour: group.colour ?? colourFor(index) }));
}
