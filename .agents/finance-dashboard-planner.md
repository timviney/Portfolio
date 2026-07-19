# Finance Dashboard — Implementation Plan

Working plan for implementing the **Personal Investment Dashboard**.
The requirements live in [`finance-dashboard-design.md`](./finance-dashboard-design.md) — that file is the source of truth for **WHAT** we are building. This file is the **HOW**, plus the live record of progress.

---

## How to use this file (read first)

This is a **living document**. The agent implementing this project MUST:

1. Tick steps (`[x]`) immediately after completing them — don't batch.
2. Add, split, reword or remove steps as the plan evolves. Steps are a guide, not a contract.
3. Append an entry to the **Work Log** for *every* step taken: what was done, files touched, decisions made, and any deviation from this plan and why.
4. Keep the **Locked decisions** section up to date if the user changes a decision.
5. Follow the design doc's core principles at all times: minimal code, minimal dependencies, business logic out of UI components, clarity over cleverness. Challenge (with the user) anything that adds unjustified complexity.

---

## Locked decisions

Agreed with the user on 2026-07-19. Do not silently change these.

| Decision | Choice |
|---|---|
| Route | `/finance`, following the existing mini-app pattern (`/sudoku`, `/tanks`, `/pubpoint`) |
| Charting | **Recharts** — the single new dependency |
| Persistence | **localStorage** auto-save working copy + JSON file import/export as backup/transfer |
| Currency | GBP-assumed for all aggregation; `currency` field is display-only in v1 |
| Tests | **None** (user's call; design doc doesn't require them) |
| Validation | Hand-rolled plain-JS validator — no zod or similar |

## Existing site conventions to follow

- React 18 + Tailwind + react-router-dom v6; build via craco (`npm start`, `npm run build`).
- Feature code lives in `src/components/<feature>/`.
- Styling reuses theme tokens: `bg-bodyColor`, `text-lightText`, `text-designColor`, `font-titleFont`, `font-bodyFont`, `shadow-shadowOne`. Cards elsewhere look like: `bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne`.
- Mini-apps are standalone routes; the navbar only links to home-page sections, so **no navbar change is needed**.

---

## Target structure

```
src/components/finance/
  FinanceDashboard.js        Route entry. Owns all state. Tab layout (see below).
  dashboard/
    SummaryCards.js          Total / savings / investments / ISA / GIA cards
    PortfolioValueChart.js   Total value over time (line)
    AccountBalancesChart.js  Per-account balances over time (multi-line)
    AllocationChart.js       One reusable pie; prop groupBy = account | type | provider | owner
    StatsPanel.js            Growth, % growth, contributions, withdrawals, net, TWR, growth by account/type
    IsaPanel.js              ISA contributions by tax year & owner, remaining allowance + tax year config editor
  entry/
    BulkUpdateForm.js        THE key screen: one row per active account, save many snapshots at once
    AccountList.js           Accounts table; expand a row for details, edit, archive, snapshot history
    AccountForm.js           Create/edit account (inline "add new" for owner/type via datalist + free text)
  data/
    ImportExport.js          File download / upload + validation + replace-confirm
  lib/
    schema.js                Defaults, normalization, validation (pure)
    storage.js               localStorage load/save + file download/read
    actions.js               Pure state transitions (addSnapshots, upsertAccount, archiveAccount, replaceAll...)
    model.js                 Selectors (latest balances, balance-as-of, portfolio series, allocations)
    analytics.js             Growth, net contributions, TWR approximation (pure)
    isa.js                   Tax-year ISA summaries (pure)
    format.js                £ / % / date formatting, fixed colour palette helper
```

**Architecture rules (from the design doc, applied concretely):**

- One state object = the whole JSON document, held in `FinanceDashboard` via `useState`.
- ALL mutations go through pure functions in `lib/actions.js`: `setState(prev => someAction(prev, payload))`.
- UI components contain zero business logic — they render selector output and call actions.
- `lib/` functions are pure and independently readable; this is where complexity lives, nowhere else.
- Persistence: a `useEffect` in `FinanceDashboard` writes state to localStorage on every change (data is tiny — no debounce needed).

---

## Data model (v1 schema)

