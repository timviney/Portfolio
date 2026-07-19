import React, { useState } from "react";
import { currentTaxYear, isaSummary } from "../lib/isa";
import { updateTaxYears } from "../lib/actions";
import { gbp, formatDate, parseMoney } from "../lib/format";

// ISA tab: per-owner contributions against the selected tax year's allowance,
// plus a small editor for the configured tax years (their only consumer is this
// panel, which is why the config lives here).

const cardClass = "bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-8";
const cellInputClass =
  "h-8 w-full min-w-[6rem] rounded-lg border-b-[1px] border-b-gray-600 bg-[#191b1e] text-lightText px-2 text-sm outline-none focus-visible:outline-designColor focus-visible:border-b-transparent duration-300";
const smallButtonClass =
  "px-4 py-1 rounded-lg border border-gray-600 text-lightText text-sm font-titleFont hover:border-designColor hover:text-designColor transition-colors duration-300";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function TaxYearEditor({ taxYears, onSave, onCancel }) {
  const [rows, setRows] = useState(() =>
    taxYears.map((taxYear) => ({ ...taxYear, isaAllowance: String(taxYear.isaAllowance) }))
  );
  const [error, setError] = useState(null);

  const patchRow = (index, key) => (event) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: event.target.value } : row)));

  const handleSave = () => {
    const names = new Set();
    for (const row of rows) {
      if (!row.name.trim()) return setError("Every tax year needs a name.");
      if (names.has(row.name.trim())) return setError(`Duplicate tax year name "${row.name.trim()}".`);
      names.add(row.name.trim());
      if (!DATE_RE.test(row.start) || !DATE_RE.test(row.end)) {
        return setError(`"${row.name}" needs valid start and end dates.`);
      }
      if (row.start >= row.end) return setError(`"${row.name}" must start before it ends.`);
      const allowance = parseMoney(row.isaAllowance);
      if (allowance === null || Number.isNaN(allowance)) {
        return setError(`"${row.name}" needs an allowance of 0 or more.`);
      }
    }
    onSave(
      rows.map((row) => ({
        name: row.name.trim(),
        start: row.start,
        end: row.end,
        isaAllowance: parseMoney(row.isaAllowance),
      }))
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-bodyFont text-lightText">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-600">
              <th className="py-2 pr-4 font-normal">Name</th>
              <th className="py-2 pr-4 font-normal">Start</th>
              <th className="py-2 pr-4 font-normal">End</th>
              <th className="py-2 pr-4 font-normal text-right">ISA allowance</th>
              <th className="py-2 font-normal text-right">Remove</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="py-2 pr-2">
                  <input className={cellInputClass} value={row.name} onChange={patchRow(index, "name")} placeholder="2026/27" />
                </td>
                <td className="py-2 pr-2">
                  <input type="date" className={cellInputClass} value={row.start} onChange={patchRow(index, "start")} />
                </td>
                <td className="py-2 pr-2">
                  <input type="date" className={cellInputClass} value={row.end} onChange={patchRow(index, "end")} />
                </td>
                <td className="py-2 pr-2">
                  <input className={`${cellInputClass} text-right`} inputMode="decimal" value={row.isaAllowance} onChange={patchRow(index, "isaAllowance")} />
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                    className="text-gray-400 hover:text-red-400"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-red-400 text-sm font-bodyFont">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            setRows((prev) => [...prev, { name: "", start: "", end: "", isaAllowance: "20000" }])
          }
          className={smallButtonClass}
        >
          + Add tax year
        </button>
        <button type="button" onClick={handleSave} className={smallButtonClass}>
          Save tax years
        </button>
        <button type="button" onClick={onCancel} className={smallButtonClass}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function IsaPanel({ state, run }) {
  const taxYears = state.config.taxYears;
  const [selectedName, setSelectedName] = useState(
    () => currentTaxYear(state)?.name ?? taxYears[taxYears.length - 1]?.name ?? null
  );
  const [editing, setEditing] = useState(false);

  const selected = taxYears.find((taxYear) => taxYear.name === selectedName) ?? null;
  const rows = selected ? isaSummary(state, selected) : [];
  const hasIsaAccounts = state.accounts.some((account) => state.config.isaTypes.includes(account.type));

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-titleFont font-bold text-lightText">ISA allowance</h2>
          <div className="flex items-center gap-3">
            {taxYears.length > 0 && (
              <select
                value={selected?.name ?? ""}
                onChange={(event) => setSelectedName(event.target.value)}
                className="h-8 rounded-lg border-b-[1px] border-b-gray-600 bg-[#191b1e] text-lightText px-2 text-sm outline-none focus-visible:outline-designColor duration-300"
              >
                {taxYears.map((taxYear) => (
                  <option key={taxYear.name} value={taxYear.name}>
                    {taxYear.name}
                  </option>
                ))}
              </select>
            )}
            <button type="button" onClick={() => setEditing((prev) => !prev)} className={smallButtonClass}>
              {editing ? "Close editor" : "Edit tax years"}
            </button>
          </div>
        </div>

        {editing ? (
          <TaxYearEditor
            taxYears={taxYears}
            onSave={(next) => {
              run(updateTaxYears, next);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : !selected ? (
          <p className="text-sm text-gray-400 font-bodyFont">
            No tax years configured — use "Edit tax years" to add one.
          </p>
        ) : !hasIsaAccounts ? (
          <p className="text-sm text-gray-400 font-bodyFont">
            No ISA accounts yet — add one from the Accounts tab.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-400 font-bodyFont mb-4">
              {formatDate(selected.start)} → {formatDate(selected.end)} · allowance {gbp(selected.isaAllowance)} per person
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-bodyFont text-lightText">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-600">
                    <th className="py-2 pr-4 font-normal">Owner</th>
                    <th className="py-2 pr-4 font-normal text-right">Contributions</th>
                    <th className="py-2 pr-4 font-normal text-right">Withdrawals</th>
                    <th className="py-2 pr-4 font-normal text-right">Net</th>
                    <th className="py-2 font-normal text-right">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.owner} className="border-b border-gray-700">
                      <td className="py-2 pr-4 font-titleFont">{row.owner}</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">{gbp(row.contributions)}</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">{gbp(row.withdrawals)}</td>
                      <td className="py-2 pr-4 text-right whitespace-nowrap">{gbp(row.net)}</td>
                      <td
                        className={`py-2 text-right whitespace-nowrap font-titleFont font-bold ${
                          row.remaining < 0 ? "text-red-400" : "text-designColor"
                        }`}
                      >
                        {gbp(row.remaining)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default IsaPanel;
