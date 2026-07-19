// Shape, defaults and validation for the finance dashboard's single JSON document.
// See .agents/finance-dashboard-planner.md for the data model and its semantics.

export const STORAGE_KEY = "finance-dashboard-data";
export const SCHEMA_VERSION = 1;

const DEFAULT_ACCOUNT_COLOUR = "#6b7280";
const DEFAULT_ACCOUNT_TYPES = ["Savings Account", "Cash ISA", "Stocks & Shares ISA", "GIA", "Premium Bonds", "Other"];
const DEFAULT_ISA_TYPES = ["Cash ISA", "Stocks & Shares ISA"];
const DEFAULT_SAVINGS_TYPES = ["Savings Account", "Cash ISA", "Premium Bonds"];
const DEFAULT_TAXABLE_TYPES = ["Savings Account", "GIA"]; // ISAs and Premium Bonds are tax-free
const DEFAULT_ISA_ALLOWANCE = 20000;

// UK tax years run 6 April -> 5 April.
function currentTaxYear(today = new Date()) {
  const year = today.getFullYear();
  const startYear = today < new Date(year, 3, 6) ? year - 1 : year;
  return {
    name: `${startYear}/${String(startYear + 1).slice(-2)}`,
    start: `${startYear}-04-06`,
    end: `${startYear + 1}-04-05`,
    isaAllowance: DEFAULT_ISA_ALLOWANCE,
  };
}

/** Fresh empty document with sensible defaults for a first run. */
export function defaultData() {
  return {
    version: SCHEMA_VERSION,
    config: {
      owners: ["User"],
      accountTypes: [...DEFAULT_ACCOUNT_TYPES],
      isaTypes: [...DEFAULT_ISA_TYPES],
      savingsTypes: [...DEFAULT_SAVINGS_TYPES],
      taxableTypes: [...DEFAULT_TAXABLE_TYPES],
      taxYears: [currentTaxYear()],
    },
    accounts: [],
    snapshots: [],
  };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Accepts only real calendar dates in YYYY-MM-DD. Constructs the Date from
// parts (local time) rather than parsing the string, avoiding UTC-shift bugs.
function isValidDateString(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

const MAX_ERRORS = 10; // keeps import failures readable

/**
 * Structural validation of a parsed document.
 * Returns { ok, errors } with human-readable messages.
 * Unknown owner/type strings are allowed (they're configurable);
 * orphaned snapshots (unknown accountId) are rejected.
 */
export function validate(data) {
  const errors = [];
  const err = (msg) => errors.push(msg);

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, errors: ["Top level must be a JSON object"] };
  }
  if (data.version !== SCHEMA_VERSION) err(`version must be ${SCHEMA_VERSION}`);

  const config = data.config;
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    err("config must be an object");
  } else {
    for (const key of ["owners", "accountTypes", "isaTypes", "savingsTypes", "taxableTypes"]) {
      if (!Array.isArray(config[key]) || config[key].some((item) => typeof item !== "string")) {
        err(`config.${key} must be an array of strings`);
      }
    }
    if (!Array.isArray(config.taxYears)) {
      err("config.taxYears must be an array");
    } else {
      config.taxYears.forEach((taxYear, i) => {
        const where = `config.taxYears[${i}]`;
        if (!taxYear || typeof taxYear !== "object") return err(`${where} must be an object`);
        if (typeof taxYear.name !== "string" || !taxYear.name) err(`${where}.name is required`);
        if (!isValidDateString(taxYear.start)) err(`${where}.start must be a YYYY-MM-DD date`);
        if (!isValidDateString(taxYear.end)) err(`${where}.end must be a YYYY-MM-DD date`);
        if (isValidDateString(taxYear.start) && isValidDateString(taxYear.end) && taxYear.start >= taxYear.end) {
          err(`${where}.start must be before end`);
        }
        if (!isNonNegativeNumber(taxYear.isaAllowance)) err(`${where}.isaAllowance must be a number >= 0`);
      });
    }
  }

  const accountIds = new Set();
  const accountsIsArray = Array.isArray(data.accounts);
  if (!accountsIsArray) {
    err("accounts must be an array");
  } else {
    data.accounts.forEach((account, i) => {
      const where = `accounts[${i}]`;
      if (!account || typeof account !== "object") return err(`${where} must be an object`);
      if (typeof account.id !== "string" || !account.id) {
        err(`${where}.id is required`);
      } else if (accountIds.has(account.id)) {
        err(`${where}.id "${account.id}" is duplicated`);
      } else {
        accountIds.add(account.id);
      }
      for (const key of ["name", "owner", "type"]) {
        if (typeof account[key] !== "string" || !account[key]) err(`${where}.${key} is required`);
      }
      for (const key of ["provider", "colour", "currency", "notes"]) {
        if (account[key] !== undefined && typeof account[key] !== "string") err(`${where}.${key} must be a string`);
      }
      if (account.archived !== undefined && typeof account.archived !== "boolean") {
        err(`${where}.archived must be a boolean`);
      }
    });
  }

  if (!Array.isArray(data.snapshots)) {
    err("snapshots must be an array");
  } else {
    data.snapshots.forEach((snapshot, i) => {
      const where = `snapshots[${i}]`;
      if (!snapshot || typeof snapshot !== "object") return err(`${where} must be an object`);
      if (typeof snapshot.accountId !== "string" || !snapshot.accountId) {
        err(`${where}.accountId is required`);
      } else if (accountsIsArray && !accountIds.has(snapshot.accountId)) {
        err(`${where} references unknown account "${snapshot.accountId}"`);
      }
      if (!isValidDateString(snapshot.date)) err(`${where}.date must be a YYYY-MM-DD date`);
      if (!isNonNegativeNumber(snapshot.balance)) err(`${where}.balance must be a number >= 0`);
      for (const key of ["contribution", "withdrawal"]) {
        if (snapshot[key] !== undefined && !isNonNegativeNumber(snapshot[key])) {
          err(`${where}.${key} must be a number >= 0`);
        }
      }
      if (snapshot.notes !== undefined && typeof snapshot.notes !== "string") err(`${where}.notes must be a string`);
    });
  }

  const shown = errors.slice(0, MAX_ERRORS);
  if (errors.length > MAX_ERRORS) shown.push(`...and ${errors.length - MAX_ERRORS} more`);
  return { ok: errors.length === 0, errors: shown };
}

