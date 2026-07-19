# Personal Investment Dashboard

Act as a senior software architect. Challenge requirements that add unnecessary complexity and always prefer the simplest design that satisfies the stated goals.

I want to build a personal savings and investment dashboard as a new section of my existing website.

This project replaces an Excel spreadsheet that I currently use to manually track my savings and investment accounts.

The application is intended for personal use and should be designed to be as simple, lightweight and maintainable as possible.

The goal is **not** to create a feature-rich investment platform. It should simply provide a much nicer way to enter, view and analyse my own manually entered financial data.

## Technical Requirements

* React (JavaScript)
* Must fit naturally into the existing website structure
* Client-side only wherever practical
* No database
* No authentication
* No server-side processing unless absolutely necessary
* Data stored as a single JSON file
* JSON can be imported and exported through the UI

The application should favour **minimal code**, **clarity** and **maintainability** over clever abstractions.

Avoid unnecessary complexity.

---

# Overall Goals

The application should allow me to:

* Track savings and investment accounts
* Record historical balances
* View portfolio growth over time
* Understand how my portfolio allocation changes
* View useful summary statistics
* Update account values quickly through a simple interface

Everything is entered manually.

The application should be optimised for speed of data entry.

---

# Investment Accounts

Each account should contain:

* Unique ID
* Name
* Provider
* Owner (configurable string)
* Account type
* Colour
* Currency
* Active / Archived
* Optional notes

Account types should be configurable rather than hard-coded.

Example account types include:

* Savings Account
* Cash ISA
* Stocks & Shares ISA
* General Investment Account (GIA)
* Premium Bonds
* Other

This application is intended for UK investments.

---

# Historical Data

Each balance update should be stored as an **immutable snapshot**.

The normal workflow is always to add a new snapshot rather than modifying historical ones.

Each snapshot contains:

* Date
* Account
* Balance
* Optional contribution
* Optional withdrawal
* Optional notes

Not every account will necessarily be updated on the same day.

The application should cope with accounts being updated independently.

---

# Dashboard

The dashboard should include concise summary cards such as:

* Total portfolio value
* Total savings
* Total investments
* Total ISA value
* Total GIA value

It should also include charts showing:

* Portfolio value over time
* Account balances over time
* Portfolio allocation by account
* Portfolio allocation by account type
* Portfolio allocation by provider
* Portfolio allocation by owner

The emphasis is on helping me understand how my portfolio is changing over time.

---

# Analytics (Version 1)

Keep analytics deliberately simple.

Useful calculations include:

* Total portfolio growth
* Percentage growth
* Contributions
* Withdrawals
* Net contributions
* Time-weighted return
* Current allocation percentages
* Growth by account
* Growth by account type

Do not add additional financial metrics unless there is a strong reason.

---

# UK ISA Tracking

Support ISA contribution tracking.

Show contributions:

* By tax year
* By owner
* Remaining annual allowance

Tax years should be configurable.

---

# Data Entry

Data entry is one of the most important parts of the application.

It should be extremely quick to update multiple accounts.

The interface should allow:

* Selecting multiple accounts
* Entering new balances for several accounts before saving
* Adding contributions or withdrawals where appropriate
* Adding optional notes
* Creating new accounts
* Editing account details
* Archiving accounts

Avoid workflows that require saving every account individually.

---

# Import / Export

Support:

* Import JSON
* Export JSON
* Validation when importing

Keep this simple.

No backwards compatibility is required.

---

# Architecture

Keep the architecture intentionally simple.

Separate:

* UI components
* Data model
* Calculation logic
* Chart logic
* JSON import/export

Business logic should never live inside UI components.

Avoid unnecessary abstraction or enterprise design patterns.

The project should be easy to understand after being left untouched for six months.

---

# Code Quality

Produce clean, production-quality code.

Prioritise:

* Readability
* Small reusable functions
* Clear folder structure
* Minimal code
* Minimal dependencies
* Consistent naming
* Straightforward React patterns

If there is a choice between a clever solution and a simple one, choose the simpler solution.

---

# Before Writing Code

Before implementing anything:

1. Design the application architecture.
2. Design the JSON schema.
3. Explain the reasoning behind each decision.
4. Identify anything important that may have been overlooked.
5. Challenge any design decisions that seem unnecessarily complicated.

Only once the architecture has been agreed should implementation begin.
