import React, { useEffect, useRef, useState } from "react";
import { defaultData } from "./lib/schema";
import { load, save, importFile } from "./lib/storage";
import { replaceAll } from "./lib/actions";
import BulkUpdateForm from "./entry/BulkUpdateForm";
import AccountList from "./entry/AccountList";
import ImportExport from "./data/ImportExport";

// Route entry for the /finance mini-app. Owns the single state object (the whole
// JSON document); all mutations go through pure functions in lib/actions.js via
// `run`. Tab contents are filled in by later steps (see the planner doc).

const TABS = ["Dashboard", "Update", "Accounts", "ISA", "Data"];

const cardClass =
  "bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-8";

function Placeholder({ children }) {
  return (
    <div className={cardClass}>
      <p className="text-lightText font-bodyFont">{children}</p>
    </div>
  );
}

function FinanceDashboard() {
  const [state, setState] = useState(() => load() ?? defaultData());
  const [tab, setTab] = useState("Dashboard");
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  // Write-through persistence: the data is tiny, so save on every change.
  useEffect(() => {
    save(state);
  }, [state]);

  // All mutations flow through here: run(replaceAll, next), run(addSnapshots, entries)...
  const run = (action, payload) => setState((prev) => action(prev, payload));

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file
    if (!file) return;
    try {
      const next = await importFile(file);
      run(replaceAll, next);
      setImportError(null);
    } catch (e) {
      setImportError(e.message);
    }
  };

  const hasAccounts = state.accounts.length > 0;

  return (
    <section className="w-full min-h-screen bg-bodyColor py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-titleFont font-bold text-lightText mb-2">
          Finance <span className="text-designColor">Dashboard</span>
        </h1>
        <p className="text-lightText font-bodyFont mb-8">
          Personal investment tracking — stored locally in your browser.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />

        <div className="flex gap-2 mb-8 border-b border-gray-600">
          {TABS.map((name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`px-4 py-2 font-titleFont rounded-t-lg transition-colors duration-300 ${
                tab === name
                  ? "text-designColor border-b-2 border-designColor"
                  : "text-lightText hover:text-designColor"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {!hasAccounts && tab !== "Accounts" ? (
          <div className={`${cardClass} text-center`}>
            <h2 className="text-2xl font-titleFont font-bold text-designColor mb-4">
              No accounts yet
            </h2>
            <p className="text-lightText font-bodyFont mb-6">
              Import an existing backup, or create your first account to get started.
            </p>
            {importError && (
              <pre className="text-red-400 font-bodyFont text-sm text-left whitespace-pre-wrap mb-6">
                {importError}
              </pre>
            )}
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg border border-designColor text-designColor font-titleFont hover:bg-designColor hover:text-bodyColor transition-colors duration-300"
                onClick={() => fileInputRef.current?.click()}
              >
                Import JSON
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-designColor text-bodyColor font-titleFont hover:opacity-80 transition-opacity duration-300"
                onClick={() => setTab("Accounts")}
              >
                Create your first account
              </button>
            </div>
          </div>
        ) : (
          <>
            {tab === "Dashboard" && (
              <Placeholder>Dashboard — summary cards, charts and stats arrive in steps 11–13.</Placeholder>
            )}
            {tab === "Update" && <BulkUpdateForm state={state} run={run} />}
            {tab === "Accounts" && <AccountList state={state} run={run} />}
            {tab === "ISA" && (
              <Placeholder>ISA allowance tracking arrives in step 14.</Placeholder>
            )}
            {tab === "Data" && <ImportExport state={state} run={run} />}
          </>
        )}
      </div>
    </section>
  );
}

export default FinanceDashboard;
