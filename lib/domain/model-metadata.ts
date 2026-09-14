/**
 * G-Core Behavioral Model Versioning & Reason Code Metadata
 */

export const BEHAVIOR_MODEL_VERSION = "v0.1-hackathon-baseline";

export interface BehaviorModelMetadata {
  version: string;
  weights: {
    budget: number;
    savings: number;
    payment: number;
    liquidity: number;
    goal: number;
  };
  assumptions: string[];
  knownLimitations: string[];
}

export const MODEL_METADATA: BehaviorModelMetadata = {
  version: BEHAVIOR_MODEL_VERSION,
  weights: {
    budget: 0.30,
    savings: 0.20,
    payment: 0.25,
    liquidity: 0.15,
    goal: 0.10,
  },
  assumptions: [
    "Weights are prototype design parameters for the 24-hour hackathon MVP.",
    "Discretionary and savings targets are evaluated against personal baseline medians.",
    "Protected healthcare expenses are excluded from discretionary budget penalty calculations.",
    "Matching internal transfers between accounts are excluded from savings progress.",
  ],
  knownLimitations: [
    "Weights are not empirically calibrated banking-risk coefficients or credit-scoring models.",
    "System evaluates behavioral consistency for rewards, not credit default risk.",
    "Requires longitudinal multi-month financial data for empirical calibration.",
  ],
};

export type ReasonCode =
  | "PROTECTED_HEALTHCARE_EXPENSE"
  | "INTERNAL_TRANSFER_EXCLUDED"
  | "BUDGET_WITHIN_BASELINE"
  | "DISCRETIONARY_OVERSPEND_EXCEEDED"
  | "PAYMENT_CONSISTENT"
  | "SAVINGS_TARGET_MET"
  | "UNKNOWN_CATEGORY_FALLBACK"
  | "ZERO_TRANSACTION_STATE";

export interface BehaviorReasonDetail {
  code: ReasonCode;
  message: string;
}
