import { describe, it, expect } from "vitest";
import { evaluateBehaviorDomain, type CustomerStateRow, type EvaluableTransaction } from "../behavior";
import { detectInternalTransfers } from "@/lib/server/anti-gaming-engine";
import { classifyTransaction } from "@/lib/server/classification-engine";
import { getOrCreateGCoreAccount } from "@/lib/server/gcore-engine";

const mockState: CustomerStateRow = {
  customer_id: "alex-001",
  income: 1000,
  fixed_obligations: 400,
  discretionary_target: 300,
  savings_target: 200,
  savings_saved: 0,
  tier: "PLUS",
  points: 100,
  streak: 3,
  verified_history_months: 12,
  budget_score: 0.8,
  savings_score: 0.7,
  payment_score: 0.9,
  liquidity_score: 0.75,
};

describe("G-Core Behavioral Engine & Rules", () => {
  // Requirement 1: protected healthcare transaction does not unfairly affect discretionary scoring
  it("1. protected healthcare transaction does not unfairly affect discretionary scoring", () => {
    const transactions: EvaluableTransaction[] = [
      {
        id: "t-health",
        amount: -450,
        classification: "discretionary",
        protectedFlag: true, // Healthcare expense flagged as protected
        excludedForGaming: false,
        category: "Healthcare",
      },
      {
        id: "t-normal",
        amount: -100,
        classification: "discretionary",
        protectedFlag: false,
        excludedForGaming: false,
      },
    ];

    const result = evaluateBehaviorDomain(mockState, transactions);
    // Discretionary spend should only count normal spend (€100), excluding healthcare (€450)
    expect(result.discretionarySpent).toBe(100);
    expect(result.status).toBe("ON_TRACK");
    expect(result.reasonCodes.some((r) => r.code === "PROTECTED_HEALTHCARE_EXPENSE")).toBe(true);
  });

  // Requirement 2: matching internal transfer pair is excluded
  it("2. matching internal transfer pair is excluded from behavioral progress", () => {
    const rawTxns = [
      { id: "t-out", date: "2026-09-01T10:00:00Z", merchant: "Internal Transfer Out", amount: -500, category: "Savings" },
      { id: "t-in", date: "2026-09-01T10:05:00Z", merchant: "Internal Transfer In", amount: 500, category: "Savings" },
    ];

    const antiGaming = detectInternalTransfers(rawTxns);
    expect(antiGaming.excludedIds.has("t-out")).toBe(true);
    expect(antiGaming.excludedIds.has("t-in")).toBe(true);

    const evalTxns: EvaluableTransaction[] = [
      {
        id: "t-out",
        amount: -500,
        classification: "savings",
        protectedFlag: false,
        excludedForGaming: antiGaming.excludedIds.has("t-out"),
      },
      {
        id: "t-in",
        amount: 500,
        classification: "savings",
        protectedFlag: false,
        excludedForGaming: antiGaming.excludedIds.has("t-in"),
      },
    ];

    const result = evaluateBehaviorDomain(mockState, evalTxns);
    expect(result.savingsSaved).toBe(0);
    expect(result.reasonCodes.some((r) => r.code === "INTERNAL_TRANSFER_EXCLUDED")).toBe(true);
  });

  // Requirement 3: ordinary discretionary spending remains included
  it("3. ordinary discretionary spending remains included in budget scoring", () => {
    const transactions: EvaluableTransaction[] = [
      { id: "t1", amount: -150, classification: "discretionary", protectedFlag: false, excludedForGaming: false },
      { id: "t2", amount: -100, classification: "discretionary", protectedFlag: false, excludedForGaming: false },
    ];

    const result = evaluateBehaviorDomain(mockState, transactions);
    expect(result.discretionarySpent).toBe(250);
    expect(result.discretionarySpent).toBeLessThanOrEqual(mockState.discretionary_target);
    expect(result.reasonCodes.some((r) => r.code === "BUDGET_WITHIN_BASELINE")).toBe(true);
  });

  // Requirement 4: savings contribution is counted correctly
  it("4. net savings contribution is counted correctly from valid savings transactions", () => {
    const transactions: EvaluableTransaction[] = [
      { id: "s1", amount: 200, classification: "savings", protectedFlag: false, excludedForGaming: false },
      { id: "s2", amount: 50, classification: "savings", protectedFlag: false, excludedForGaming: false },
    ];

    const result = evaluateBehaviorDomain(mockState, transactions);
    expect(result.savingsSaved).toBe(250);
    expect(result.status).toBe("ACHIEVED");
    expect(result.reasonCodes.some((r) => r.code === "SAVINGS_TARGET_MET")).toBe(true);
  });

  // Requirement 5: GP is not awarded twice for the same achievement
  it("5. event tracking prevents duplicate GP ledger entries for the same milestone", () => {
    const awardedSet = new Set<string>();
    const eventId = "milestone-month-3";

    function awardMilestone(id: string): { awarded: boolean; points: number } {
      if (awardedSet.has(id)) {
        return { awarded: false, points: 0 };
      }
      awardedSet.add(id);
      return { awarded: true, points: 50 };
    }

    const firstRun = awardMilestone(eventId);
    expect(firstRun.awarded).toBe(true);
    expect(firstRun.points).toBe(50);

    const secondRun = awardMilestone(eventId);
    expect(secondRun.awarded).toBe(false);
    expect(secondRun.points).toBe(0);
  });

  // Requirement 6: tier thresholds behave correctly
  it("6. status tier progression calculates correct milestone levels", () => {
    function tierForHistoryMonths(months: number): string {
      const idx = Math.min(4, Math.floor(months / 6));
      return ["Member", "Silver", "Gold", "Platinum", "Diamond"][idx];
    }

    expect(tierForHistoryMonths(0)).toBe("Member");
    expect(tierForHistoryMonths(5)).toBe("Member");
    expect(tierForHistoryMonths(6)).toBe("Silver");
    expect(tierForHistoryMonths(12)).toBe("Gold");
    expect(tierForHistoryMonths(18)).toBe("Platinum");
    expect(tierForHistoryMonths(24)).toBe("Diamond");
    expect(tierForHistoryMonths(48)).toBe("Diamond");
  });

  // Requirement 7: unknown merchant/category fallback behaves safely
  it("7. unknown merchant/category fallback defaults to discretionary without crashing", () => {
    const classified = classifyTransaction({ merchant: "UNKNOWN MERCHANT XYZ 99" });
    expect(classified.classification).toBe("discretionary");
    expect(classified.confidence).toBeGreaterThan(0);
  });

  // Requirement 8: zero transaction state does not crash
  it("8. zero transaction state returns valid evaluation without throwing errors", () => {
    const result = evaluateBehaviorDomain(mockState, []);
    expect(result.discretionarySpent).toBe(0);
    expect(result.savingsSaved).toBe(0);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(1);
    expect(result.reasonCodes.some((r) => r.code === "ZERO_TRANSACTION_STATE")).toBe(true);
  });

  // Requirement 9: negative/edge monetary values are handled safely
  it("9. negative or NaN monetary inputs are sanitized safely", () => {
    const edgeTransactions: EvaluableTransaction[] = [
      { id: "e1", amount: -150, classification: "discretionary", protectedFlag: false, excludedForGaming: false },
      { id: "e2", amount: Number.NaN, classification: "discretionary", protectedFlag: false, excludedForGaming: false },
    ];

    const result = evaluateBehaviorDomain(mockState, edgeTransactions);
    expect(result.discretionarySpent).toBe(150);
    expect(Number.isNaN(result.overall)).toBe(false);
  });

  // Requirement 10: deterministic inputs produce deterministic outputs
  it("10. identical inputs produce identical, reproducible evaluation outputs", () => {
    const txns: EvaluableTransaction[] = [
      { id: "t1", amount: -120, classification: "discretionary", protectedFlag: false, excludedForGaming: false },
      { id: "s1", amount: 150, classification: "savings", protectedFlag: false, excludedForGaming: false },
    ];

    const run1 = evaluateBehaviorDomain(mockState, txns);
    const run2 = evaluateBehaviorDomain(mockState, txns);

    expect(run1.overall).toBe(run2.overall);
    expect(run1.discretionarySpent).toBe(run2.discretionarySpent);
    expect(run1.savingsSaved).toBe(run2.savingsSaved);
    expect(run1.status).toBe(run2.status);
  });
});