/**
 * Fills defaults and sorts snapshots by date. The sort is stable, so same-date
 * snapshots keep their entry order and the later entry wins. Assumes valid input.
 */
export function normalize(data) {
  const config = data.config || {};
  return {
    version: SCHEMA_VERSION,
    config: {
      owners: config.owners ?? [],
      accountTypes: config.accountTypes ?? [...DEFAULT_ACCOUNT_TYPES],
      isaTypes: config.isaTypes ?? [...DEFAULT_ISA_TYPES],
      savingsTypes: config.savingsTypes ?? [...DEFAULT_SAVINGS_TYPES],
      taxableTypes: config.taxableTypes ?? [...DEFAULT_TAXABLE_TYPES],
      taxYears: (config.taxYears ?? []).map((taxYear) => ({
        name: taxYear.name,
        start: taxYear.start,
        end: taxYear.end,
        isaAllowance: taxYear.isaAllowance,
      })),
    },
    accounts: (data.accounts ?? []).map((account) => ({
      id: account.id,
      name: account.name,
      provider: account.provider ?? "",
      owner: account.owner,
      type: account.type,
      colour: account.colour ?? DEFAULT_ACCOUNT_COLOUR,
      currency: account.currency ?? "GBP",
      archived: account.archived ?? false,
      notes: account.notes ?? "",
    })),
    snapshots: (data.snapshots ?? [])
      .map((snapshot) => ({
        id: snapshot.id ?? crypto.randomUUID(),
        accountId: snapshot.accountId,
        date: snapshot.date,
        balance: snapshot.balance,
        contribution: snapshot.contribution ?? 0,
        withdrawal: snapshot.withdrawal ?? 0,
        notes: snapshot.notes ?? "",
      }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
  };
}