```json
{
  "version": 1,
  "config": {
    "owners": ["Tim"],
    "accountTypes": ["Savings Account", "Cash ISA", "Stocks & Shares ISA", "GIA", "Premium Bonds", "Other"],
    "isaTypes": ["Cash ISA", "Stocks & Shares ISA"],
    "taxableTypes": ["Savings Account", "GIA"],
    "savingsTypes": ["Savings Account", "Cash ISA", "Premium Bonds"],
    "stocksTypes": ["Stocks & Shares ISA", "GIA"],
    "taxYears": [
      { "name": "2026/27", "start": "2026-04-06", "end": "2027-04-05", "isaAllowance": 20000 }
    ]
  },
  "accounts": [
    {
      "id": "a8f3k2",
      "name": "Vanguard S&S ISA",
      "provider": "Vanguard",
      "owner": "Tim",
      "type": "Stocks & Shares ISA",
      "colour": "#4f8ef7",
      "currency": "GBP",
      "archived": false,
      "notes": ""
    }
  ],
  "snapshots": [
    {
      "id": "s9d2x1",
      "accountId": "a8f3k2",
      "date": "2026-07-01",
      "balance": 10234.56,
      "contribution": 500,
      "withdrawal": 0,
      "notes": ""
    }
  ]
}
```

**Semantics — pinned down, do not reinterpret:**

- `contribution` / `withdrawal` on a snapshot = external money in/out **between the previous snapshot of that account and this one**. Default `0`.
- Growth therefore = balance deltas − net flows. Net contributions = Σ contributions − Σ withdrawals.
- **Savings vs investments split**: an account counts as "savings" if its `type ∈ config.savingsTypes`; everything else is an investment. (This is why `savingsTypes` exists in config — design doc asks for both summary cards with configurable types.)
- IDs: `crypto.randomUUID()`. Money: plain numbers, rounded to 2dp on write in `actions.js`.
- Dates: `YYYY-MM-DD` strings, compared **lexicographically**. Never `new Date(isoString)` for grouping/sorting (UTC-midnight timezone shift bug). Construct Dates from split parts only when formatting for display.
- Multiple snapshots for the same account on the same date are **legal** (same-day corrections); the later entry in the array wins.
- `archived: true` accounts: excluded from summary cards, allocation pies, and the bulk-update form; retained in all historical series and account list.
- Snapshots are added, not edited, in the normal workflow (design doc) — but edit/delete must exist for typo-fixing, low-prominence, inside the expanded account row (snapshot history).

**Validation on import (`schema.js`):** check `version === 1`, required account/snapshot fields and their types, `YYYY-MM-DD` date format, numeric balances/flows ≥ 0, and reject **orphaned snapshots** (unknown `accountId`) with a readable error. Unknown owner/type *strings* are fine — they're configurable. `normalize()` fills defaults and sorts snapshots by (date, insertion order) after import.

---

## Key algorithms (implement exactly like this in `lib/`)

- **Latest balance per account**: snapshot with max date for that account (tie → later array entry).
- **Portfolio value at date D**: Σ over accounts of each account's most recent snapshot ≤ D. Carry-forward only, never back-fill. Compute over the union of all snapshot dates → the portfolio series.
- **Growth over a period**: `value(end) − value(start) − netContributions(start, end]`. Percentage: `growth / (value(start) + netContributions)` — simple approximation, document it in a comment.
- **TWR (approximation)**: for consecutive period values V with net flows F between them: `r_i = (V_i − V_{i−1} − F_i) / V_{i−1}`; `TWR = Π(1 + r_i) − 1`. Modified-Dietz-style approximation given manual snapshot data — add a code comment and a UI footnote saying it's approximate.
- **ISA summary**: snapshots where account `type ∈ isaTypes`, grouped by owner and tax year; net contributions = Σ contributions − Σ withdrawals; remaining = that year's `isaAllowance` − net. "Current" tax year = the one containing today's date.

---

## UI design

**Tabs** in `FinanceDashboard`: `Dashboard | Update | Accounts | ISA | Data`

- **Dashboard**: SummaryCards (total, savings, investments, ISA, GIA), PortfolioValueChart, AccountBalancesChart, 4 × AllocationChart (grid; groupBy account/type/provider/owner), StatsPanel.
- **Update**: BulkUpdateForm — date picker (default today), one row per active account showing name + last balance (+ its date), empty "new balance" input per row (placeholder = last balance), per-row expandable contribution/withdrawal/notes. Save creates snapshots **only for rows with a non-empty new balance**, then clears inputs and confirms "Saved N snapshots".
  - *Simplification of the design doc's "selecting multiple accounts": the non-empty field IS the selection — no checkboxes. Fewer clicks, same outcome.*
