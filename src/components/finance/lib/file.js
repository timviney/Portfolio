// File open/save for the finance dashboard. The JSON file IS the document:
// the app edits it in memory, and saving means downloading a fresh copy.
// Nothing is stored in the browser — closing the tab without saving loses work
// (the UI warns about unsaved changes; see FinanceDashboard).

import { validate, normalize } from "./schema";
import { todayString } from "./format";

/**
 * Saves the document through the native Save As dialog (File System Access API),
 * so the user picks the name and location and can overwrite an existing file.
 * Falls back to a plain download where the API isn't available (e.g. Firefox).
 * Returns true if the file was written, false if the user cancelled the dialog.
 */
export async function saveFile(state) {
  const contents = JSON.stringify(state, null, 2);
  const suggestedName = `finance-${todayString()}.json`;

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: "Finance document (JSON)", accept: { "application/json": [".json"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(contents);
      await writable.close();
      return true;
    } catch (e) {
      if (e?.name === "AbortError") return false; // user cancelled the dialog
      throw e;
    }
  }

  // Fallback: plain download to the browser's download folder.
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName;
  a.click();
  URL.revokeObjectURL(url);
  return true;
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

/**
 * Fetches the bundled example document, validates it, and returns the normalized
 * document. Throws an Error with a readable message on failure.
 */
export async function openExample() {
  let parsed;
  try {
    const response = await fetch("/finance/example.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    parsed = await response.json();
  } catch (e) {
    throw new Error(`Could not load the example file: ${e.message}`);
  }
  const { ok, errors } = validate(parsed);
  if (!ok) {
    throw new Error(`Invalid example data:\n${errors.join("\n")}`);
  }
  return normalize(parsed);
}
