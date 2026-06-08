"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Brain } from "lucide-react";
import { analyzeWinProbability, WinProbabilityAnalysis } from "@/lib/ai-service";
import { Tender } from "@/lib/types/tender";

interface WinProbabilityPanelProps {
  tender: Tender;
  onMarginChange?: (margin: number) => void;
}

export function WinProbabilityPanel({ tender, onMarginChange }: WinProbabilityPanelProps) {
  const [analysis, setAnalysis] = useState<WinProbabilityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<"conservative" | "balanced" | "aggressive">("balanced");

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const boqComplexity = tender.boq.length > 20 ? "high" : tender.boq.length > 10 ? "medium" : "low";
      const result = await analyzeWinProbability({
        tenderTitle: tender.title,
        budgetEUR: tender.budgetEUR,
        marginPercent: tender.computed.marginPercent,
        riskScore: tender.computed.riskScore,
        region: tender.region,
        boqComplexity,
      });
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyScenario = (scenario: "conservative" | "balanced" | "aggressive") => {
    if (analysis && onMarginChange) {
      const margin = analysis.scenarioAnalysis[scenario].margin;
      onMarginChange(margin);
      setActiveScenario(scenario);
    }
  };

  const getWinRateColor = (probability: number) => {
    if (probability >= 70) return "text-emerald-400";
    if (probability >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getWinRateBg = (probability: number) => {
    if (probability >= 70) return "bg-emerald-500/20 border-emerald-500/30";
    if (probability >= 40) return "bg-amber-500/20 border-amber-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">AI Win Probability</h3>
        </div>
        {!analysis && !loading && (
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 transition-all"
          >
            <Target className="w-3.5 h-3.5" />
            Analyze
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 py-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Analysis Result */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Main Probability */}
            <div className={`rounded-xl border p-4 ${getWinRateBg(analysis.winProbability)}`}>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${getWinRateColor(analysis.winProbability)}`}>
                  {analysis.winProbability}%
                </span>
                <span className="text-xs text-zinc-500 uppercase">Win Probability</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Based on {analysis.factorBreakdown.length} factors analyzed by AI
              </p>
            </div>

            {/* Scenario Analysis */}
            <div className="grid grid-cols-3 gap-2">
              {(["conservative", "balanced", "aggressive"] as const).map((scenario) => {
                const data = analysis.scenarioAnalysis[scenario];
                const isActive = activeScenario === scenario;
                return (
                  <button
                    key={scenario}
                    onClick={() => handleApplyScenario(scenario)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isActive
                        ? "bg-zinc-800 border-zinc-700"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">
                      {scenario}
                    </div>
                    <div className="text-sm font-bold text-zinc-200">{data.margin}%</div>
                    <div className={`text-xs ${getWinRateColor(data.winProbability)}`}>
                      {data.winProbability}% win
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Factor Breakdown */}
            {analysis.factorBreakdown.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-500 uppercase">Key Factors</h4>
                {analysis.factorBreakdown.slice(0, 3).map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    {factor.impact > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : factor.impact < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-zinc-300 font-medium">{factor.factor}</span>
                      <span className="text-zinc-500"> • {factor.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-500 uppercase">AI Recommendations</h4>
                {analysis.recommendations.slice(0, 2).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className={`font-medium ${
                        rec.impact === "high" ? "text-emerald-400" : "text-zinc-300"
                      }`}>
                        {rec.action}
                      </span>
                      <span className="text-zinc-500"> • {rec.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
