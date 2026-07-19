import React, { useEffect, useRef, useState } from "react";
import { defaultData } from "./lib/schema";
import { openFile, saveFile } from "./lib/file";
import BulkUpdateForm from "./entry/BulkUpdateForm";
import AccountList from "./entry/AccountList";
import FilePanel from "./data/FilePanel";

// Route entry for the /finance mini-app. Owns the single state object (the whole
// JSON document); all mutations go through pure functions in lib/actions.js via
// `run`. Persistence follows the file-editor model: the JSON file is the document,
// edits live in memory, Save downloads a copy. `dirty` tracks divergence from the
// last saved/opened document; Open/New are guarded behind a confirm dialog and a
// beforeunload handler warns when leaving with unsaved changes.

const TABS = ["Dashboard", "Update", "Accounts", "ISA", "File"];

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
  const [state, setState] = useState(() => defaultData());
  const [savedDoc, setSavedDoc] = useState(state); // last saved/opened document object
  const [tab, setTab] = useState("Dashboard");
  const [openError, setOpenError] = useState(null); // empty-state open failures
  const [pendingAction, setPendingAction] = useState(null); // guarded Open/New
  const fileInputRef = useRef(null);

  const dirty = state !== savedDoc; // actions always return a new object

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // All mutations flow through here: run(replaceAll, next), run(addSnapshots, entries)...
  const run = (action, payload) => setState((prev) => action(prev, payload));

  const applyDocument = (next) => {
    setState(next);
    setSavedDoc(next);
  };

  const handleSave = () => {
    saveFile(state);
    setSavedDoc(state);
  };

  // Open/New replace the document — confirm first when there are unsaved changes.
  const guardUnsaved = (action) => {
    if (dirty) setPendingAction(() => action);
    else action();
  };

  const handleNew = () => guardUnsaved(() => applyDocument(defaultData()));
  const handleOpen = (next) => guardUnsaved(() => applyDocument(next));

  // Empty-state open: validation errors are shown inline here rather than in FilePanel.
  const handleEmptyStateFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file
    if (!file) return;
    try {
      handleOpen(await openFile(file));
      setOpenError(null);
    } catch (e) {
      setOpenError(e.message);
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
          Personal investment tracking — your data lives in a JSON file you save yourself.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleEmptyStateFile}
        />

        <div className="flex items-center gap-2 mb-8 border-b border-gray-600">
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
          <span className="ml-auto flex items-center gap-3 pb-1">
            {dirty && (
              <span className="text-sm text-amber-400 font-bodyFont whitespace-nowrap">
                ● Unsaved changes
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-1 rounded-lg border border-gray-600 text-lightText text-sm font-titleFont hover:border-designColor hover:text-designColor transition-colors duration-300"
            >
              Save
            </button>
          </span>
        </div>

        {!hasAccounts && tab !== "Accounts" && tab !== "File" ? (
          <div className={`${cardClass} text-center`}>
            <h2 className="text-2xl font-titleFont font-bold text-designColor mb-4">
              No accounts yet
            </h2>
            <p className="text-lightText font-bodyFont mb-6">
              Open a saved document, or create your first account to start a new one.
            </p>
            {openError && (
              <pre className="text-red-400 font-bodyFont text-sm text-left whitespace-pre-wrap mb-6">
                {openError}
              </pre>
            )}
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg border border-designColor text-designColor font-titleFont hover:bg-designColor hover:text-bodyColor transition-colors duration-300"
                onClick={() => fileInputRef.current?.click()}
              >
                Open file…
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
            {tab === "File" && (
              <FilePanel
                state={state}
                dirty={dirty}
                onNew={handleNew}
                onOpen={handleOpen}
                onSave={handleSave}
              />
            )}
          </>
        )}

        {pendingAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
            <div className={`${cardClass} w-full max-w-md`} role="dialog" aria-modal="true">
              <h3 className="text-xl font-titleFont font-bold text-lightText mb-4">
                Unsaved changes
              </h3>
              <p className="text-lightText font-bodyFont mb-6">
                Your current document has unsaved changes that will be lost if you continue.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    handleSave();
                    pendingAction();
                    setPendingAction(null);
                  }}
                  className="px-6 py-2 rounded-lg bg-designColor text-bodyColor font-titleFont hover:opacity-80 transition-opacity duration-300"
                >
                  Save &amp; continue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    pendingAction();
                    setPendingAction(null);
                  }}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white font-titleFont hover:opacity-80 transition-opacity duration-300"
                >
                  Discard changes
                </button>
                <button
                  type="button"
                  onClick={() => setPendingAction(null)}
                  className="px-6 py-2 rounded-lg border border-gray-600 text-lightText font-titleFont hover:border-designColor hover:text-designColor transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FinanceDashboard;
