import { BOQItem } from "./types/tender";

export function calculateTenderPricing(input: {
  boq: BOQItem[];
  regionMultiplier: number;
  targetMargin: number;
}) {
  const baseCost = input.boq.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceEUR,
    0
  );

  const adjustedCost = baseCost * input.regionMultiplier;

  const bid = adjustedCost * (1 + input.targetMargin / 100);

  return {
    baseCost,
    adjustedCost,
    suggestedBid: bid,
    margin: input.targetMargin,
  };
}

export function computeRisk(input: {
  boqCompleteness: number; // 0-1
  complianceIssues: number;
  missingCertifications: number;
  regionComplexity: number;
}) {
  const score =
    input.complianceIssues * 25 +
    input.missingCertifications * 25 +
    (1 - input.boqCompleteness) * 30 +
    input.regionComplexity * 20;

  return Math.min(100, Math.max(0, score));
}

export function computeWinProbability(input: {
  priceCompetitiveness: number;
  riskScore: number;
  regionStrength: number;
}) {
  return Math.max(
    0,
    Math.min(
      100,
      70 +
        input.priceCompetitiveness * 0.2 -
        input.riskScore * 0.4 +
        input.regionStrength * 0.3
    )
  );
}
