import React, { useEffect, useRef, useState } from "react";
import { defaultData } from "./lib/schema";
import { openFile, saveFile } from "./lib/file";
import BulkUpdateForm from "./entry/BulkUpdateForm";
import AccountList from "./entry/AccountList";
import FilePanel from "./data/FilePanel";
import SummaryCards from "./dashboard/SummaryCards";
import DateRangePicker from "./dashboard/DateRangePicker";
import PortfolioValueChart from "./dashboard/PortfolioValueChart";
import AccountBalancesChart from "./dashboard/AccountBalancesChart";
import AccountTypeChart from "./dashboard/AccountTypeChart";
import TwrChart from "./dashboard/TwrChart";
import AccountTwrChart from "./dashboard/AccountTwrChart";
import ProviderTwrChart from "./dashboard/ProviderTwrChart";
import AllocationChart from "./dashboard/AllocationChart";
import StatsPanel from "./dashboard/StatsPanel";
import IsaPanel from "./dashboard/IsaPanel";
import { todayString, yearAgoString } from "./lib/format";

// Route entry for the /finance mini-app. Owns the single state object (the whole
// JSON document); all mutations go through pure functions in lib/actions.js via
// `run`. Persistence follows the file-editor model: the JSON file is the document,
// edits live in memory, Save downloads a copy. There is no implicit empty document —
// `state` starts null and a start screen makes the user Open a file or create a New
// one before any tabs appear. `dirty` tracks divergence from the last saved/opened
// document; Open/New are guarded behind a confirm dialog and a beforeunload handler
// warns when leaving with unsaved changes.

const TABS = ["Dashboard", "Update", "Accounts", "ISA", "File"];

const cardClass =
  "bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-8";

function FinanceDashboard() {
  const [state, setState] = useState(null); // null = no document open (start screen)
  const [savedDoc, setSavedDoc] = useState(null); // last saved/opened document object
  const [tab, setTab] = useState("Dashboard");
  const [range, setRange] = useState(() => ({ start: yearAgoString(), end: todayString() }));
  const [openError, setOpenError] = useState(null); // start/empty-screen open failures
  const [pendingAction, setPendingAction] = useState(null); // guarded Open/New
  const fileInputRef = useRef(null);

  const dirty = state !== null && state !== savedDoc; // actions always return a new object

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

  // All mutations flow through here: run(addSnapshots, entries), run(createAccount, fields)...
  const run = (action, payload) => setState((prev) => action(prev, payload));

  const applyDocument = (next) => {
    setState(next);
    setSavedDoc(next);
  };

  // Returns true if the file was written; false if the user cancelled the dialog.
  const handleSave = async () => {
    const saved = await saveFile(state);
    if (saved) setSavedDoc(state); // only mark clean once it's actually on disk
    return saved;
  };

  // Open/New replace the document — confirm first when there are unsaved changes.
  const guardUnsaved = (action) => {
    if (dirty) setPendingAction(() => action);
    else action();
  };

  const handleNew = () => guardUnsaved(() => applyDocument(defaultData()));
  const handleOpen = (next) => guardUnsaved(() => applyDocument(next));

  // Shared by the start screen and the no-accounts empty state.
  const handleOpenFile = async (event) => {
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

  const filePicker = (
    <input
      ref={fileInputRef}
      type="file"
      accept="application/json,.json"
      className="hidden"
      onChange={handleOpenFile}
    />
  );

  // Start screen: no document is open yet — the user must pick Open or New.
  if (state === null) {
    return (
      <section className="w-full min-h-screen bg-bodyColor py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-titleFont font-bold text-lightText mb-2">
            Finance <span className="text-designColor">Dashboard</span>
          </h1>
          <p className="text-lightText font-bodyFont mb-8">
            Personal investment tracking — your data lives in a JSON file you save yourself.
          </p>
          {filePicker}
          <div className={`${cardClass} text-center`}>
            <h2 className="text-2xl font-titleFont font-bold text-designColor mb-4">
              Open a document to begin
            </h2>
            <p className="text-lightText font-bodyFont mb-6">
              Nothing is stored in the browser. Open a file you saved earlier, or start a
              new document.
            </p>
            {openError && (
              <pre className="text-red-400 font-bodyFont text-sm text-left whitespace-pre-wrap mb-6">
                {openError}
              </pre>
            )}
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg bg-designColor text-bodyColor font-titleFont hover:opacity-80 transition-opacity duration-300"
                onClick={() => fileInputRef.current?.click()}
              >
                Open file…
              </button>
              <button
                className="px-6 py-2 rounded-lg border border-designColor text-designColor font-titleFont hover:bg-designColor hover:text-bodyColor transition-colors duration-300"
                onClick={handleNew}
              >
                New document
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

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

        {filePicker}

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
              <div className="flex flex-col gap-4">
                <DateRangePicker range={range} onChange={setRange} />
                <SummaryCards state={state} asOf={range.end} />
                <PortfolioValueChart state={state} range={range} />
                <AccountBalancesChart state={state} range={range} />
                <AccountTypeChart state={state} range={range} />
                <TwrChart state={state} range={range} />
                <AccountTwrChart state={state} range={range} />
                <ProviderTwrChart state={state} range={range} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AllocationChart state={state} groupBy="account" title="Allocation by account" asOf={range.end} />
                  <AllocationChart state={state} groupBy="type" title="Allocation by type" asOf={range.end} />
                  <AllocationChart state={state} groupBy="provider" title="Allocation by provider" asOf={range.end} />
                  <AllocationChart state={state} groupBy="owner" title="Allocation by owner" asOf={range.end} />
                </div>
                <StatsPanel state={state} range={range} />
              </div>
            )}
            {tab === "Update" && <BulkUpdateForm state={state} run={run} />}
            {tab === "Accounts" && <AccountList state={state} run={run} />}
            {tab === "ISA" && <IsaPanel state={state} run={run} />}
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
                  onClick={async () => {
                    // Cancelling the save dialog aborts the whole action.
                    if (await handleSave()) {
                      pendingAction();
                      setPendingAction(null);
                    }
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
