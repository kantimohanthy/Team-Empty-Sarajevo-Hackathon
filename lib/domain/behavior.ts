import {
  BEHAVIOR_MODEL_VERSION,
  MODEL_METADATA,
  BehaviorReasonDetail,
} from "./model-metadata";
import type { Classification, PlanStatus } from "@/lib/types";

export interface CustomerStateRow {
  customer_id: string;
  income: number;
  fixed_obligations: number;
  discretionary_target: number;
  savings_target: number;
  savings_saved: number;
  tier: string;
  points: number;
  streak: number;
  verified_history_months: number;
  budget_score: number;
  savings_score: number;
  payment_score: number;
  liquidity_score: number;
}

export interface EvaluableTransaction {
  id: string;
  amount: number;
  classification: Classification;
  protectedFlag: boolean;
  excludedForGaming: boolean;
  category?: string;
  merchant?: string;
}

export interface BehaviorDimensionResult {
  label: string;
  key: "budget" | "savings" | "payment" | "liquidity" | "goal";
  score: number; // 0-1
  weight: number; // contribution to overall, 0-1
  value: "STRONG" | "MODERATE" | "DEVELOPING";
}

export interface BehaviorEvaluation {
  modelVersion: string;
  discretionarySpent: number;
  savingsSaved: number;
  status: PlanStatus;
  overall: number; // 0-1
  dimensions: BehaviorDimensionResult[];
  reasonCodes: BehaviorReasonDetail[];
}

const WEIGHTS = MODEL_METADATA.weights;

function tierFor(score: number): "STRONG" | "MODERATE" | "DEVELOPING" {
  if (score >= 0.75) return "STRONG";
  if (score >= 0.5) return "MODERATE";
  return "DEVELOPING";
}

export function evaluateBehaviorDomain(
  state: CustomerStateRow,
  transactions: EvaluableTransaction[]
): BehaviorEvaluation {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const reasonCodes: BehaviorReasonDetail[] = [];

  if (safeTransactions.length === 0) {
    reasonCodes.push({
      code: "ZERO_TRANSACTION_STATE",
      message: "No transactions processed in current evaluation window.",
    });
  }

  for (const t of safeTransactions) {
    if (t.protectedFlag) {
      if (!reasonCodes.some((r) => r.code === "PROTECTED_HEALTHCARE_EXPENSE")) {
        reasonCodes.push({
          code: "PROTECTED_HEALTHCARE_EXPENSE",
          message: "Healthcare expense recognized as protected and excluded from discretionary budget penalty.",
        });
      }
    }
    if (t.excludedForGaming) {
      if (!reasonCodes.some((r) => r.code === "INTERNAL_TRANSFER_EXCLUDED")) {
        reasonCodes.push({
          code: "INTERNAL_TRANSFER_EXCLUDED",
          message: "Matching internal transfer detected and excluded from behavioral progress.",
        });
      }
    }
  }

  const discretionarySpent = safeTransactions
    .filter(
      (t) =>
        t.classification === "discretionary" &&
        !t.protectedFlag &&
        !t.excludedForGaming
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const savingsSaved = safeTransactions
    .filter((t) => t.classification === "savings" && !t.excludedForGaming)
    .reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);

  const target = Math.max(0, Number(state.discretionary_target) || 0);
  const savingsTarget = Math.max(0, Number(state.savings_target) || 0);

  const overspend = discretionarySpent > target;
  const goalMet = savingsTarget > 0 ? savingsSaved >= savingsTarget : true;
  const status: PlanStatus = overspend ? "AT_RISK" : goalMet ? "ACHIEVED" : "ON_TRACK";

  if (overspend) {
    reasonCodes.push({
      code: "DISCRETIONARY_OVERSPEND_EXCEEDED",
      message: `Discretionary spend (€${discretionarySpent.toFixed(2)}) exceeded baseline target (€${target.toFixed(2)}).`,
    });
  } else {
    reasonCodes.push({
      code: "BUDGET_WITHIN_BASELINE",
      message: "Discretionary spending strictly within baseline target limit.",
    });
  }

  if (goalMet) {
    reasonCodes.push({
      code: "SAVINGS_TARGET_MET",
      message: "Monthly net savings contribution target achieved.",
    });
  }

  if ((state.payment_score ?? 0) >= 0.7) {
    reasonCodes.push({
      code: "PAYMENT_CONSISTENT",
      message: "On-time settlement of fixed obligations maintained.",
    });
  }

  const goalProgress = savingsTarget <= 0 ? 1 : Math.min(1, savingsSaved / savingsTarget);

  const rawDimensions: { label: string; key: BehaviorDimensionResult["key"]; score: number }[] = [
    { label: "Budget consistency", key: "budget", score: Math.max(0, Math.min(1, Number(state.budget_score) || 0)) },
    { label: "Savings consistency", key: "savings", score: Math.max(0, Math.min(1, Number(state.savings_score) || 0)) },
    { label: "Payment regularity", key: "payment", score: Math.max(0, Math.min(1, Number(state.payment_score) || 0)) },
    { label: "Liquidity stability", key: "liquidity", score: Math.max(0, Math.min(1, Number(state.liquidity_score) || 0)) },
    { label: "Goal completion", key: "goal", score: Math.max(0, Math.min(1, goalProgress)) },
  ];

  const dimensions: BehaviorDimensionResult[] = rawDimensions.map((d) => ({
    ...d,
    weight: WEIGHTS[d.key],
    value: tierFor(d.score),
  }));

  const overall =
    (Number(state.budget_score) || 0) * WEIGHTS.budget +
    (Number(state.savings_score) || 0) * WEIGHTS.savings +
    (Number(state.payment_score) || 0) * WEIGHTS.payment +
    (Number(state.liquidity_score) || 0) * WEIGHTS.liquidity +
    goalProgress * WEIGHTS.goal;

  return {
    modelVersion: BEHAVIOR_MODEL_VERSION,
    discretionarySpent,
    savingsSaved,
    status,
    overall: Math.max(0, Math.min(1, overall)),
    dimensions,
    reasonCodes,
  };
}
