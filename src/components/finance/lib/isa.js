// ISA tracking: contributions per owner and tax year against the year's allowance.
// Pure functions, no React. All date comparisons are lexicographic (YYYY-MM-DD strings).

import { todayString } from "./format";

/** The tax year whose [start, end] window contains the given date, or null. */
export function taxYearForDate(state, date) {
  return state.config.taxYears.find((taxYear) => date >= taxYear.start && date <= taxYear.end) ?? null;
}

/** The tax year containing today's date, or null if none is configured for it. */
export function currentTaxYear(state) {
  return taxYearForDate(state, todayString());
}

/**
 * ISA summaries for one tax year, grouped by owner. Only snapshots of accounts
 * whose type is in config.isaTypes and whose date falls within [start, end] count.
 * net = Σ contributions − Σ withdrawals; remaining = isaAllowance − net (negative
 * means over-contributed). Returns [{ owner, contributions, withdrawals, net,
 * allowance, remaining }] sorted by owner, one row per owner that has an ISA
 * account (owners with no ISA activity show zeros).
 */
export function isaSummary(state, taxYear) {
  const isaAccounts = state.accounts.filter((account) => state.config.isaTypes.includes(account.type));
  const byOwner = new Map();
  for (const account of isaAccounts) {
    if (!byOwner.has(account.owner)) {
      byOwner.set(account.owner, { owner: account.owner, contributions: 0, withdrawals: 0 });
    }
  }
  const ownerByAccountId = new Map(isaAccounts.map((account) => [account.id, account.owner]));
  for (const snapshot of state.snapshots) {
    const row = byOwner.get(ownerByAccountId.get(snapshot.accountId));
    if (!row) continue;
    if (snapshot.date < taxYear.start || snapshot.date > taxYear.end) continue;
    row.contributions += snapshot.contribution;
    row.withdrawals += snapshot.withdrawal;
  }
  return [...byOwner.values()]
    .sort((a, b) => (a.owner < b.owner ? -1 : a.owner > b.owner ? 1 : 0))
    .map((row) => {
      const net = row.contributions - row.withdrawals;
      return {
        ...row,
        net,
        allowance: taxYear.isaAllowance,
        remaining: taxYear.isaAllowance - net,
      };
    });
}

/** ISA summary for the tax year containing today. Null if no tax year covers today. */
export function currentIsaSummary(state) {
  const taxYear = currentTaxYear(state);
  return taxYear ? { taxYear, owners: isaSummary(state, taxYear) } : null;
}
