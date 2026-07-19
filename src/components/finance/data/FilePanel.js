import React, { useRef, useState } from "react";
import { openFile } from "../lib/file";

// File tab: the JSON file is the document. Save downloads a copy; Open loads one
// (validated first); New starts fresh. FinanceDashboard owns the dirty flag and
// guards Open/New behind an unsaved-changes confirm, so this panel stays dumb.

const cardClass = "bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-8";
const primaryButtonClass =
  "px-6 py-2 rounded-lg bg-designColor text-bodyColor font-titleFont hover:opacity-80 transition-opacity duration-300";
const outlineButtonClass =
  "px-6 py-2 rounded-lg border border-designColor text-designColor font-titleFont hover:bg-designColor hover:text-bodyColor transition-colors duration-300";

function FilePanel({ state, dirty, onNew, onOpen, onSave }) {
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file
    if (!file) return;
    try {
      onOpen(await openFile(file));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className={cardClass}>
        <h2 className="text-xl font-titleFont font-bold text-lightText mb-2">Save</h2>
        <p className="text-lightText font-bodyFont mb-4">
          Nothing is stored in the browser — download the document to keep your changes.
          {dirty && (
            <span className="text-amber-400"> You have unsaved changes.</span>
          )}
        </p>
        <button type="button" onClick={onSave} className={primaryButtonClass}>
          Save (download .json)
        </button>
      </div>

      <div className={cardClass}>
        <h2 className="text-xl font-titleFont font-bold text-lightText mb-2">Open</h2>
        <p className="text-lightText font-bodyFont mb-4">
          Load a previously saved document. This replaces the one you're editing — you'll
          be asked first if there are unsaved changes.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={outlineButtonClass}
        >
          Open file…
        </button>
        {error && (
          <pre className="text-red-400 font-bodyFont text-sm whitespace-pre-wrap mt-4">{error}</pre>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="text-xl font-titleFont font-bold text-lightText mb-2">New</h2>
        <p className="text-lightText font-bodyFont mb-4">
          Start a fresh empty document.
          {state.accounts.length > 0 &&
            ` The current one has ${state.accounts.length} account${
              state.accounts.length === 1 ? "" : "s"
            } and ${state.snapshots.length} snapshot${state.snapshots.length === 1 ? "" : "s"}.`}
        </p>
        <button type="button" onClick={onNew} className={outlineButtonClass}>
          New document
        </button>
      </div>
    </div>
  );
}

export default FilePanel;
