// Persistence for the finance dashboard: localStorage working copy + JSON file import/export.
// The JSON file is the portable backup/transfer format; localStorage just makes it seamless.

import { STORAGE_KEY, validate, normalize } from "./schema";

/**
 * Loads the working copy from localStorage.
 * Returns the normalized document, or null if absent/corrupt (caller then uses defaultData()).
 */
export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!validate(parsed).ok) {
      console.warn("Finance dashboard: ignoring invalid stored data");
      return null;
    }
    return normalize(parsed);
  } catch (e) {
    console.warn("Finance dashboard: failed to load stored data", e);
    return null;
  }
}

/** Saves the working copy to localStorage. Failures (e.g. quota) are non-fatal. */
export function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Finance dashboard: failed to save", e);
  }
}

/** Downloads the document as finance-backup-YYYY-MM-DD.json. */
export function exportFile(state) {
  const today = new Date();
  const stamp = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finance-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Reads and validates an imported file.
 * Resolves to the normalized document; throws an Error with a readable message on failure.
 */
export async function importFile(file) {
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const { ok, errors } = validate(parsed);
  if (!ok) {
    throw new Error(`Invalid finance data file:\n${errors.join("\n")}`);
  }
  return normalize(parsed);
}
