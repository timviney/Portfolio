import React, { useMemo, useState } from "react";
import { addSnapshots } from "../lib/actions";
import { activeAccounts, latestByAccount } from "../lib/model";
import { gbp, formatDate, todayString, parseMoney, accountLabel } from "../lib/format";

// The key data-entry screen: one row per active account, many snapshots per save.
// A row's non-empty balance field IS the selection (no checkboxes). Keyboard flow:
// Tab walks straight down the balance column (the per-row details toggle is skipped);
// Enter saves. Rows with invalid amounts block the save and are named in the error.

const inputClass =
  "h-10 rounded-lg border-b-[1px] border-b-gray-600 bg-[#191b1e] text-lightText px-3 outline-none focus-visible:outline-designColor focus-visible:border-b-transparent duration-300";

const EMPTY_DRAFT = { balance: "", contribution: "", withdrawal: "", notes: "", open: false };

function BulkUpdateForm({ state, run }) {
  const accounts = useMemo(() => activeAccounts(state), [state]);
  const latest = useMemo(() => latestByAccount(state), [state]);
  const [date, setDate] = useState(todayString());
  const [drafts, setDrafts] = useState({}); // accountId -> { balance, contribution, withdrawal, notes, open }
  const [message, setMessage] = useState(null); // { kind: "ok" | "error", text }

  const draftFor = (id) => drafts[id] ?? EMPTY_DRAFT;

  const patchDraft = (id, changes) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...EMPTY_DRAFT, ...prev[id], ...changes } }));
    setMessage(null);
  };

  const handleSave = (event) => {
    event.preventDefault();
    const entries = [];
    const invalid = [];
    for (const account of accounts) {
      const draft = draftFor(account.id);
      const balance = parseMoney(draft.balance);
      const contribution = parseMoney(draft.contribution);
      const withdrawal = parseMoney(draft.withdrawal);
      if (balance === null && contribution === null && withdrawal === null && !draft.notes.trim()) continue;
      if (Number.isNaN(balance) || Number.isNaN(contribution) || Number.isNaN(withdrawal)) {
        invalid.push(accountLabel(account));
      } else if (balance === null) {
        invalid.push(`${account.name} (a balance is needed to record flows/notes)`);
      } else {
        entries.push({
          accountId: account.id,
          date,
          balance,
          contribution: contribution ?? 0,
          withdrawal: withdrawal ?? 0,
          notes: draft.notes.trim(),
        });
      }
    }
    if (invalid.length > 0) {
      setMessage({ kind: "error", text: `Nothing saved. Check ${invalid.join(", ")} — amounts must be numbers ≥ 0.` });
      return;
    }
    if (entries.length === 0) {
      setMessage({ kind: "error", text: "No balances entered — type a new balance into at least one row." });
      return;
    }
    run(addSnapshots, entries);
    setDrafts({});
    setMessage({
      kind: "ok",
      text: `Saved ${entries.length} snapshot${entries.length === 1 ? "" : "s"} for ${formatDate(date)}.`,
    });
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-8">
        <p className="text-lightText font-bodyFont">
          No active accounts to update — create or un-archive one in the Accounts tab.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-6 sml:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <label htmlFor="bulk-date" className="block text-sm font-titleFont text-lightText mb-2">
            Snapshot date
          </label>
          <input
            id="bulk-date"
            type="date"
            required
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setMessage(null);
            }}
            className={`${inputClass} w-44`}
          />
        </div>
        <p className="text-sm text-gray-400 font-bodyFont max-w-md">
          Type a new balance for each account you want to update — empty rows are skipped. Tab moves
          straight down the balance column; Enter saves.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-gray-700">
        {accounts.map((account, index) => {
          const last = latest.get(account.id);
          const draft = draftFor(account.id);
          return (
            <div key={account.id} className="py-3">
              <div className="flex flex-col sml:flex-row sml:items-center gap-2 sml:gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: account.colour }}
                  />
                  <div className="min-w-0">
                    <p className="font-titleFont text-lightText truncate">{accountLabel(account)}</p>
                    <p className="text-xs text-gray-400 font-bodyFont">
                      {last ? `${gbp(last.balance)} · ${formatDate(last.date)}` : "No snapshots yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className={`${inputClass} w-36 text-right`}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={last ? gbp(last.balance) : "£0.00"}
                    aria-label={`New balance for ${account.name}`}
                    autoFocus={index === 0}
                    value={draft.balance}
                    onChange={(e) => patchDraft(account.id, { balance: e.target.value })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => patchDraft(account.id, { open: !draft.open })}
                    aria-expanded={draft.open}
                    title="Add contribution / withdrawal / notes"
                    className="w-10 h-10 shrink-0 rounded-lg border border-gray-600 text-lightText font-titleFont hover:border-designColor hover:text-designColor transition-colors duration-300"
                  >
                    {draft.open ? "-" : "+"}
                  </button>
                </div>
              </div>
              {draft.open && (
                <div className="grid grid-cols-1 sml:grid-cols-3 gap-2 mt-3 sml:pl-6">
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Contribution (£)"
                    aria-label={`Contribution for ${account.name}`}
                    value={draft.contribution}
                    onChange={(e) => patchDraft(account.id, { contribution: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Withdrawal (£)"
                    aria-label={`Withdrawal for ${account.name}`}
                    value={draft.withdrawal}
                    onChange={(e) => patchDraft(account.id, { withdrawal: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    autoComplete="off"
                    placeholder="Notes (optional)"
                    aria-label={`Notes for ${account.name}`}
                    value={draft.notes}
                    onChange={(e) => patchDraft(account.id, { notes: e.target.value })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {message && (
        <p
          className={`mt-4 font-bodyFont ${message.kind === "ok" ? "text-green-400" : "text-red-400"}`}
          role="status"
        >
          {message.text}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-designColor text-bodyColor font-titleFont hover:opacity-80 transition-opacity duration-300"
        >
          Save snapshots
        </button>
      </div>
    </form>
  );
}

export default BulkUpdateForm;
