import {
  evaluateBehaviorDomain,
  type CustomerStateRow,
  type EvaluableTransaction,
  type BehaviorDimensionResult,
  type BehaviorEvaluation,
} from "@/lib/domain/behavior";
import { BEHAVIOR_MODEL_VERSION } from "@/lib/domain/model-metadata";

export type {
  CustomerStateRow,
  EvaluableTransaction,
  BehaviorDimensionResult,
  BehaviorEvaluation,
};

export const MODEL_VERSION = BEHAVIOR_MODEL_VERSION;

export function evaluateBehavior(
  state: CustomerStateRow,
  transactions: EvaluableTransaction[]
): BehaviorEvaluation {
  return evaluateBehaviorDomain(state, transactions);
}
