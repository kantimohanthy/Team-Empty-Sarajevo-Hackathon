# G-Core Data Boundaries & Architecture Intent

## Overview

This document defines the architectural data boundaries between a **Participating Financial Institution (Bank)** and the **G-Core Shared Loyalty Layer**.

> [!NOTE]
> **Architectural Intent**: This document describes the intended production data boundary architecture. It represents engineering design goals for privacy-preserving integration, not a production compliance or security certification.

---

## Data Boundary Architecture

```
┌────────────────────────────────────────────────────────┐
│                   BANK BOUNDARY                        │
│                                                        │
│  - Personally Identifiable Information (PII)          │
│  - Account Balances & Account Numbers                  │
│  - Raw Transaction Logs & Timestamps                   │
│  - Merchant Names & Locations                          │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │   BANK-SIDE BEHAVIORAL ENGINE                  │   │
│   │   - Context Detection & Healthcare Protection  │   │
│   │   - Anti-Gaming Transfer Filtering             │   │
│   │   - 5-Dimension Consistency Evaluation         │   │
│   └───────────────────────┬────────────────────────┘   │
└───────────────────────────┼────────────────────────────┘
                            │ Pseudonymous Events Only
                            ▼
┌────────────────────────────────────────────────────────┐
│               G-CORE SHARED ECOSYSTEM                  │
│                                                        │
│  - Pseudonymous G-Pass ID (e.g. G-8F3A9C10)            │
│  - Accumulated GP Point Balance & Deltas               │
│  - Ecosystem Status Tier (Member ➔ Diamond)            │
│  - Reward Eligibility Flags & Reason Codes             │
│  - Verified Ecosystem Tenure Months                    │
└────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

### 1. Bank Boundary (Stays 100% Inside Financial Institution)
- **PII & Identity**: Customer names, addresses, government IDs, and contact info never leave bank infrastructure.
- **Financial Balances**: Account balances, credit limits, and raw net worth figures are never transmitted to G-Core.
- **Raw Transaction Logs**: Merchant names, exact timestamps, itemized receipts, and transaction locations remain exclusively bank-side.
- **Local Engine Execution**: Behavioral classification, healthcare expense protection, and anti-gaming rules run inside or directly adjacent to the bank's own data boundary.

### 2. Derived Event Interface (Transmitted to G-Core)
Only minimal, pseudonymous, derived signals are transmitted across the boundary:
- **G-Pass ID**: Deterministic SHA-256 hash derived from customer ID and institutional salt (`G-HEXSHA256`).
- **GP Balance Updates**: Point deltas earned for milestone completions (+50 GP for goal, +200 GP for tenure).
- **Network Status Tier**: Tier index (0–4) indicating verified history milestones.
- **Generic Reason Codes**: High-level event flags (e.g., `PROTECTED_HEALTHCARE_EXPENSE`, `SAVINGS_TARGET_MET`) without merchant strings or transaction details.

### 3. G-Core Shared Layer (Ecosystem Side)
- **G-Pass Ledger**: Pseudonymous ledger tracking GP balances and reward redemptions.
- **G-Market Perks**: Catalog of merchant perks, access passes, and scarcity tracking.
- **Cross-Bank Status Concept**: Allows customers to maintain earned network tier standing when switching participating institutions without exposing underlying bank data.
