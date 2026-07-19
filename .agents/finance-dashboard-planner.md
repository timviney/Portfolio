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
| Persistence | **File-editor model** — the JSON file IS the document: the app opens with a new empty document each visit, edits live in memory, Save downloads the file. Unsaved-changes indicator + `beforeunload` warning + confirm dialog before Open/New. No localStorage. (Changed 2026-07-19, supersedes the earlier localStorage decision.) |
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
  FinanceDashboard.js        Route entry. Owns all state, dirty tracking and the unsaved-changes guard. Tab layout (see below).
  dashboard/
    SummaryCards.js          Total / savings / investments / ISA / GIA / taxable / tax-free cards
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
    FilePanel.js             New / Open / Save document; validation errors surfaced readably
  lib/
    schema.js                Defaults, normalization, validation (pure)
    file.js                  Document open/save (file read + download)
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
- Persistence: none between sessions. `FinanceDashboard` keeps the last-saved document object; `dirty = state !== saved`. Save = download the JSON file; Open/New with unsaved changes go through a confirm dialog; a `beforeunload` handler warns on page leave while dirty.

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
- **Taxable vs tax-free split**: an account is "taxable" if its `type ∈ config.taxableTypes` (default: Savings Account, GIA); everything else (ISAs, Premium Bonds) is tax-free. Drives the taxable/tax-free summary totals. This is an independent axis from savings/investments — a GIA is a taxable investment, a Cash ISA is tax-free savings.
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

**Tabs** in `FinanceDashboard`: `Dashboard | Update | Accounts | ISA | File`. The tab bar also shows an unsaved-changes indicator and a Save button.

- **Dashboard**: SummaryCards (total, savings, investments, ISA, GIA, taxable, tax-free), PortfolioValueChart, AccountBalancesChart, 4 × AllocationChart (grid; groupBy account/type/provider/owner), StatsPanel.
- **Update**: BulkUpdateForm — date picker (default today), one row per active account showing name + last balance (+ its date), empty "new balance" input per row (placeholder = last balance), per-row expandable contribution/withdrawal/notes. Save creates snapshots **only for rows with a non-empty new balance**, then clears inputs and confirms "Saved N snapshots".
  - *Simplification of the design doc's "selecting multiple accounts": the non-empty field IS the selection — no checkboxes. Fewer clicks, same outcome.*
- **Accounts**: AccountList + AccountForm. Expanding a row shows notes/details and the snapshot history table with edit/delete (typo-fixing only).
- **ISA**: IsaPanel — per-owner cards/table for the selected tax year: contributions, withdrawals, net, remaining allowance; tax year selector; small editor to add/edit tax years (config lives here because ISA tracking is its only consumer).
- **File**: FilePanel — New document, Open file (validate → unsaved-changes guard → apply), Save (downloads `finance-YYYY-MM-DD.json`). Opening or creating a document with unsaved changes prompts Save & continue / Discard / Cancel.
- **Start screen** (no document open): the app always opens here — the user must choose "Open file…" or "New document" before any tabs appear. There is no implicit empty document.
- **Empty state** (document open, no accounts): friendly prompt with "Open file…" and "Create your first account" buttons, shown instead of tabs content.
- Account/owner/type grouping colours: `account.colour` where applicable; otherwise assign from a fixed palette by index (`format.js`).

---

## Steps

> Order matters: `lib/` before UI, and the app must build after every step.

