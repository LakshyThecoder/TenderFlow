// AI Service utilities for smart features

export interface PricePrediction {
  suggestedPrice: number;
  confidence: "high" | "medium" | "low";
  confidenceScore: number;
  marketRange: { min: number; max: number };
  variance: number;
  factors: Array<{
    name: string;
    impact: "positive" | "negative" | "neutral";
    description: string;
  }>;
  reasoning: string;
}

export interface WinProbabilityAnalysis {
  winProbability: number;
  confidence: "high" | "medium" | "low";
  factorBreakdown: Array<{
    factor: string;
    impact: number;
    weight: number;
    explanation: string;
  }>;
  recommendations: Array<{
    action: string;
    impact: "high" | "medium" | "low";
    description: string;
  }>;
  optimalMargin: number;
  scenarioAnalysis: {
    conservative: { margin: number; winProbability: number };
    balanced: { margin: number; winProbability: number };
    aggressive: { margin: number; winProbability: number };
  };
}

export async function predictPrice(params: {
  itemDescription: string;
  quantity: number;
  unit: string;
  region: string;
  category?: string;
  historicalPrices?: number[];
}): Promise<PricePrediction> {
  const res = await fetch("/api/v1/ai/price-predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Price prediction failed: ${res.statusText}`);
  }

  return res.json();
}

export async function analyzeWinProbability(params: {
  tenderTitle: string;
  budgetEUR: number;
  marginPercent: number;
  riskScore: number;
  region: string;
  boqComplexity?: "low" | "medium" | "high";
  competitorCount?: number;
  companyExperience?: "low" | "medium" | "high";
  pastWinRate?: number;
}): Promise<WinProbabilityAnalysis> {
  const res = await fetch("/api/v1/ai/win-probability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Win probability analysis failed: ${res.statusText}`);
  }

  return res.json();
}

// Confidence badge colors
export function getConfidenceColor(confidence: string): string {
  switch (confidence) {
    case "high":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "low":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}

// Variance indicator
export function getVarianceIndicator(variance: number): {
  color: string;
  icon: string;
  text: string;
} {
  if (Math.abs(variance) < 5) {
    return { color: "text-emerald-400", icon: "≈", text: "On target" };
  } else if (variance < 0) {
    return { color: "text-amber-400", icon: "↓", text: "Below market" };
  } else {
    return { color: "text-red-400", icon: "↑", text: "Above market" };
  }
}
