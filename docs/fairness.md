# Fairness & Behavioral Evaluation Research

## Overview

This document outlines open engineering and algorithmic fairness considerations for the **G-Core Behavioral Banking Engine**.

G-Core measures financial consistency relative to a customer's personal historical baselines rather than raw account balance magnitude. However, evaluating financial behavior carries inherent risk of algorithmic bias, disparate impact, or systematic disadvantage for lower-income or thin-file cohorts if improperly calibrated.

> [!WARNING]
> **Research Status**: The fairness considerations discussed here are active engineering research topics. The current implementation uses prototype rules and has not undergone empirical fairness audit or demographic validation.

---

## Key Algorithmic & Fairness Considerations

### 1. Relative vs. Absolute Financial Capacity
Traditional banking loyalty programs inherently favor high-net-worth customers by rewarding spending volume or deposit size. G-Core mitigates this by evaluating net savings and discretionary budget adherence relative to personal 3-month medians. However:
- Low-income customers often operate with extremely small discretionary margins where slight price inflation or unexpected cost shifts consume 100% of discretionary allowance.
- Absolute fixed costs (e.g., rent, utility baselines) represent a much higher percentage of income for lower-income accounts, reducing behavioral flexibility.

### 2. Unavoidable Expenses & Category Protection
Unavoidable life events (such as medical care, emergency home or vehicle repairs, or family care obligations) can cause sudden spending spikes that look like discretionary budget variance to naive algorithms.
- **Current Safeguard**: G-Core implements a `protectedFlag` filter for healthcare expenses.
- **Unresolved Challenge**: Identifying non-healthcare unavoidable costs (e.g., utility rate surges, mandatory educational fees) without requiring intrusive data collection or manual dispute processes.

### 3. Thin-File & New Account Initialization
Customers with short transactional histories (under 3 months) lack sufficient data to establish reliable personal baseline medians.
- Defaulting to population-average baselines can unfairly penalize low-income new accounts.
- Cold-start accounts require fallback evaluation rules that avoid issuing punitive classifications while historical data is gathered.

### 4. Category Misclassification & Merchant Noise
Automated category assignment relies on merchant category codes (MCC) and merchant string classification.
- Misclassifying an essential transaction (e.g., pharmacy purchase at a grocery store) as discretionary unfairly depresses the customer's budget discipline score.
- Model explainability and customer-facing reason codes are required so users can dispute or correct misclassifications without friction.

### 5. Potential Disparate Impact
If behavioral loyalty status influences secondary benefits (such as credit terms or fee waivers), any systematic bias in behavioral evaluation could produce disparate impact across protected demographic cohorts.

---

## Required Future Validation Steps

Before G-Core or any derived behavioral scoring engine could be evaluated for production banking environments, the following steps are mandatory:
1. **Demographic Disparate Impact Audit**: Testing evaluation distributions across income brackets, age cohorts, and regional demographics.
2. **Counterfactual Fairness Testing**: Evaluating whether identical behavioral patterns produce consistent scoring outcomes regardless of absolute income level.
3. **Dispute & Appeal Protocols**: Implementing automated dispute flows for misclassified transactions or protected expense overrides.
4. **Regulatory & Compliance Review**: Aligning evaluation logic with European consumer protection guidelines and non-discrimination mandates.
