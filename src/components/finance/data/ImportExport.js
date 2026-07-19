import React, { useRef, useState } from "react";
import { exportFile, importFile } from "../lib/storage";
import { replaceAll } from "../lib/actions";
import { formatDate } from "../lib/format";

// Data tab: export the whole document as a JSON backup, and import one back.
// Import never applies immediately — after validation a confirm dialog summarises
// the file so replacing the current data is always a deliberate choice.

const cardClass = "bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-8";

function summarise(next) {
  const dates = next.snapshots.map((s) => s.date).sort();
  return {
    accounts: next.accounts.length,
    snapshots: next.snapshots.length,
    range: dates.length ? `${formatDate(dates[0])} → ${formatDate(dates[dates.length - 1])}` : null,
  };
}

function ImportExport({ state, run }) {
  const [pending, setPending] = useState(null); // validated document awaiting confirmation
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setNotice(null);
    try {
      setPending(await importFile(file));
      setError(null);
    } catch (e) {
      setPending(null);
      setError(e.message);
    }
  };

  const handleConfirm = () => {
    run(replaceAll, pending);
    setPending(null);
    setNotice("Backup imported — all previous data was replaced.");
  };

  const summary = pending ? summarise(pending) : null;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className={cardClass}>
        <h2 className="text-xl font-titleFont font-bold text-lightText mb-2">Export</h2>
        <p className="text-lightText font-bodyFont mb-4">
          Download the full document (accounts, snapshots and settings) as a JSON backup.
        </p>
        <button
          type="button"
          onClick={() => exportFile(state)}
          className="px-6 py-2 rounded-lg bg-designColor text-bodyColor font-titleFont hover:opacity-80 transition-opacity duration-300"
        >
          Download backup
        </button>
      </div>

      <div className={cardClass}>
        <h2 className="text-xl font-titleFont font-bold text-lightText mb-2">Import</h2>
        <p className="text-lightText font-bodyFont mb-4">
          Restore from a backup file. This <strong>replaces all current data</strong> — you'll
          be asked to confirm before anything changes.
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
          className="px-6 py-2 rounded-lg border border-designColor text-designColor font-titleFont hover:bg-designColor hover:text-bodyColor transition-colors duration-300"
        >
          Choose file…
        </button>
        {error && (
          <pre className="text-red-400 font-bodyFont text-sm whitespace-pre-wrap mt-4">{error}</pre>
        )}
        {notice && <p className="text-designColor font-bodyFont text-sm mt-4">{notice}</p>}
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
          <div className={`${cardClass} w-full max-w-md`} role="dialog" aria-modal="true">
            <h3 className="text-xl font-titleFont font-bold text-lightText mb-4">
              Replace all data?
            </h3>
            <p className="text-lightText font-bodyFont mb-2">The file contains:</p>
            <ul className="text-lightText font-bodyFont text-sm list-disc list-inside mb-4">
              <li>
                {summary.accounts} account{summary.accounts === 1 ? "" : "s"}
              </li>
              <li>
                {summary.snapshots} snapshot{summary.snapshots === 1 ? "" : "s"}
                {summary.range ? ` (${summary.range})` : ""}
              </li>
            </ul>
            <p className="text-red-400 font-bodyFont text-sm mb-6">
              Your current {state.accounts.length} account{state.accounts.length === 1 ? "" : "s"}{" "}
              and {state.snapshots.length} snapshot{state.snapshots.length === 1 ? "" : "s"} will be
              permanently replaced. Export a backup first if you're not sure.
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleConfirm}
                autoFocus
                className="px-6 py-2 rounded-lg bg-red-500 text-white font-titleFont hover:opacity-80 transition-opacity duration-300"
              >
                Replace everything
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="px-6 py-2 rounded-lg border border-gray-600 text-lightText font-titleFont hover:border-designColor hover:text-designColor transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportExport;