- **Accounts**: AccountList + AccountForm. Expanding a row shows notes/details and the snapshot history table with edit/delete (typo-fixing only).
- **ISA**: IsaPanel — per-owner cards/table for the selected tax year: contributions, withdrawals, net, remaining allowance; tax year selector; small editor to add/edit tax years (config lives here because ISA tracking is its only consumer).
- **Data**: ImportExport — export button (downloads `finance-backup-YYYY-MM-DD.json`), import file picker → validate → confirm-replace dialog → apply.
- **Empty state** (no accounts): friendly prompt with "Import JSON" and "Create your first account" buttons, shown instead of tabs content.
- Account/owner/type grouping colours: `account.colour` where applicable; otherwise assign from a fixed palette by index (`format.js`).

---

## Steps

> Order matters: `lib/` before UI, and the app must build after every step.

- [ ] **1. Install Recharts** — `npm install recharts`. Verify `npm start` still works.
- [ ] **2. Scaffold + schema** — create the folder structure; implement `lib/schema.js` (`defaultData()`, `validate()`, `normalize()`, `STORAGE_KEY`) exactly per the Data model section.
- [ ] **3. Storage** — `lib/storage.js`: `load()` (localStorage → parse → validate, return `null` if absent/invalid), `save()`, `exportFile(state)` (Blob download), `importFile(file)` (async → validated+normalized state or thrown readable error).
- [ ] **4. Actions** — `lib/actions.js`: `createAccount`, `updateAccount`, `setArchived`, `addSnapshots` (bulk), `updateSnapshot`, `deleteSnapshot`, `updateTaxYears`, `replaceAll`. Pure; UUID ids; 2dp rounding; owners/types lists auto-extended when a new string is used.
- [ ] **5. Model + format** — `lib/model.js` selectors and `lib/format.js` (`gbp`, `pct`, `formatDate`, fixed palette `colourFor(index)`) per the Key algorithms section.
- [ ] **6. Analytics + ISA** — `lib/analytics.js`, `lib/isa.js` per the Key algorithms section.
- [ ] **7. App shell** — `FinanceDashboard.js`: state + localStorage write-through + tab bar + empty state; register `/finance` route in `src/App.js`. App builds and renders with default data.
- [ ] **8. Bulk update form** — `entry/BulkUpdateForm.js` per the UI design. This is the most important screen in the app: optimise for keyboard flow (tab straight down the balance column).
- [ ] **9. Account management** — `entry/AccountList.js` + `entry/AccountForm.js`: create/edit/archive, inline new owner/type, expandable row with snapshot history (edit/delete).
- [ ] **10. Import/Export** — `data/ImportExport.js` with validation errors surfaced readably and a confirm-before-replace dialog.
- [ ] **11. Summary cards + portfolio chart** — `SummaryCards.js`, `PortfolioValueChart.js`.
- [ ] **12. Remaining charts** — `AccountBalancesChart.js`, `AllocationChart.js` × 4.
- [ ] **13. Stats panel** — `StatsPanel.js` covering the design doc's Analytics v1 list (with TWR footnote).
- [ ] **14. ISA panel** — `IsaPanel.js` incl. tax year editor.
- [ ] **15. Styling pass** — consistent with site theme tokens; check at mobile width too.
- [ ] **16. End-to-end manual verification** — exercise the full workflow in `npm start`: create accounts → bulk updates across several dates → charts/cards/stats/ISA update correctly → export → import roundtrip → validation errors on a doctored file → archive behaviour → refresh persistence.
- [ ] **17. Final review** — walk the design doc section by section and confirm every requirement is met (or consciously deferred with the user). `npm run build` passes clean.

---

## Definition of done (maps to design doc sections)

- Accounts: all listed fields; configurable types/owners; archive; notes.
- History: immutable-by-default snapshots; independent per-account update days handled via carry-forward.
- Dashboard: the 5 summary cards and 6 charts listed in the design doc.
- Analytics v1: exactly the listed calculations — nothing extra.
- ISA: contributions by tax year and owner, remaining allowance, configurable tax years.
- Data entry: multi-account, single-save bulk update; fast.
- Import/export with validation; client-side only; single JSON document; no new dependencies beyond Recharts.
- `npm run build` succeeds.

---

## Work Log

Append one entry per step taken. Format: `### YYYY-MM-DD — <step/action>` then brief bullets: what, files, decisions/deviations.

### 2026-07-19 — Plan authored
- Architecture, schema, algorithms, UI design and steps agreed with the user following the design doc's "Before Writing Code" process.
- Locked decisions recorded above (Recharts; localStorage + file; GBP-assumed; no tests; route `/finance`).
- Notable simplifications vs. the design doc, accepted by the user: no row checkboxes in bulk update (non-empty field = selection); `savingsTypes` config added to support the savings/investments split with configurable types; TWR implemented as a documented approximation.
