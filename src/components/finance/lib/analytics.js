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

/**
 * Flow totals: { contributions, withdrawals, net }. With start/end, only snapshots
 * in (start, end] count (same window semantics as netContributions).
 */
export function flowTotals(state, start = null, end = null) {
  let contributions = 0;
  let withdrawals = 0;
  for (const snapshot of state.snapshots) {
    if (start !== null && snapshot.date <= start) continue;
    if (end !== null && snapshot.date > end) continue;
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
 * Cumulative TWR at every portfolio-series point: [{ date, twr }], twr expressed
 * as a ratio (0.12 = 12%). Starts at 0 on the first date (the baseline); periods
 * with V_{i−1} = 0 are skipped (no base), leaving the cumulative value unchanged.
 * Same Modified-Dietz-style approximation as twrApproximation.
 */
export function twrSeries(state) {
  const series = portfolioSeries(state);
  if (series.length === 0) return [];
  const out = [{ date: series[0].date, twr: 0 }];
  let twr = 1;
  for (let i = 1; i < series.length; i++) {
    const previous = series[i - 1].value;
    if (previous > 0) {
      const flows = netContributions(state, series[i - 1].date, series[i].date);
      twr *= 1 + (series[i].value - previous - flows) / previous;
    }
    out.push({ date: series[i].date, twr: twr - 1 });
  }
  return out;
}

/**
 * TWR over [start, end] by chaining the cumulative series:
 * (1 + T_end) / (1 + T_start) − 1. T_start is the last cumulative value ≤ start
 * (0 if the range starts before the first snapshot). Null when no data exists ≤ end.
 */
export function twrOverRange(state, start, end) {
  let atStart = 0;
  let atEnd = null;
  for (const point of twrSeries(state)) {
    if (point.date <= start) atStart = point.twr;
    if (point.date <= end) atEnd = point.twr;
    else break;
  }
  return atEnd === null ? null : (1 + atEnd) / (1 + atStart) - 1;
}

/**
 * Cumulative TWR per account over the union of all snapshot dates:
 * [{ date, [accountId]: twr|null }] (twr as a ratio). An account is null before its
 * first snapshot, 0 at it, and afterwards chains r_i = (B_i − B_{i−1} − F_i) / B_{i−1}
 * where F is the snapshot's own contribution − withdrawal and B the account's
 * balances. Periods with B_{i−1} = 0 are skipped. Same Modified-Dietz-style
 * approximation as the portfolio TWR.
 */
export function twrSeriesByAccount(state) {
  if (state.snapshots.length === 0) return [];
  const dates = [...new Set(state.snapshots.map((snapshot) => snapshot.date))].sort();
  const histories = new Map(state.accounts.map((account) => [account.id, accountHistory(state, account.id)]));
  const cursors = new Map(state.accounts.map((account) => [account.id, 0]));
  const twrs = new Map(); // accountId -> cumulative twr ratio at the cursor

  return dates.map((date) => {
    const point = { date };
    for (const account of state.accounts) {
      const history = histories.get(account.id);
      let cursor = cursors.get(account.id);
      while (cursor < history.length && history[cursor].date <= date) {
        if (cursor === 0) {
          twrs.set(account.id, 0);
        } else {
          const snapshot = history[cursor];
          const previous = history[cursor - 1].balance;
          if (previous > 0) {
            const flows = snapshot.contribution - snapshot.withdrawal;
            const growth = (snapshot.balance - previous - flows) / previous;
            twrs.set(account.id, (1 + (twrs.get(account.id) ?? 0)) * (1 + growth) - 1);
          }
        }
        cursor++;
      }
      cursors.set(account.id, cursor);
      point[account.id] = cursor > 0 ? twrs.get(account.id) : null;
    }
    return point;
  });
}

/**
 * TWR over [start, end] for each account: chains the cumulative per-account TWR.
 * Returns Map(accountId -> twr|null). Accounts with no snapshots in the range get
 * null; an account that starts after `start` is chained from its first snapshot
 * (baseline 0). Same approximation as twrOverRange.
 */
export function twrOverRangeByAccount(state, start, end) {
  const series = twrSeriesByAccount(state);
  const result = new Map();
  for (const account of state.accounts) result.set(account.id, null);
  if (series.length === 0) return result;

  const atStart = new Map();
  const atEnd = new Map();
  for (const point of series) {
    if (point.date > end) break;
    for (const account of state.accounts) {
      const value = point[account.id];
      if (value !== null && value !== undefined) {
        atEnd.set(account.id, value);
        if (point.date <= start) atStart.set(account.id, value);
      }
    }
  }

  for (const account of state.accounts) {
    const endVal = atEnd.get(account.id);
    if (endVal !== undefined) {
      const startVal = atStart.get(account.id) ?? 0;
      result.set(account.id, (1 + endVal) / (1 + startVal) - 1);
    }
  }
  return result;
}

/**
 * Cumulative TWR per provider over the union of all snapshot dates:
 * [{ date, [provider]: twr|null }] (twr as a ratio). Computed like the portfolio
 * TWR but restricted to each provider's accounts: V = the carried sum of their
 * balances, F = their net flows recorded at each point. Null before a provider's
 * first snapshot, 0 at it, zero-base periods skipped. Same approximation as twrSeries.
 */
export function twrSeriesByProvider(state) {
  if (state.snapshots.length === 0) return [];
  const providers = [...new Set(state.accounts.map((account) => account.provider || "Unknown"))];
  const providerOf = new Map(state.accounts.map((account) => [account.id, account.provider || "Unknown"]));
  const dates = [...new Set(state.snapshots.map((snapshot) => snapshot.date))].sort();
  const histories = new Map(state.accounts.map((account) => [account.id, accountHistory(state, account.id)]));
  const cursors = new Map(state.accounts.map((account) => [account.id, 0]));

  // Net flows per provider at each date (flows sit on the snapshot they arrived with).
  const flowsByDate = new Map();
  for (const snapshot of state.snapshots) {
    const provider = providerOf.get(snapshot.accountId);
    if (!provider) continue;
    const atDate = flowsByDate.get(snapshot.date) ?? new Map();
    atDate.set(provider, (atDate.get(provider) ?? 0) + snapshot.contribution - snapshot.withdrawal);
    flowsByDate.set(snapshot.date, atDate);
  }

  const values = new Map(); // provider -> carried value at the previous point
  const twrs = new Map(); // provider -> cumulative twr ratio

  return dates.map((date) => {
    const point = { date };
    const balances = new Map();
    for (const account of state.accounts) {
      const history = histories.get(account.id);
      let cursor = cursors.get(account.id);
      while (cursor < history.length && history[cursor].date <= date) cursor++;
      cursors.set(account.id, cursor);
      if (cursor > 0) {
        const provider = providerOf.get(account.id);
        balances.set(provider, (balances.get(provider) ?? 0) + history[cursor - 1].balance);
      }
    }
    const flows = flowsByDate.get(date) ?? new Map();
    for (const provider of providers) {
      const value = balances.get(provider);
      if (value === undefined) {
        point[provider] = twrs.get(provider) ?? null;
        continue;
      }
      if (!values.has(provider)) {
        twrs.set(provider, 0); // baseline at the provider's first snapshot
      } else {
        const previous = values.get(provider);
        if (previous > 0) {
          const growth = (value - previous - (flows.get(provider) ?? 0)) / previous;
          twrs.set(provider, (1 + twrs.get(provider)) * (1 + growth) - 1);
        }
      }
      values.set(provider, value);
      point[provider] = twrs.get(provider);
    }
    return point;
  });
}

/**
 * Growth over a period per account: balance(end) − balance(start) − that account's
 * net contributions in (start, end]. Includes archived accounts (their history counts).
 * Returns [{ account, startBalance, endBalance, netContributions, growth, pct, twr }],
 * pct null when the base is 0, twr null when no snapshot exists in the range. Order
 * matches `state.accounts`.
 */
export function growthByAccount(state, start, end) {
  const twrByAccount = twrOverRangeByAccount(state, start, end);
  return state.accounts.map((account) => {
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
      twr: twrByAccount.get(account.id),
    };
  });
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
