"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Brain,
  Zap,
  ChevronRight,
  Trophy,
  BarChart3,
  ArrowRight,
  Sparkles,
  Lightbulb,
  Shield
} from "lucide-react";
import { analyzeWinProbability, WinProbabilityAnalysis } from "@/lib/ai-service";
import { Tender } from "@/lib/types/tender";
import { cn } from "@/lib/utils";

interface WinProbabilityPanelProps {
  tender: Tender;
  onMarginChange?: (margin: number) => void;
}

export function WinProbabilityPanelV2({ tender, onMarginChange }: WinProbabilityPanelProps) {
  const [analysis, setAnalysis] = useState<WinProbabilityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<"conservative" | "balanced" | "aggressive">("balanced");
  const [showDetails, setShowDetails] = useState(false);

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

  const getWinRateGradient = (probability: number) => {
    if (probability >= 70) return "from-emerald-500/20 to-emerald-600/10";
    if (probability >= 40) return "from-amber-500/20 to-amber-600/10";
    return "from-red-500/20 to-red-600/10";
  };

  const getWinRateBorder = (probability: number) => {
    if (probability >= 70) return "border-emerald-500/30";
    if (probability >= 40) return "border-amber-500/30";
    return "border-red-500/30";
  };

  const getScenarioIcon = (scenario: string) => {
    switch (scenario) {
      case "conservative": return Shield;
      case "balanced": return Target;
      case "aggressive": return Zap;
      default: return Target;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-b from-zinc-900 to-zinc-950",
        "border border-zinc-800/80"
      )}
    >
      {/* Ambient Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className={cn(
            "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl",
            analysis ? getWinRateGradient(analysis.winProbability) : "from-zinc-700/20 to-zinc-800/10"
          )}
        />
      </div>

      {/* Header */}
      <div className="relative p-5 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
                <Brain className="w-5 h-5 text-violet-400" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-violet-400/20 rounded-xl blur-md"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">AI Win Predictor</h3>
              <p className="text-[10px] text-zinc-500">Powered by Mistral AI</p>
            </div>
          </div>

          {!analysis && !loading && (
            <motion.button
              onClick={handleAnalyze}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold",
                "bg-gradient-to-r from-violet-500 to-purple-600",
                "text-white shadow-lg shadow-violet-500/25",
                "hover:shadow-violet-500/40 transition-all"
              )}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Analyze
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative p-5">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative w-12 h-12"
            >
              <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent" />
            </motion.div>
            <p className="text-xs text-zinc-500">AI analyzing tender factors...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Analysis Result */}
        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Main Probability Display */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={cn(
                  "relative rounded-2xl p-5 overflow-hidden",
                  "bg-gradient-to-br",
                  getWinRateGradient(analysis.winProbability),
                  "border",
                  getWinRateBorder(analysis.winProbability)
                )}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>

                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className={cn("w-4 h-4", getWinRateColor(analysis.winProbability))} />
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Win Probability</span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-baseline gap-2"
                    >
                      <span className={cn("text-4xl font-bold tracking-tight", getWinRateColor(analysis.winProbability))}>
                        {analysis.winProbability}%
                      </span>
                      <span className="text-xs text-zinc-500">chance</span>
                    </motion.div>
                  </div>

                  {/* Circular Progress */}
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-zinc-800"
                      />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - analysis.winProbability / 100)}
                        className={getWinRateColor(analysis.winProbability)}
                        initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - analysis.winProbability / 100) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Scenario Cards */}
              <div className="grid grid-cols-3 gap-2">
                {(["conservative", "balanced", "aggressive"] as const).map((scenario, idx) => {
                  const data = analysis.scenarioAnalysis[scenario];
                  const isActive = activeScenario === scenario;
                  const Icon = getScenarioIcon(scenario);
                  
                  return (
                    <motion.button
                      key={scenario}
                      onClick={() => handleApplyScenario(scenario)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative p-3 rounded-xl border text-left transition-all",
                        isActive
                          ? "bg-zinc-800 border-zinc-700 shadow-lg shadow-zinc-900/50"
                          : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-800/50"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className={cn(
                          "w-3.5 h-3.5",
                          isActive ? "text-violet-400" : "text-zinc-500"
                        )} />
                        <span className={cn(
                          "text-[10px] uppercase font-bold tracking-wider",
                          isActive ? "text-zinc-200" : "text-zinc-500"
                        )}>
                          {scenario}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-zinc-100">{data.margin}%</div>
                        <div className={cn(
                          "text-[10px] font-mono",
                          getWinRateColor(data.winProbability)
                        )}>
                          {data.winProbability}% win
                        </div>
                      </div>

                      {isActive && (
                        <motion.div
                          layoutId="activeScenario"
                          className="absolute inset-0 rounded-xl border-2 border-violet-500/30"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Factor Analysis */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Factor Analysis</span>
                  <motion.div
                    animate={{ rotate: showDetails ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-2">
                        {analysis.factorBreakdown.slice(0, 4).map((factor, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              factor.impact > 0 ? "bg-emerald-500/10" : 
                              factor.impact < 0 ? "bg-red-500/10" : "bg-zinc-800"
                            )}>
                              {factor.impact > 0 ? (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                              ) : factor.impact < 0 ? (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-zinc-300">{factor.factor}</span>
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded font-mono",
                                  factor.impact > 0 ? "text-emerald-400 bg-emerald-500/10" :
                                  factor.impact < 0 ? "text-red-400 bg-red-500/10" :
                                  "text-zinc-400 bg-zinc-800"
                                )}>
                                  {factor.impact > 0 ? "+" : ""}{factor.impact}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 truncate">{factor.explanation}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* AI Recommendations */}
              {analysis.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-violet-300">AI Recommendations</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.recommendations.slice(0, 2).map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle className={cn(
                          "w-4 h-4 shrink-0 mt-0.5",
                          rec.impact === "high" ? "text-emerald-400" : "text-violet-400"
                        )} />
                        <div>
                          <span className={cn(
                            "font-medium",
                            rec.impact === "high" ? "text-emerald-400" : "text-zinc-300"
                          )}>
                            {rec.action}
                          </span>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{rec.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
