"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, ShieldCheck, ShieldAlert, ArrowRight, BookOpen, AlertTriangle } from "lucide-react"
import { Tender, RiskItem } from "@/lib/types/tender"
import { useLanguage } from "@/lib/LanguageContext"

interface CopilotDrawerProps {
  isOpen: boolean
  onClose: () => void
  tender: Tender
  selectedRisk: RiskItem | null
  onResolveRisk: (riskId: string) => void
}

export function CopilotDrawer({
  isOpen,
  onClose,
  tender,
  selectedRisk,
  onResolveRisk,
}: CopilotDrawerProps) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<{ sender: "ai" | "user"; text: string; time: string }[]>([])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      
      // Load contextual conversation based on active project / risk
      if (selectedRisk) {
        setMessages([
          {
            sender: "ai",
            text: `Ho esaminato l'anomalia "${selectedRisk.code}" relativa a CIG ${tender.cig || "N/A"}. Categoria di severità: ${selectedRisk.level.toUpperCase()}.`,
            time: "Oggi 19:15",
          },
          {
            sender: "ai",
            text: `Dettagli Capitolato: "${selectedRisk.message}"`,
            time: "Oggi 19:15",
          },
          {
            sender: "ai",
            text: `Risoluzione Consigliata: ${selectedRisk.resolutionHint || "Nessuna soluzione automatica definita."}`,
            time: "Oggi 19:16",
          }
        ])
      } else {
        const flaggedRisksCount = tender.riskItems.filter(r => r.status === "Flagged").length
        const complianceScore = Math.round(
          ((tender.riskItems.length - flaggedRisksCount) /
            (tender.riskItems.length || 1)) *
            100
        )
        setMessages([
          {
            sender: "ai",
            text: `Bentornato. Sto monitorando la gara "${tender.title}". Attualmente sono presenti ${flaggedRisksCount} anomalie aperte. Il punteggio di conformità attuale è del ${complianceScore}%.`,
            time: "Oggi 19:15",
          },
          {
            sender: "ai",
            text: flaggedRisksCount > 0 
              ? "Ti consiglio di risolvere l'anomalia bloccante sul DURC dei subappaltatori per aumentare l'indice di vittoria."
              : "Tutti i requisiti normativi sembrano soddisfatti per questo bando.",
            time: "Oggi 19:15",
          }
        ])
      }
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, selectedRisk, tender])

  if (!isOpen) return null

  const flaggedRisksCount = tender.riskItems.filter(r => r.status === "Flagged").length

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-zinc-950/95 border-l border-zinc-900 h-full relative z-10 flex flex-col justify-between shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Sparkles className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Gemini Compliance Copilot</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Analisi documentale in tempo reale</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Chat / Commentary Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 scrollbar-hidden" data-lenis-prevent>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-zinc-50 rounded-tr-none shadow-lg shadow-blue-600/10"
                      : "bg-[#09090b]/80 border border-zinc-900 text-zinc-350 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-zinc-650 mt-1 font-mono">{msg.time}</span>
              </div>
            ))}

            {selectedRisk && selectedRisk.status === "Flagged" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-500/[0.02] border border-blue-500/20 rounded-2xl p-5 space-y-4 shadow-lg glow-navy"
              >
                <div className="flex items-center gap-2 text-blue-400">
                  <BookOpen className="w-4 h-4" />
                  <h4 className="text-[10px] font-bold uppercase tracking-wider">Azione Risolutiva AI</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-normal">
                  Cliccando sul pulsante sottostante, applicherai le direttive suggerite dall'AI per sanare la conformità del lotto.
                </p>
                <button
                  onClick={() => {
                    onResolveRisk(selectedRisk.id)
                    onClose()
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-zinc-50 font-bold text-xs transition-all shadow-md shadow-blue-600/20 border-t border-white/10 cursor-pointer"
                >
                  Applica Risoluzione <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {!selectedRisk && flaggedRisksCount > 0 && (
              <div className="space-y-3 pt-3">
                <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest px-1">Verifiche Critiche Attive</p>
                <div className="space-y-2">
                  {tender.riskItems.filter(r => r.status === "Flagged").map(risk => (
                    <div
                      key={risk.id}
                      className="p-3 bg-[#070709] border border-zinc-900 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-300 truncate">{risk.message.split(" - ")[0]}</p>
                        <p className="text-[9px] text-red-400 mt-0.5 uppercase tracking-wider font-mono flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {risk.level.toUpperCase()} Severity
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onResolveRisk(risk.id)
                          onClose()
                        }}
                        className="text-[9px] bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Risolvi
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Input placeholder */}
          <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex items-center gap-3">
            <input
              type="text"
              disabled
              placeholder="Chiedi al Copilot... (es: 'Controlla requisiti SOA')"
              className="flex-1 bg-zinc-900/60 border border-zinc-850/60 rounded-xl px-3 py-2 text-xs text-zinc-500 focus:outline-none focus:ring-0 placeholder-zinc-650"
            />
            <button
              disabled
              className="p-2 bg-zinc-900 text-zinc-700 rounded-xl border border-zinc-850/80"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
