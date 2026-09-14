# G-Core Behavioral Engine

### Continued engineering development of the G-Core behavioral banking prototype

G-Core began as a 24-hour FinTech prototype at Adria Hack Sarajevo 2026.

This repository explores the engineering questions required to evolve that prototype into a more rigorous, testable, explainable behavioral-finance system.

* **Hackathon Case Study Repository**: [kantimohanthy/Team-Empty-Sarajevo-Hackathon](https://github.com/kantimohanthy/Team-Empty-Sarajevo-Hackathon)
* **Live Hackathon Demo**: [https://kantimohanthy.github.io/Team-Empty-Sarajevo-Hackathon/](https://kantimohanthy.github.io/Team-Empty-Sarajevo-Hackathon/)

`Next.js 14` · `TypeScript 5` · `Vitest` · `Tailwind CSS` · `SQLite` · `Recharts`

---

## 🎯 1. Project Purpose

Traditional bank loyalty programs are typically tied to spending volume, credit card debt, or absolute account balances. G-Core investigates an alternative paradigm: **Can financial consistency — evaluated relative to personal baselines — serve as an explainable loyalty signal?**

This repository focuses on technical evolution after the hackathon:
- Modularizing domain evaluation logic.
- Establishing automated test suites for behavioral rules.
- Introducing model versioning (`v0.1-hackathon-baseline`) and reason codes.
- Documenting data privacy boundaries between banks and loyalty networks.
- Formulating research frameworks for algorithmic fairness and longitudinal modeling.

---

## 🏗️ 2. System Architecture

G-Core uses a multi-tier pipeline to process raw transactions into explainable behavioral outcomes:

```
Bank Transactions
  ➔ Categorization & Classification
  ➔ Context Detection (Healthcare Protection)
  ➔ Anti-Gaming Filtering (Internal Transfer Pairing)
  ➔ 5-Dimension Consistency Evaluation
  ➔ Reason Code & Status Generation
  ➔ GP Balance & Tier Ledger Update
```

The system separates bank-side transactional data processing from shared ecosystem status. See [`./docs/data-boundary.md`](./docs/data-boundary.md) for detailed data boundary specifications.

---

## ⚙️ 3. Behavioral Engine

The domain engine evaluates financial activity across normalized metrics rather than raw account balance magnitude. 

Core evaluation code resides in:
* [`./lib/domain/behavior.ts`](./lib/domain/behavior.ts) — Pure domain evaluation engine.
* [`./lib/domain/model-metadata.ts`](./lib/domain/model-metadata.ts) — Model versioning and reason code definitions.
* [`./lib/server/behavior-engine.ts`](./lib/server/behavior-engine.ts) — Server execution pipeline wrapper.

---

## 📊 4. Current Deterministic Model (`v0.1-hackathon-baseline`)

The current evaluation logic uses five weighted dimensions:

| Dimension | Weight | Description |
| :--- | :---: | :--- |
| **Budget Discipline** | `30%` | Staying within personalized discretionary spending targets |
| **Payment Consistency** | `25%` | On-time settlement of fixed obligations (rent, utilities, loans) |
| **Savings Consistency** | `20%` | Regular monthly net savings contributions, regardless of absolute magnitude |
| **Liquidity Resilience** | `15%` | Maintaining a positive account buffer without overdraft events |
| **Goal Consistency** | `10%` | Multi-month streak adherence and milestone progress |

```typescript
export const BEHAVIOR_MODEL_VERSION = "v0.1-hackathon-baseline";
```

> [!IMPORTANT]
> **Prototype Parameter Note**: These weights are baseline design parameters selected for the hackathon MVP. They are not empirically calibrated risk coefficients or credit-scoring models. G-Core evaluates behavioral consistency for rewards, not credit default risk.

---

## 🛡️ 5. Anti-Gaming Logic

To prevent artificial manipulation (such as cycling money between accounts to fake savings behavior), G-Core implements automated same-day internal transfer matching (`./lib/server/anti-gaming-engine.ts`):

1. Scans candidate transactions matching internal transfer keywords or savings categories.
2. Identifies inflow/outflow pairs of matching magnitude (`Δ <= €0.01`) occurring close in time (`<= 24 hours`).
3. Flags both legs as `excludedForGaming: true`, removing them from savings progress and discretionary spend counts.

---

## 💡 6. Explainability & Reason Codes

Every evaluation produces human-readable reason codes alongside numerical metrics to ensure complete transparency:

```typescript
export type ReasonCode =
  | "PROTECTED_HEALTHCARE_EXPENSE"
  | "INTERNAL_TRANSFER_EXCLUDED"
  | "BUDGET_WITHIN_BASELINE"
  | "DISCRETIONARY_OVERSPEND_EXCEEDED"
  | "PAYMENT_CONSISTENT"
  | "SAVINGS_TARGET_MET"
  | "UNKNOWN_CATEGORY_FALLBACK"
  | "ZERO_TRANSACTION_STATE";
```

Example output for a protected healthcare expense:
```json
{
  "code": "PROTECTED_HEALTHCARE_EXPENSE",
  "message": "Healthcare expense recognized as protected and excluded from discretionary budget penalty."
}
```

---

## 🔒 7. Data Boundaries & Privacy

G-Core is designed around strict privacy separation:

* **Bank Boundary**: PII, balances, raw transactions, merchant strings, and receipt details stay 100% inside the financial institution.
* **G-Core Layer**: Only pseudonymous G-Pass hashes (`G-HEXSHA256`), GP point deltas, status tiers, and generic reason codes are shared with the loyalty network.

See [`./docs/data-boundary.md`](./docs/data-boundary.md) for full architectural specifications.

---

## 🧪 8. Testing Strategy

Behavioral rules are verified using Vitest unit tests in [`./lib/domain/__tests__/behavior-engine.test.ts`](./lib/domain/__tests__/behavior-engine.test.ts).

Key test scenarios:
1. Protected healthcare expenses do not distort discretionary budget scoring.
2. Matching internal transfer pairs are detected and excluded from savings progress.
3. Ordinary discretionary spending is included correctly.
4. Net savings contributions are accurately computed.
5. GP awards are idempotent and not duplicated for the same milestone.
6. Tier thresholds progress correctly across history months.
7. Unknown merchant/category fallbacks execute safely.
8. Zero transaction states return valid outputs without crashing.
9. Negative or NaN monetary inputs are sanitized safely.
10. Deterministic inputs produce 100% reproducible outputs.

Run the test suite:
```bash
npm run test
```

---

## ⚖️ 9. Fairness Questions

Evaluating financial behavior carries risks of algorithmic bias if lower-income or thin-file cohorts are evaluated against unsuitable baselines.

Key open research topics documented in [`./docs/fairness.md`](./docs/fairness.md):
- Relative vs. absolute financial capacity.
- Disparate impact across income brackets.
- Categorical protection for unavoidable life costs.
- Cold-start handling for thin-file accounts.

---

## 📈 10. Longitudinal Modeling Roadmap

Future iterations aim to expand from monthly static evaluation to multi-month time-series modeling (3, 6, 12, and 24 months):
- Rolling payment consistency indices.
- Financial shock recovery rates.
- Prospective predictive models (Gradient Boosting, Anomaly Detection, HDBSCAN clustering, Contextual Bandits).

See [`./docs/longitudinal-modeling.md`](./docs/longitudinal-modeling.md) for research roadmap details.

---

## ❓ 11. Research Questions

1. **Baseline Adaptation**: How quickly should personal spending baselines adjust to lifestyle or income shifts without losing signal quality?
2. **Game-Theoretic Resilience**: Can behavioral reward models remain resilient against adversarial optimization without introducing intrusive oversight?
3. **Cross-Institutional Portability**: How can loyalty status survive bank switching while preserving complete zero-leakage privacy for institutional transaction data?

---

## 🔌 12. API Architecture

Next.js API routes provide SQLite-backed server endpoints for institutional integration testing:
* `POST /api/behavior/evaluate` — Executes 5-dimension evaluation for a customer.
* `POST /api/gcore/claim` — Claims a G-Market item with tier and GP validation.
* `POST /api/simulation/transfer` — Simulates an internal account transfer.
* `POST /api/simulation/emergency` — Simulates a protected healthcare expense.
* `POST /api/simulation/switch-bank` — Demonstrates pseudonymous status portability.

---

## 📁 13. Repository Structure

```
app/                      # Next.js 14 App Router (pages & API endpoints)
lib/
├── domain/               # Pure domain logic & interfaces
│   ├── behavior.ts       # 5-dimension behavioral evaluation engine
│   ├── model-metadata.ts # Model versioning & reason code definitions
│   └── __tests__/        # Vitest behavioral test suite
├── server/               # Server-side execution wrappers (SQLite integration)
├── demo-engine.ts        # Client-side static demo state machine (localStorage)
└── types.ts              # Shared TypeScript interfaces

docs/                     # Engineering & Architecture Research Documentation
├── data-boundary.md      # Bank vs. G-Core privacy boundary specification
├── fairness.md           # Algorithmic fairness & bias analysis
└── longitudinal-modeling.md # Time-series research roadmap
```

---

## 🚀 14. Engineering Roadmap

```
v0.1 (Hackathon Baseline)
  └── Deterministic 5-dimension rules & browser simulation engine

v0.2 (Current Development)
  ├── Domain modularization & Vitest test suite
  ├── Model versioning (v0.1-hackathon-baseline)
  ├── Reason code generation & explainability infrastructure
  └── Privacy boundary & fairness documentation

v0.3 (Historical Rolling Windows)
  └── Multi-month (3/6/12mo) time-series feature extraction

v0.4 (Fairness & Baseline Calibration)
  └── Income-normalized adaptive baselines & cold-start rules

v0.5 (Bank API Abstraction Layer)
  └── Standardized Open Banking PSD2 connector interfaces

v0.6 (Longitudinal Dataset Research)
  └── Empirical validation on anonymized historical transaction logs

Future (Validated Predictive Models)
  └── Calibrated machine learning models (LightGBM, SHAP explainability)
```

---

## 🏆 15. Hackathon Origin

G-Core originated as a 24-hour FinTech hackathon prototype built by **Team EMPTY** at **Adria Hack Sarajevo 2026** (September 12–13, 2026).

The hackathon submission repository, screenshots, and visual product presentation are preserved at:
[https://github.com/kantimohanthy/Team-Empty-Sarajevo-Hackathon](https://github.com/kantimohanthy/Team-Empty-Sarajevo-Hackathon)

---

## 💻 Local Development & Testing

```bash
# Install dependencies
npm install

# Run Vitest unit tests
npm run test

# Run TypeScript type check
npm run type-check

# Run Next.js linter
npm run lint

# Run development server
npm run dev

# Build production static export
set GITHUB_ACTIONS=true&& npm run build
```

---

## ⚖️ Disclaimer

*This repository is an ongoing engineering research prototype built for technical demonstration using simulated data. It is not a credit-scoring system, lending-decision system, financial advice product, or production banking platform.*
