# Longitudinal Behavioral Modeling Roadmap

## Overview

This document defines the research roadmap for transitioning the **G-Core Behavioral Engine** from static monthly evaluation rules to dynamic longitudinal time-series modeling.

> [!IMPORTANT]
> **Implementation Note**: None of the predictive machine learning models or multi-year time-series features described below are currently active in this codebase. They represent prospective research directions for future institutional deployments once sufficient longitudinal labeled data exists.

---

## 📈 Longitudinal Feature Architecture

Evaluating financial consistency across multi-month windows requires tracking time-series features across rolling time horizons (3, 6, 12, and 24 months):

```
Raw Transaction Stream
  └── Rolling Window Aggregations (3mo / 6mo / 12mo)
        ├── Payment Consistency Index
        ├── Savings Regularity & Net Flow Velocity
        ├── Discretionary Variance & Volatility
        ├── Balance Buffer Resilience (Min / Median Ratio)
        └── Shock Recovery Rate (Days to Baseline Recovery)
```

### 1. Rolling Behavioral Windows
- **3-Month Horizon**: Tactical behavioral tracking (monthly goal evaluation and reward eligibility).
- **6-Month Horizon**: Tenure milestone calculation and tier progression (Member ➔ Silver ➔ Gold).
- **12-to-24 Month Horizon**: Macro behavioral stability, seasonal adjustment, and habit persistence.

### 2. Key Time-Series Metrics
- **Payment Consistency Over Time**: Tracking on-time settlement of fixed obligations over 6–12 billing cycles.
- **Savings Regularity**: Frequency and stability of net positive transfers to savings, independent of absolute transfer size.
- **Balance Volatility**: Measuring standard deviation of daily balance relative to average monthly income.
- **Financial Shock Recovery**: Measuring how quickly an account returns to positive buffer status after an unexpected expense event.
- **Trend Direction**: Evaluating whether a customer's overall consistency metrics are improving, stable, or declining over time.

---

## 🔮 Prospective Predictive Models

When longitudinal customer datasets become available, future engineering iterations could explore:

### 1. Gradient Boosting (LightGBM / XGBoost)
- **Objective**: Predicting monthly budget variance or discretionary overspend risk 15–30 days in advance.
- **Features**: Lagged 3-month discretionary velocity, day-of-month spending curves, fixed obligation schedule.

### 2. Time-Series Sequence Models (LSTM / Transformers)
- **Objective**: Modeling complex sequential spending patterns and recurring subscription behavior.
- **Condition**: Only to be explored if dataset volume and predictive accuracy improvements justify model complexity over explainable baselines.

### 3. Unsupervised Anomaly Detection (Isolation Forests)
- **Objective**: Identifying novel multi-account transfer loops or synthetic activity attempting to game behavioral metrics.

### 4. HDBSCAN Exploratory Clustering
- **Objective**: Unsupervised grouping of financial behavior patterns to discover organic customer personas (e.g., *Steady Saver*, *Seasonal Spender*, *Budget Improver*) for tailored engagement.

### 5. Contextual Bandits
- **Objective**: Reinforcement learning for dynamic offer matching, learning which reward categories yield high engagement without incentivizing debt.

---

## ⚖️ Validation & Deployment Requirements

Predictive longitudinal models must only be deployed after meeting strict criteria:
1. **Longitudinal Labeled Dataset**: Multi-year anonymized transactional data across diverse customer cohorts.
2. **Model Explainability (SHAP Values)**: Every model prediction must generate human-readable reason codes explaining the key feature drivers.
3. **Out-of-Sample Validation**: Rigorous cross-validation across unseen demographic cohorts to prevent overfitting and bias propagation.
