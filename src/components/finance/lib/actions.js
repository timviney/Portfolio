// Pure state transitions for the finance dashboard.
// Every function takes the current document and returns a NEW document.
// The UI never mutates state directly: setState(prev => someAction(prev, payload)).
// Money is coerced to a number and rounded to 2dp on write.

import { colourFor } from "./format";

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const money = (value) => round2(Number(value) || 0);

// Adds a string to a config list if it isn't already there.
function extendList(list, value) {
  return value && !list.includes(value) ? [...list, value] : list;
}

// Keeps config.owners/accountTypes in sync with the strings an account uses.
function configFromAccount(config, account) {
  return {
    ...config,
    owners: extendList(config.owners, account.owner),
    accountTypes: extendList(config.accountTypes, account.type),
  };
}

/** Adds an account. fields: name, provider, owner, type, colour?, currency?, notes? */
export function createAccount(state, fields) {
  const account = {
    id: crypto.randomUUID(),
    name: (fields.name || "").trim(),
    provider: (fields.provider || "").trim(),
    owner: (fields.owner || "").trim(),
    type: fields.type || "",
    colour: fields.colour || colourFor(state.accounts.length),
    currency: fields.currency || "GBP",
    archived: false,
    notes: fields.notes || "",
  };
  return {
    ...state,
    config: configFromAccount(state.config, account),
    accounts: [...state.accounts, account],
  };
}

/** Edits an account's details by id. */
export function updateAccount(state, { id, ...changes }) {
  const accounts = state.accounts.map((account) =>
    account.id === id ? { ...account, ...changes, id } : account
  );
  const updated = accounts.find((account) => account.id === id);
  return {
    ...state,
    config: updated ? configFromAccount(state.config, updated) : state.config,
    accounts,
  };
}

/** Archives or un-archives an account. Archived accounts keep their history. */
export function setArchived(state, { id, archived }) {
  return {
    ...state,
    accounts: state.accounts.map((account) =>
      account.id === id ? { ...account, archived } : account
    ),
  };
}

/**
 * Bulk-adds snapshots. Each entry: { accountId, date, balance, contribution?, withdrawal?, notes? }.
 * Appended (never edited in place) so same-date corrections later in the array win.
 */
export function addSnapshots(state, entries) {
  const snapshots = entries.map((entry) => ({
    id: crypto.randomUUID(),
    accountId: entry.accountId,
    date: entry.date,
    balance: money(entry.balance),
    contribution: money(entry.contribution),
    withdrawal: money(entry.withdrawal),
    notes: entry.notes || "",
  }));
  return { ...state, snapshots: [...state.snapshots, ...snapshots] };
}

/** Typo-fixing edit of a single snapshot by id. */
export function updateSnapshot(state, { id, ...changes }) {
  return {
    ...state,
    snapshots: state.snapshots.map((snapshot) => {
      if (snapshot.id !== id) return snapshot;
      const next = { ...snapshot, ...changes, id };
      next.balance = money(next.balance);
      next.contribution = money(next.contribution);
      next.withdrawal = money(next.withdrawal);
      return next;
    }),
  };
}

/** Deletes a single snapshot by id (typo-fixing only — normal workflow never edits history). */
export function deleteSnapshot(state, id) {
  return { ...state, snapshots: state.snapshots.filter((snapshot) => snapshot.id !== id) };
}

/** Replaces the configurable tax years (consumed only by the ISA panel). */
export function updateTaxYears(state, taxYears) {
  return {
    ...state,
    config: {
      ...state.config,
      taxYears: taxYears.map((taxYear) => ({
        name: taxYear.name,
        start: taxYear.start,
        end: taxYear.end,
        isaAllowance: money(taxYear.isaAllowance),
      })),
    },
  };
}

/** Replaces the whole document (import). Input must already be validated + normalized. */
export function replaceAll(state, next) {
  return next;
}