- [x] **1. Install Recharts** — `npm install recharts`. Verify `npm start` still works.
- [x] **2. Scaffold + schema** — create the folder structure; implement `lib/schema.js` (`defaultData()`, `validate()`, `normalize()`, `STORAGE_KEY`) exactly per the Data model section.
- [x] **3. File I/O** — `lib/file.js`: `saveFile(state)` (Blob download), `openFile(file)` (async → validated+normalized state or thrown readable error). (Reworked from the localStorage `storage.js` in step 10b.)
- [x] **4. Actions** — `lib/actions.js`: `createAccount`, `updateAccount`, `setArchived`, `addSnapshots` (bulk), `updateSnapshot`, `deleteSnapshot`, `updateTaxYears`, `replaceAll`. Pure; UUID ids; 2dp rounding; owners/types lists auto-extended when a new string is used.
- [x] **5. Model + format** — `lib/model.js` selectors and `lib/format.js` (`gbp`, `pct`, `formatDate`, fixed palette `colourFor(index)`) per the Key algorithms section.
- [x] **6. Analytics + ISA** — `lib/analytics.js`, `lib/isa.js` per the Key algorithms section.
- [x] **7. App shell** — `FinanceDashboard.js`: state + dirty tracking + tab bar + empty state; register `/finance` route in `src/App.js`. App builds and renders with default data.
- [x] **8. Bulk update form** — `entry/BulkUpdateForm.js` per the UI design. This is the most important screen in the app: optimise for keyboard flow (tab straight down the balance column).
- [x] **9. Account management** — `entry/AccountList.js` + `entry/AccountForm.js`: create/edit/archive, inline new owner/type, expandable row with snapshot history (edit/delete).
- [x] **10. Import/Export** — `data/ImportExport.js` with validation errors surfaced readably and a confirm-before-replace dialog. (Superseded by 10b the same day.)
- [x] **10b. File-editor persistence rework** — user decision: the app behaves like a document editor, not an auto-saving app. New empty document on every visit; no localStorage; `lib/file.js` (`saveFile`/`openFile`), `data/FilePanel.js` (New/Open/Save); dirty tracking (`state !== savedDoc`), unsaved-changes confirm (Save & continue / Discard / Cancel) and `beforeunload` warning in `FinanceDashboard.js`; Data tab renamed File; download renamed `finance-YYYY-MM-DD.json`.
- [x] **10c. Start screen** — no implicit empty document: `FinanceDashboard` state starts as `null` and the app renders a start screen (Open file… / New document) until the user picks one. Tabs only appear once a document exists.
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
- Dashboard: 7 summary cards (the design doc's 5 + taxable/tax-free, user decision 2026-07-19) and the 6 charts listed in the design doc.
- Analytics v1: exactly the listed calculations — nothing extra.
- ISA: contributions by tax year and owner, remaining allowance, configurable tax years.
- Data entry: multi-account, single-save bulk update; fast.
- File open/save with validation; unsaved-changes indicator + leave warning; client-side only; single JSON document; no new dependencies beyond Recharts.
- `npm run build` succeeds.

---

## Work Log

Append one entry per step taken. Format: `### YYYY-MM-DD — <step/action>` then brief bullets: what, files, decisions/deviations.

### 2026-07-19 — Plan authored
- Architecture, schema, algorithms, UI design and steps agreed with the user following the design doc's "Before Writing Code" process.
- Locked decisions recorded above (Recharts; localStorage + file; GBP-assumed; no tests; route `/finance`).
- Notable simplifications vs. the design doc, accepted by the user: no row checkboxes in bulk update (non-empty field = selection); `savingsTypes` config added to support the savings/investments split with configurable types; TWR implemented as a documented approximation.

### 2026-07-19 — Steps 1–3 confirmed complete
- Recharts 3.9.2 present in `node_modules` and `package.json`. Did **not** re-run `npm start` (dev-server/build runs were crashing the session; user asked to avoid them).
- `lib/schema.js` and `lib/storage.js` reviewed against the Data model section — complete.
- Deviation from the plan's example JSON, ~~accepted: `config.taxableTypes` and `config.stocksTypes` dropped~~ — **superseded the same day**: `taxableTypes` was reinstated (user decision, see next-but-one entry); `stocksTypes` remains dropped (still no consumer).

### 2026-07-19 — Steps 4–5 (actions, model, format)
- `lib/actions.js`: all planned transitions; money coerced + rounded 2dp on write; snapshots appended (never sorted) so later array entries win same-date ties; new accounts default their colour from the palette by index.
- `lib/format.js`: `gbp`, `gbpShort` (chart axis labels), `pct`, `formatDate`, `todayString()` (local, not `toISOString` — UTC shift), `colourFor` (10-colour palette, first = `designColor`).
- `lib/model.js`: `activeAccounts`, `latestByAccount` (single scan, `>=` = later-entry-wins), `accountHistory`, `portfolioSeries` (carry-forward over union of dates, per-account cursors), `balanceSeriesByAccount` (null before an account's first snapshot so chart lines start correctly), `summaryTotals`, `allocationBy` (active accounts, zero-slices dropped, value-desc).
- **Stopped here at user request, mid-session. Next: step 6 (`lib/analytics.js`, `lib/isa.js`), then steps 7–15 (UI). No builds/dev-server runs were attempted; nothing verified beyond code review yet.**

### 2026-07-19 — Decision change: taxable vs tax-free totals
- User pointed out Premium Bonds are untaxed and must be distinguished from ordinary (taxed) savings. Chosen surface: **tax-free / taxable summary totals** (their option 1).
- `config.taxableTypes` restored to `schema.js` (defaults `["Savings Account", "GIA"]`; validation + normalization included). `summaryTotals` in `model.js` now also returns `taxable` and `taxFree`.
- SummaryCards (step 11) will show 7 cards: total, savings, investments, ISA, GIA, taxable, tax-free. Plan's data model, semantics, UI design and DoD sections updated to match.
- `config.stocksTypes` remains dropped — still no consumer.

### 2026-07-19 — Step 6 (analytics, ISA)
- `lib/analytics.js`: `netContributions(state, start, end, accountIds?)` (start < date <= end), `totalNetContributions`, `valueAtDate` (carry-forward via `portfolioSeries`), `growthOverPeriod` (value(end) − value(start) − net; pct vs value(start) + net, documented simple approximation, null pct on zero base), `twrApproximation` (Modified-Dietz-style over the portfolio series, documented approximation, null if < 2 points or no positive base), `growthByAccount` / `growthByType` (per-account balance deltas − own net flows, archived accounts included, growth-desc). Built on `model.js` selectors, no re-implementation.
- `lib/isa.js`: `taxYearForDate`, `currentTaxYear` (via `format.js` `todayString`, lexicographic compares only), `isaSummary(state, taxYear)` (per-owner contributions/withdrawals/net/allowance/remaining for `type ∈ isaTypes`, zero rows for owners with ISA accounts but no activity), `currentIsaSummary`.
- Verified with `node --check` only (no build/dev-server per session constraint).
- Deviations: none in semantics. Two small presentation choices, both documented in JSDoc: (1) `growthByAccount`/`growthByType` include archived accounts (history counts, consistent with series rules); (2) `isaSummary` emits a zero row for owners holding an ISA account but with no flows in the year, so the panel can show their full remaining allowance.

### 2026-07-19 — Step 7 (app shell)
- `FinanceDashboard.js` was found already written (unlogged prior session): state via `useState(() => load() ?? defaultData())`, write-through `useEffect` save, `run(action, payload)` mutation funnel, tab bar, empty state with working import; `/finance` route already registered in `src/App.js`. Reviewed against lib APIs — all consistent.
- Fix applied: the tab bar is now always rendered, and the empty state replaces tab content except on the Accounts tab. Previously the empty state replaced *everything*, so its "Create your first account" button switched to a tab that was never shown — a dead end. Interpretation: design doc says the empty state is shown "instead of tabs content", i.e. the tab bar itself stays visible.
- Verified with `npm run build` — compiled successfully (the earlier session's no-builds constraint appears to have been dev-server-specific; `npm run build` terminates cleanly on its own). Note: `node --check` silently passes JSX files on this machine (Node 22.8), so it is *not* a valid syntax gate for component files — only the build is.

### 2026-07-19 — Step 8 (bulk update form)
- `entry/BulkUpdateForm.js`, wired into the Update tab as `<BulkUpdateForm state={state} run={run} />`. Date picker (defaults to today via `todayString()`), one row per active account (colour dot, name, last balance + its date, placeholder = last balance), per-row `+` toggle revealing contribution/withdrawal/notes, save via `addSnapshots`.
- Keyboard flow per the step's emphasis: wrapped in `<form>` so Enter saves from any field; the per-row toggle is `tabIndex={-1}` so Tab walks balance → balance; first balance input is `autoFocus`; `inputMode="decimal"` for mobile keypads.
- Deviations/decisions: (1) save is skipped-silently only for *completely* empty rows — a row with flows/notes but no balance blocks the save with a naming error rather than being silently dropped (prevents lost intent; one extra guard clause); (2) invalid amounts (non-numeric/negative) block the whole save with a naming error instead of partial-saving, so a typo never creates a half-complete batch; (3) `parseMoney` accepts pasted "£1,234.56"; (4) date is kept after save (backfilling several dates in a row is a real workflow) while row inputs clear; (5) guard message for the all-accounts-archived edge case.
- `npm run build` compiled successfully.

### 2026-07-19 — Step 9 (account management)
- `entry/AccountForm.js`: create/edit in one form (name/provider/owner/type/colour/notes). Owner & type are free-text inputs with `<datalist>` suggestions from config (unique ids via `useId`); new strings flow into config via `configFromAccount` in actions.js. Colour uses native `<input type="color">`; in create mode it defaults to the palette colour the account would get anyway (`defaultColour` prop = `colourFor(accounts.length)`), so palette-by-index behaviour is preserved. Currency deliberately not editable (locked decision: GBP-assumed, display-only v1) — shown read-only in the expanded row instead.
- `entry/AccountList.js`: header (active/archived counts + Add button; add form auto-opens when zero accounts so the empty-state "Create your first account" button lands somewhere useful), all accounts listed including archived (dimmed + badge), expandable rows showing currency/notes, Edit details (inline AccountForm), Archive/Un-archive, and SnapshotHistory (most-recent-first table with inline edit row + window.confirm delete — low-prominence typo-fixing as specified).
- Refactor: `parseMoney` moved from BulkUpdateForm into `lib/format.js` (input parsing is formatting's inverse — one home for money-string logic) and is now shared by the bulk form and the snapshot editor.
- `npm run build` compiled successfully.


### 2026-07-19 — Step 10 (import/export)
- `data/ImportExport.js`, wired into the Data tab as `<ImportExport state={state} run={run} />`. Export card downloads the backup via `storage.exportFile`. Import: hidden file input → `importFile` (validates + normalizes) → modal confirm dialog summarising the file (account/snapshot counts, snapshot date range via `formatDate`) alongside the counts that will be replaced → confirm runs `replaceAll`; cancel discards.
- Decisions: (1) validation errors are shown verbatim in a `<pre>` under the import button (importFile already produces readable multi-line messages); (2) the confirm dialog is a real modal rather than `window.confirm` because it carries a summary and a destructive warning, and the site has no existing modal component to reuse; (3) a success notice is shown after replace since a file replace has no other visible feedback; (4) FinanceDashboard's own empty-state import path left as-is — with zero accounts there is nothing to lose, so no confirm there.
- `npm run build` compiled successfully.


### 2026-07-19 — Step 10b (file-editor persistence rework)
- User decision: the app should behave like an online document editor, not an auto-saving app — fresh empty document on every visit, unsaved-changes indicator, warning on leaving without saving, the JSON file as the document rather than a backup. Locked decisions, architecture rules, target structure, UI design, steps 3/7/10 and the DoD updated to match (step 10's ImportExport superseded the same day). This also matches the design doc more literally ("Data stored as a single JSON file").
- `lib/file.js` replaces `lib/storage.js`: `saveFile(state)` (downloads `finance-YYYY-MM-DD.json`), `openFile(file)` (validate + normalize or readable thrown error). `STORAGE_KEY` removed from `schema.js`; localStorage is no longer touched anywhere.
- `FinanceDashboard.js`: `savedDoc` state holds the last saved/opened document object; `dirty = state !== savedDoc` (actions always return a new object, so identity comparison is exact). `guardUnsaved(action)` routes Open/New through a modal (Save & continue / Discard changes / Cancel) when dirty. `beforeunload` listener active only while dirty. Tab bar gains an amber "● Unsaved changes" indicator and an always-visible Save button; Data tab renamed File; empty-state button is now "Open file…" and its open path also goes through the guard.
- `data/FilePanel.js` replaces `data/ImportExport.js`: Save / Open / New cards; stays dumb — dirty flag and guards live in FinanceDashboard; only open-validation errors are rendered locally.
- `replaceAll` in actions.js is no longer called by the UI (applyDocument sets state directly); kept as part of the planned actions API.
- `npm run build` compiled successfully (clean, no warnings).
- Not yet manually verified in the browser (beforeunload prompt, guard dialog) — folded into step 16's end-to-end check.


### 2026-07-19 — Step 10c (start screen)
- User decision: no implicit empty document — on entry the app must make the user choose Open or New before anything else.
- `FinanceDashboard.js`: `state` now starts as `null` and the component returns a start screen (Open file… / New document, validation errors inline) until a document exists; tabs only render afterwards. The file-picker input and open handler are shared between the start screen and the no-accounts empty state. `dirty` is false while no document is open, so the start screen never triggers the beforeunload warning.
- Plan updated: new Start screen bullet in the UI design section, step 10c added and ticked.
- `npm run build` compiled successfully.
