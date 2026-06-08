"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Brain,
  ChevronDown,
  ChevronUp,
  Zap,
  Info
} from "lucide-react";
import { predictPrice, getConfidenceColor, PricePrediction } from "@/lib/ai-service";
import { cn } from "@/lib/utils";

interface SmartPriceSuggestionProps {
  itemDescription: string;
  quantity: number;
  unit: string;
  region: string;
  category: string;
  currentPrice?: number;
  onApplySuggestion?: (price: number) => void;
}

export function SmartPriceSuggestionV2({
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
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

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
      setExpanded(true);
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

  const isBelowMarket = variance < -5;
  const isAboveMarket = variance > 5;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Main Trigger Button */}
      {!prediction && !loading && (
        <motion.button
          onClick={handleGetSuggestion}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300",
            "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10",
            "border border-amber-500/20 hover:border-amber-500/40",
            "backdrop-blur-sm"
          )}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <motion.div
              className="absolute inset-0 bg-amber-400/30 rounded-full blur-sm"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-xs font-semibold text-amber-200">AI Price</span>
        </motion.button>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800"
        >
          <motion.div
            className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-xs text-zinc-400">AI analyzing...</span>
        </motion.div>
      )}

      {/* Prediction Card */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "absolute right-0 top-full mt-2 z-50 w-[380px]",
              "rounded-2xl overflow-hidden",
              "bg-gradient-to-b from-zinc-900 to-zinc-950",
              "border border-zinc-800/80",
              "shadow-2xl shadow-black/50"
            )}
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500" 
                 style={{ padding: '1px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} 
            />

            {/* Header */}
            <div className="relative p-4 border-b border-zinc-800/60 bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Brain className="w-5 h-5 text-amber-400" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-amber-400/20 rounded-full blur-md"
                    />
                  </div>
                  <span className="text-sm font-bold text-zinc-100">AI Price Analysis</span>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-bold uppercase border",
                  getConfidenceColor(prediction.confidence)
                )}>
                  {prediction.confidence} Confidence
                </div>
              </div>
              
              {/* Confidence Bar */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prediction.confidenceScore}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      prediction.confidenceScore >= 80 ? "bg-emerald-500" :
                      prediction.confidenceScore >= 60 ? "bg-amber-500" : "bg-orange-500"
                    )}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">{prediction.confidenceScore}%</span>
              </div>
            </div>

            {/* Main Price Display */}
            <div className="p-4 space-y-4">
              {/* Price Row */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Suggested Price</span>
                  <motion.div 
                    className="flex items-baseline gap-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="text-3xl font-bold text-white tracking-tight">
                      €{prediction.suggestedPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500">/ {unit}</span>
                  </motion.div>
                </div>

                {/* Variance Badge */}
                {currentPrice && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl",
                      isBelowMarket ? "bg-emerald-500/10 border border-emerald-500/20" :
                      isAboveMarket ? "bg-red-500/10 border border-red-500/20" :
                      "bg-zinc-800/50 border border-zinc-700/50"
                    )}
                  >
                    {isBelowMarket ? (
                      <TrendingDown className="w-4 h-4 text-emerald-400" />
                    ) : isAboveMarket ? (
                      <TrendingUp className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-zinc-400" />
                    )}
                    <span className={cn(
                      "text-sm font-bold",
                      isBelowMarket ? "text-emerald-400" :
                      isAboveMarket ? "text-red-400" :
                      "text-zinc-400"
                    )}>
                      {Math.abs(variance).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {isBelowMarket ? "Below market" : isAboveMarket ? "Above market" : "On target"}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Market Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Market Range</span>
                  <span className="text-zinc-400 font-mono">
                    €{prediction.marketRange.min.toFixed(0)} - €{prediction.marketRange.max.toFixed(0)}
                  </span>
                </div>
                <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                  {/* Market range bar */}
                  <div 
                    className="absolute h-full bg-zinc-700/50 rounded-full"
                    style={{
                      left: '10%',
                      right: '10%'
                    }}
                  />
                  {/* Suggested price marker */}
                  <motion.div
                    initial={{ left: '50%' }}
                    animate={{ 
                      left: `${((prediction.suggestedPrice - prediction.marketRange.min) / (prediction.marketRange.max - prediction.marketRange.min)) * 80 + 10}%` 
                    }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-lg shadow-amber-400/30 border-2 border-zinc-900"
                  />
                </div>
              </div>

              {/* Expandable Factors */}
              <div className="border-t border-zinc-800/60 pt-3">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>AI Analysis Details</span>
                  <span className="text-[10px] text-zinc-600">({prediction.factors.length} factors)</span>
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-2">
                        {prediction.factors.map((factor, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-2 p-2 rounded-lg bg-zinc-900/50"
                          >
                            {factor.impact === "positive" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : factor.impact === "negative" ? (
                              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                            )}
                            <span className="text-xs text-zinc-300 leading-relaxed">{factor.description}</span>
                          </motion.div>
                        ))}

                        {/* Reasoning */}
                        {prediction.reasoning && (
                          <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                            <p className="text-xs text-zinc-400 italic leading-relaxed">
                              <Zap className="w-3 h-3 inline mr-1 text-amber-400" />
                              {prediction.reasoning}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Apply Button */}
              {onApplySuggestion && (
                <motion.button
                  onClick={handleApply}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-bold text-sm",
                    "bg-gradient-to-r from-amber-500 to-orange-500",
                    "text-zinc-950 shadow-lg shadow-amber-500/20",
                    "hover:shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400",
                    "transition-all duration-300"
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Apply Suggested Price
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop blur when card is open */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPrediction(null)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
