// Analytics: growth, net contributions and TWR over the portfolio or slices of it.
// Pure functions, no React. Built on the selectors in model.js.
// All date comparisons are lexicographic (YYYY-MM-DD strings).

import { portfolioSeries, accountHistory } from "./model";

/**
 * Net contributions (Σ contributions − Σ withdrawals) over snapshots with
 * start < date <= end. Pass accountIds (Set) to restrict to a slice of accounts.
 */
export function netContributions(state, start, end, accountIds = null) {
  let net = 0;
  for (const snapshot of state.snapshots) {
    if (snapshot.date <= start || snapshot.date > end) continue;
    if (accountIds && !accountIds.has(snapshot.accountId)) continue;
    net += snapshot.contribution - snapshot.withdrawal;
  }
  return net;
}

/** Total net contributions across the whole document (all time, all accounts). */
export function totalNetContributions(state) {
  let net = 0;
  for (const snapshot of state.snapshots) net += snapshot.contribution - snapshot.withdrawal;
  return net;
}

/** All-time flow totals: { contributions, withdrawals, net } across all accounts. */
export function flowTotals(state) {
  let contributions = 0;
  let withdrawals = 0;
  for (const snapshot of state.snapshots) {
    contributions += snapshot.contribution;
    withdrawals += snapshot.withdrawal;
  }
  return { contributions, withdrawals, net: contributions - withdrawals };
}

/**
 * Portfolio value at date D: the last portfolioSeries point <= D (carry-forward only).
 * 0 if no snapshot exists on or before D.
 */
export function valueAtDate(state, date) {
  let value = 0;
  for (const point of portfolioSeries(state)) {
    if (point.date > date) break;
    value = point.value;
  }
  return value;
}

/** One account's balance at date D (carry-forward; 0 before its first snapshot). */
function accountBalanceAt(state, accountId, date) {
  let balance = 0;
  for (const snapshot of accountHistory(state, accountId)) {
    if (snapshot.date > date) break;
    balance = snapshot.balance;
  }
  return balance;
}

/**
 * Growth over a period: value(end) − value(start) − netContributions(start, end].
 * Percentage is growth / (value(start) + netContributions) — a simple approximation
 * that ignores the timing of flows within the period (documented as such; the TWR
 * below is the timing-aware measure). pct is null when the base is 0.
 */
export function growthOverPeriod(state, start, end) {
  const startValue = valueAtDate(state, start);
  const endValue = valueAtDate(state, end);
  const net = netContributions(state, start, end);
  const growth = endValue - startValue - net;
  const base = startValue + net;
  return {
    startValue,
    endValue,
    netContributions: net,
    growth,
    pct: base > 0 ? growth / base : null,
  };
}

/**
 * TWR approximation over the whole history: for consecutive portfolio values V
 * with net flows F between them, r_i = (V_i − V_{i−1} − F_i) / V_{i−1} and
 * TWR = Π(1 + r_i) − 1. This is a Modified-Dietz-style approximation — flows are
 * treated as landing exactly on snapshot dates, which is only as accurate as the
 * manual snapshot data allows. Periods with V_{i−1} = 0 are skipped (no base).
 * Returns null when no return could be computed.
 */
export function twrApproximation(state) {
  const series = portfolioSeries(state);
  if (series.length < 2) return null;
  let twr = 1;
  let any = false;
  for (let i = 1; i < series.length; i++) {
    const previous = series[i - 1].value;
    if (previous <= 0) continue;
    const flows = netContributions(state, series[i - 1].date, series[i].date);
    twr *= 1 + (series[i].value - previous - flows) / previous;
    any = true;
  }
  return any ? twr - 1 : null;
}

/**
 * Growth over a period per account: balance(end) − balance(start) − that account's
 * net contributions in (start, end]. Includes archived accounts (their history counts).
 * Returns [{ account, startBalance, endBalance, netContributions, growth, pct }],
 * pct null when the base is 0, sorted by growth descending.
 */
export function growthByAccount(state, start, end) {
  const rows = state.accounts.map((account) => {
    const startBalance = accountBalanceAt(state, account.id, start);
    const endBalance = accountBalanceAt(state, account.id, end);
    const net = netContributions(state, start, end, new Set([account.id]));
    const growth = endBalance - startBalance - net;
    const base = startBalance + net;
    return {
      account,
      startBalance,
      endBalance,
      netContributions: net,
      growth,
      pct: base > 0 ? growth / base : null,
    };
  });
  return rows.sort((a, b) => b.growth - a.growth);
}

/**
 * Growth over a period grouped by account type (for the StatsPanel).
 * Same math as growthByAccount, aggregated; returns
 * [{ type, startValue, endValue, netContributions, growth, pct }], growth descending.
 */
export function growthByType(state, start, end) {
  const groups = new Map();
  for (const row of growthByAccount(state, start, end)) {
    const type = row.account.type || "Unknown";
    const group = groups.get(type) ?? {
      type,
      startValue: 0,
      endValue: 0,
      netContributions: 0,
      growth: 0,
    };
    group.startValue += row.startBalance;
    group.endValue += row.endBalance;
    group.netContributions += row.netContributions;
    group.growth += row.growth;
    groups.set(type, group);
  }
  return [...groups.values()]
    .map((group) => {
      const base = group.startValue + group.netContributions;
      return { ...group, pct: base > 0 ? group.growth / base : null };
    })
    .sort((a, b) => b.growth - a.growth);
}
