// File open/save for the finance dashboard. The JSON file IS the document:
// the app edits it in memory, and saving means downloading a fresh copy.
// Nothing is stored in the browser — closing the tab without saving loses work
// (the UI warns about unsaved changes; see FinanceDashboard).

import { validate, normalize } from "./schema";
import { todayString } from "./format";

/** Downloads the document as finance-YYYY-MM-DD.json. */
export function saveFile(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finance-${todayString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Reads and validates a document file chosen by the user.
 * Resolves to the normalized document; throws an Error with a readable message on failure.
 */
export async function openFile(file) {
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
