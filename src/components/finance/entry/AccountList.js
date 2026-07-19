import React, { useMemo, useState } from "react";
import {
  createAccount,
  updateAccount,
  setArchived,
  updateSnapshot,
  deleteSnapshot,
} from "../lib/actions";
import { accountHistory, latestByAccount } from "../lib/model";
import { gbp, formatDate, parseMoney, colourFor } from "../lib/format";
import AccountForm from "./AccountForm";

// Accounts tab: all accounts (archived dimmed but kept for their history). Expanding a
// row shows details, the edit form, the archive toggle and the snapshot history with
// low-prominence edit/delete — typo-fixing only; the normal workflow adds snapshots.

const cardClass = "bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne";
const cellInputClass =
  "h-8 w-full min-w-[6rem] rounded-lg border-b-[1px] border-b-gray-600 bg-[#191b1e] text-lightText px-2 text-sm outline-none focus-visible:outline-designColor focus-visible:border-b-transparent duration-300";
const smallButtonClass =
  "px-4 py-1 rounded-lg border border-gray-600 text-lightText text-sm font-titleFont hover:border-designColor hover:text-designColor transition-colors duration-300";

function SnapshotHistory({ snapshots, run }) {
  const [editing, setEditing] = useState(null); // { id, date, balance, contribution, withdrawal, notes }
  const [error, setError] = useState(null);

  if (snapshots.length === 0) {
    return (
      <p className="text-sm text-gray-400 font-bodyFont">
        No snapshots yet — add one from the Update tab.
      </p>
    );
  }

  const startEdit = (snapshot) => {
    setEditing({
      id: snapshot.id,
      date: snapshot.date,
      balance: String(snapshot.balance),
      contribution: String(snapshot.contribution),
      withdrawal: String(snapshot.withdrawal),
      notes: snapshot.notes,
    });
    setError(null);
  };

  const patch = (key) => (event) =>
    setEditing((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSave = () => {
    const balance = parseMoney(editing.balance);
    const contribution = parseMoney(editing.contribution);
    const withdrawal = parseMoney(editing.withdrawal);
    if (
      !editing.date ||
      [balance, contribution, withdrawal].some((value) => value === null || Number.isNaN(value))
    ) {
      setError("A date is required and all amounts must be numbers ≥ 0.");
      return;
    }
    run(updateSnapshot, {
      id: editing.id,
      date: editing.date,
      balance,
      contribution,
      withdrawal,
      notes: editing.notes.trim(),
    });
    setEditing(null);
    setError(null);
  };

  const handleDelete = (snapshot) => {
    if (window.confirm(`Delete the ${formatDate(snapshot.date)} snapshot of ${gbp(snapshot.balance)}?`)) {
      run(deleteSnapshot, snapshot.id);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-bodyFont text-lightText">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-600">
            <th className="py-2 pr-4 font-normal">Date</th>
            <th className="py-2 pr-4 font-normal text-right">Balance</th>
            <th className="py-2 pr-4 font-normal text-right">In</th>
            <th className="py-2 pr-4 font-normal text-right">Out</th>
            <th className="py-2 pr-4 font-normal">Notes</th>
            <th className="py-2 font-normal text-right">Fix typos</th>
          </tr>
        </thead>
        <tbody>
          {snapshots.map((snapshot) =>
            editing?.id === snapshot.id ? (
              <tr key={snapshot.id} className="border-b border-gray-700">
                <td className="py-2 pr-2">
                  <input type="date" className={cellInputClass} value={editing.date} onChange={patch("date")} />
                </td>
                <td className="py-2 pr-2">
                  <input className={`${cellInputClass} text-right`} inputMode="decimal" value={editing.balance} onChange={patch("balance")} />
                </td>
                <td className="py-2 pr-2">
                  <input className={`${cellInputClass} text-right`} inputMode="decimal" value={editing.contribution} onChange={patch("contribution")} />
                </td>
                <td className="py-2 pr-2">
                  <input className={`${cellInputClass} text-right`} inputMode="decimal" value={editing.withdrawal} onChange={patch("withdrawal")} />
                </td>
                <td className="py-2 pr-2">
                  <input className={cellInputClass} value={editing.notes} onChange={patch("notes")} />
                </td>
                <td className="py-2 text-right whitespace-nowrap">
                  <button type="button" onClick={handleSave} className="text-designColor hover:underline mr-3">
                    Save
                  </button>
                  <button type="button" onClick={() => { setEditing(null); setError(null); }} className="text-gray-400 hover:underline">
                    Cancel
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={snapshot.id} className="border-b border-gray-700">
                <td className="py-2 pr-4 whitespace-nowrap">{formatDate(snapshot.date)}</td>
                <td className="py-2 pr-4 text-right whitespace-nowrap">{gbp(snapshot.balance)}</td>
                <td className="py-2 pr-4 text-right whitespace-nowrap">
                  {snapshot.contribution ? gbp(snapshot.contribution) : "—"}
                </td>
                <td className="py-2 pr-4 text-right whitespace-nowrap">
                  {snapshot.withdrawal ? gbp(snapshot.withdrawal) : "—"}
                </td>
                <td className="py-2 pr-4 text-gray-400">{snapshot.notes}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  <button type="button" onClick={() => startEdit(snapshot)} className="text-gray-400 hover:text-designColor mr-3">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(snapshot)} className="text-gray-400 hover:text-red-400">
                    Delete
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      {error && <p className="text-red-400 text-sm font-bodyFont mt-2">{error}</p>}
    </div>
  );
}

function AccountList({ state, run }) {
  const latest = useMemo(() => latestByAccount(state), [state]);
  const [adding, setAdding] = useState(() => state.accounts.length === 0);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const archivedCount = state.accounts.filter((account) => account.archived).length;

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-400 font-bodyFont">
          {state.accounts.length === 0
            ? "No accounts yet."
            : `${state.accounts.length - archivedCount} active${
                archivedCount ? ` · ${archivedCount} archived` : ""
              }`}
        </p>
        <button
          type="button"
          onClick={() => {
            setAdding((prev) => !prev);
            setEditingId(null);
          }}
          className="px-4 py-2 rounded-lg bg-designColor text-bodyColor font-titleFont hover:opacity-80 transition-opacity duration-300"
        >
          {adding ? "Close" : "+ Add account"}
        </button>
      </div>

      {adding && (
        <AccountForm
          config={state.config}
          defaultColour={colourFor(state.accounts.length)}
          onSubmit={(fields) => {
            run(createAccount, fields);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {state.accounts.map((account) => {
        const last = latest.get(account.id);
        const expanded = expandedId === account.id;
        return (
          <div key={account.id} className={`${cardClass} ${account.archived ? "opacity-60" : ""}`}>
            <button
              type="button"
              onClick={() => toggleExpanded(account.id)}
              aria-expanded={expanded}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: account.colour }}
              />
              <span className="flex-1 min-w-0">
                <span className="block font-titleFont text-lightText truncate">
                  {account.name}
                  {account.archived && (
                    <span className="ml-2 text-xs text-gray-400 border border-gray-600 rounded px-1">
                      Archived
                    </span>
                  )}
                </span>
                <span className="block text-xs text-gray-400 font-bodyFont truncate">
                  {[account.type, account.owner, account.provider].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="text-right font-bodyFont text-lightText whitespace-nowrap">
                {last ? (
                  <>
                    {gbp(last.balance)}{" "}
                    <span className="text-xs text-gray-400">{formatDate(last.date)}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">No snapshots</span>
                )}
              </span>
              <span className="text-gray-400 shrink-0">{expanded ? "▾" : "▸"}</span>
            </button>

            {expanded && (
              <div className="px-4 pb-4 pt-4 border-t border-gray-700 flex flex-col gap-4">
                <div className="text-sm text-gray-300 font-bodyFont flex flex-wrap gap-x-6 gap-y-1">
                  <span>Currency: {account.currency} (display only)</span>
                  {account.notes && <span className="w-full">Notes: {account.notes}</span>}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingId(editingId === account.id ? null : account.id)}
                    className={smallButtonClass}
                  >
                    {editingId === account.id ? "Close editor" : "Edit details"}
                  </button>
                  <button
                    type="button"
                    onClick={() => run(setArchived, { id: account.id, archived: !account.archived })}
                    className={smallButtonClass}
                  >
                    {account.archived ? "Un-archive" : "Archive"}
                  </button>
                </div>
                {editingId === account.id && (
                  <AccountForm
                    initial={account}
                    config={state.config}
                    onSubmit={(fields) => {
                      run(updateAccount, { id: account.id, ...fields });
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                )}
                <div>
                  <h4 className="text-sm font-titleFont text-lightText mb-2">Snapshot history</h4>
                  <SnapshotHistory
                    snapshots={accountHistory(state, account.id).reverse()}
                    run={run}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AccountList;
