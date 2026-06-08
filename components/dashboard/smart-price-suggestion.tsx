"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { predictPrice, getConfidenceColor, getVarianceIndicator, PricePrediction } from "@/lib/ai-service";

interface SmartPriceSuggestionProps {
  itemDescription: string;
  quantity: number;
  unit: string;
  region: string;
  category: string;
  currentPrice?: number;
  onApplySuggestion?: (price: number) => void;
}

export function SmartPriceSuggestion({
  itemDescription,
  quantity,
  unit,
  region,
  category,
  currentPrice,
  onApplySuggestion,
}: SmartPriceSuggestionProps) {
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictPrice({
        itemDescription,
        quantity,
        unit,
        region,
        category,
      });
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (prediction && onApplySuggestion) {
      onApplySuggestion(prediction.suggestedPrice);
    }
  };

  const variance = currentPrice
    ? ((currentPrice - (prediction?.suggestedPrice || currentPrice)) / (prediction?.suggestedPrice || 1)) * 100
    : 0;

  const varianceIndicator = getVarianceIndicator(variance);

  return (
    <div className="space-y-3">
      {/* Suggestion Button */}
      <button
        onClick={handleGetSuggestion}
        disabled={loading}
        className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all text-xs font-medium text-zinc-400 hover:text-zinc-200"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:animate-pulse" />
        {loading ? "Analyzing..." : "AI Price Suggestion"}
      </button>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-red-400"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </motion.div>
      )}

      {/* Prediction Result */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.confidence} Confidence
                </span>
                <span className="text-xs text-zinc-500">
                  {prediction.confidenceScore}%
                </span>
              </div>
              {currentPrice && (
                <div className={`flex items-center gap-1 text-xs ${varianceIndicator.color}`}>
                  <span>{varianceIndicator.icon}</span>
                  <span>{Math.abs(variance).toFixed(1)}% {varianceIndicator.text}</span>
                </div>
              )}
            </div>

            {/* Suggested Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-100">
                €{prediction.suggestedPrice.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500">/ {unit}</span>
            </div>

            {/* Market Range */}
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Market range: €{prediction.marketRange.min.toFixed(2)} - €{prediction.marketRange.max.toFixed(2)}</span>
            </div>

            {/* Factors */}
            {prediction.factors.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                {prediction.factors.slice(0, 2).map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    {factor.impact === "positive" && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                    {factor.impact === "negative" && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}
                    {factor.impact === "neutral" && <div className="w-3.5 h-3.5 rounded-full bg-zinc-600 shrink-0 mt-0.5" />}
                    <span className="text-zinc-400">{factor.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reasoning */}
            {prediction.reasoning && (
              <p className="text-xs text-zinc-500 italic pt-1">{prediction.reasoning}</p>
            )}

            {/* Apply Button */}
            {onApplySuggestion && (
              <button
                onClick={handleApply}
                className="w-full py-2 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Apply Suggested Price
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
