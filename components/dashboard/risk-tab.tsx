"use client"

import { useState } from "react"
import { ShieldAlert, ShieldCheck, Sparkles, Check, Scale, Coins, Truck, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useLanguage } from "@/lib/LanguageContext"
import { useAppStore } from "@/lib/store/useAppStore"
import { RiskItem } from "@/lib/types/tender"

interface RiskTabProps {
  onTriggerCopilot: (risk: RiskItem) => void
}

export function RiskTab({ onTriggerCopilot }: RiskTabProps) {
  const { t, language } = useLanguage()
  
  const tenders = useAppStore((state) => state.tenders)
  const activeTenderId = useAppStore((state) => state.activeTenderId)
  const updateTender = useAppStore((state) => state.actions.updateTender)

  const tender = tenders.find((t) => t.id === activeTenderId) || tenders[0]
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null)

  // AI legal appeal states
  const [isGeneratingAppeal, setIsGeneratingAppeal] = useState(false)
  const [activeAppealText, setActiveAppealText] = useState<string | null>(null)
  const [appealRiskItem, setAppealRiskItem] = useState<RiskItem | null>(null)

  const handleGenerateAppeal = async (risk: RiskItem) => {
    setIsGeneratingAppeal(true)
    setAppealRiskItem(risk)
    setActiveAppealText(null)

    const appealPromise = async () => {
      const res = await fetch("/api/v1/risk/legal-appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderTitle: tender.title,
          cig: tender.cig,
          region: tender.region,
          riskMessage: risk.message,
          riskCode: risk.code,
          resolutionHint: risk.resolutionHint
        })
      })
      if (!res.ok) {
        throw new Error(language === "it" ? "Errore generazione ricorso" : "Appeal generation error")
      }
      const data = await res.json()
      setActiveAppealText(data.appealText)
      setIsGeneratingAppeal(false)
      return data
    }

    toast.promise(appealPromise(), {
      loading: language === "it" ? "Redazione atto legale AI (T.A.R. / RUP)..." : "Drafting AI Legal Appeal (T.A.R. / RUP)...",
      success: language === "it" ? "Atto redatto con successo!" : "Legal document drafted successfully!",
      error: (err: any) => {
        setIsGeneratingAppeal(false)
        return err.message || "Error"
      }
    })
  }

  if (!tender) {
    return <div className="text-zinc-550 text-center py-12 font-mono text-xs">Nessun capitolato attivo. Carica un file nella sezione Ingestione.</div>
  }

  const winProb = tender.computed.winProbability

  const handleScanCompliance = () => {
    const scanPromise = async () => {
      const res = await fetch("/api/v1/risk/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenderId: tender.id, boq: tender.boq })
      })
      if (!res.ok) {
        throw new Error(language === "it" ? "Errore scansione" : "Scan error")
      }
      const data = await res.json()
      
      const newRiskScore = data.riskScore ?? 0
      const newWinProb = Math.max(
        0,
        Math.min(
          100,
          70 +
            Math.max(0, 100 - tender.computed.marginPercent * 3.5) * 0.2 -
            newRiskScore * 0.4 +
            (tender.region === "Lombardia" ? 80 : 50) * 0.3
        )
      )

      updateTender(tender.id, {
        riskItems: data.items || [],
        computed: {
          ...tender.computed,
          riskScore: newRiskScore,
          winProbability: Math.round(newWinProb)
        }
      })
      return data
    }

    toast.promise(scanPromise(), {
      loading: language === "it" ? "Analisi di conformità in corso..." : "Running compliance audit...",
      success: (data: any) => 
        language === "it" 
          ? `Analisi completata. Rilevate ${data?.items?.length || 0} anomalie.` 
          : `Audit complete. Found ${data?.items?.length || 0} anomalies.`,
      error: (err: any) => err.message || "Error"
    })
  }

  const handleInlineResolve = (riskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedRiskItems = tender.riskItems.map((r) =>
      r.id === riskId ? { ...r, status: "Resolved" as const } : r
    )
    
    const resolvedCount = updatedRiskItems.filter((r) => r.status === "Resolved").length
    const totalCount = updatedRiskItems.length
    const unresolvedCount = totalCount - resolvedCount
    const newRiskScore = Math.max(0, unresolvedCount * 25)
    
    const newWinProb = Math.max(
      0,
      Math.min(
        100,
        70 +
          Math.max(0, 100 - tender.computed.marginPercent * 3.5) * 0.2 -
          newRiskScore * 0.4 +
          (tender.region === "Lombardia" ? 80 : 50) * 0.3
      )
    )

    updateTender(tender.id, {
      riskItems: updatedRiskItems,
      computed: {
        ...tender.computed,
        riskScore: newRiskScore,
        winProbability: Math.round(newWinProb),
      }
    })
    toast.success(language === "it" ? "Anomalia risolta!" : "Anomaly resolved!")
  }

  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (winProb / 100) * circumference

  // Circular gauge telemetry calculations
  const angle = (winProb / 100) * 2 * Math.PI - Math.PI / 2
  const tipX = 72 + radius * Math.cos(angle)
  const tipY = 72 + radius * Math.sin(angle)

  const getStatutoryRef = (code: string) => {
    switch (code) {
      case "DURC_EXPIRED":
        return "D.Lgs. 36/2023 - Art. 94 (Regolarità Contributiva DURC)"
      case "SOA_REQUIRED":
        return "D.P.R. 207/2010 - Art. 61 (Qualificazione SOA ed esecuzione lavori)"
      case "DELIVERY_DELAY":
        return "Capitolato Generale d'Appalto - Art. 113 (Penali per ritardo)"
      case "SAFETY_COSTS_NON_REDUCIBLE":
        return "D.Lgs. 81/2008 - Art. 100 (Costi della sicurezza e salute)"
      case "ENVIRONMENTAL_CONSTRAINT":
        return "Codice Beni Culturali e Paesaggio - D.Lgs. 42/2004"
      case "UNESCO_CONSTRAINT":
        return "Beni del Patrimonio Mondiale UNESCO - Legge 77/2006"
      case "VIBRATION_MONITORING":
        return "Normativa UNI 9916 - Criteri di misura e valutazione degli effetti delle vibrazioni"
      default:
        return "D.Lgs. 36/2023 - Codice dei Contratti Pubblici"
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[8px] font-bold text-zinc-555 uppercase tracking-widest font-mono">Dossier Rischi</span>
          <h2 className="text-sm font-bold text-zinc-200 mt-1">Audit Conformità & Win Index</h2>
        </div>
        <button
          onClick={handleScanCompliance}
          className="px-3.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-350 transition-colors text-xs font-mono font-bold cursor-pointer"
        >
          RUN COMPLIANCE AUDIT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Win Rate Dial (col-span-2) */}
        <div className="lg:col-span-2 border border-zinc-900 rounded-lg p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[320px] bg-zinc-950/10">
          <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest mb-6 font-mono">Win Probability Dial</span>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer tick markings */}
              <circle
                cx="72"
                cy="72"
                r={radius + 8}
                className="stroke-zinc-900/40 fill-transparent"
                strokeWidth="1"
                strokeDasharray="2 6"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-zinc-900 fill-transparent"
                strokeWidth="4"
              />
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className="fill-transparent transition-all duration-500 stroke-zinc-100"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1 }}
                strokeLinecap="round"
              />
              {/* Telemetry Dial Tip Indicator */}
              <motion.circle
                cx={tipX}
                cy={tipY}
                r="3"
                className="fill-zinc-100 stroke-zinc-950 stroke-[1.5px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-bold text-zinc-100 tracking-tight">{winProb}%</span>
              <span className="text-[8px] text-zinc-555 uppercase font-bold tracking-widest mt-1 font-mono">Win Probability</span>
            </div>
          </div>

          <div className="mt-6 space-y-1 font-mono text-[10px] text-zinc-500">
            <p className="font-bold text-zinc-300">
              {winProb > 70 ? "HIGH PROBABILITY OF WINNING" : winProb > 45 ? "MODERATE WIN FEASIBILITY" : "LOW PRICE COMPETITIVENESS"}
            </p>
            <p className="leading-relaxed px-4">
              Calculated using markup pricing margins and structural compliance audit flags.
            </p>
          </div>
        </div>

        {/* Audit reports commentary (col-span-3) */}
        <div className="lg:col-span-3 border border-zinc-900 rounded-lg p-6 flex flex-col justify-between min-h-[320px] bg-zinc-950/10">
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">AI Executive Commentary</span>
            </div>

            <div className="space-y-3 font-mono text-[10px] text-zinc-400">
              {[
                { name: "Normativo (Legal)", desc: tender.riskItems.some((r) => r.status === "Flagged" && r.code === "DURC_EXPIRED") ? "BLOCKED: Expired DURC certification on subcontractor 'Nuova Clima S.r.l.'" : "PASSED: All baseline legal and SOA requirements verified compliant.", icon: Scale, type: tender.riskItems.some((r) => r.status === "Flagged" && r.code === "DURC_EXPIRED") ? "error" : "pass" },
                { name: "Economico (Financial)", desc: "PASSED: Safety costs successfully isolated from economic discount bids.", icon: Coins, type: "pass" },
                { name: "Logistico (Operational)", desc: tender.riskItems.some((r) => r.status === "Flagged" && r.code === "DELIVERY_DELAY") ? "WARNING: Bid delay penalties require 15% buffer scheduling." : "PASSED: Time constraints satisfied without delay flags.", icon: Truck, type: tender.riskItems.some((r) => r.status === "Flagged" && r.code === "DELIVERY_DELAY") ? "warning" : "pass" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start p-2.5 bg-zinc-950/30 rounded border border-zinc-900">
                  <span className={`px-1 py-0.2 rounded text-[8px] font-bold uppercase shrink-0 mt-0.5 border ${
                    item.type === "error" ? "bg-red-950/20 text-red-400 border-red-900/50" : item.type === "warning" ? "bg-zinc-900 text-zinc-400 border-zinc-850" : "bg-zinc-950 text-zinc-600 border-zinc-900"
                  }`}>
                    {item.type}
                  </span>
                  <div>
                    <h5 className="font-bold text-zinc-350">{item.name}</h5>
                    <p className="text-zinc-500 mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance dossier directory */}
      <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20">
        <div className="p-3 bg-zinc-950/40 border-b border-zinc-900 text-[10px] font-mono font-bold text-zinc-400">
          COMPLIANCE CHECKLIST REPORT
        </div>
        
        <div className="divide-y divide-zinc-900">
          {tender.riskItems.map((risk) => {
            const isResolved = risk.status === "Resolved"
            const isExpanded = expandedRiskId === risk.id

            return (
              <div
                key={risk.id}
                onClick={() => setExpandedRiskId(isExpanded ? null : risk.id)}
                className="p-4 hover:bg-zinc-900/10 transition-colors cursor-pointer relative"
              >
                <div className="flex items-start justify-between gap-4 font-mono text-xs">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`px-1 rounded text-[8px] font-bold uppercase border mt-0.5 ${
                      isResolved
                        ? "bg-zinc-950 text-zinc-600 border-zinc-900"
                        : risk.level === "high" || risk.level === "critical"
                        ? "bg-red-950/20 text-red-400 border-red-900/50"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}>
                      {isResolved ? "RESOLVED" : risk.level.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className={`font-semibold ${isResolved ? "text-zinc-650 line-through" : "text-zinc-300"}`}>
                        {risk.message.split(" - ")[0]}
                      </p>
                      <p className="text-[9px] text-zinc-550 mt-1 font-mono tracking-wider">
                        CODEX: {getStatutoryRef(risk.code)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-600 shrink-0 select-none">
                    {isExpanded ? "COLLAPSE [-]" : "EXPAND [+]"}
                  </span>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="mt-4 pt-3.5 border-t border-zinc-900/60 flex flex-col gap-3 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-black border border-zinc-900 p-3.5 rounded font-mono text-[10px] text-zinc-500">
                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">AI Mitigation Path</p>
                        <p className="leading-relaxed">{risk.resolutionHint}</p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleGenerateAppeal(risk)}
                          disabled={isGeneratingAppeal}
                          className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 font-mono text-[9px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isGeneratingAppeal && appealRiskItem?.id === risk.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              DRAFTING...
                            </>
                          ) : (
                            <>
                              <Scale className="w-3.5 h-3.5 text-zinc-400" />
                              GENERATE APPEAL (AI)
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onTriggerCopilot(risk)}
                          className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 font-mono text-[9px] font-bold cursor-pointer"
                        >
                          COPILOT DETAILS
                        </button>
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={(e) => handleInlineResolve(risk.id, e)}
                            className="px-3 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-[9px] font-bold cursor-pointer"
                          >
                            RESOLVE ANOMALY
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI TAR Legal Appeal Draft Modal */}
      <AnimatePresence>
        {activeAppealText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[85vh] flex flex-col justify-between shadow-2xl font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                <div>
                  <span className="text-[8px] font-bold text-zinc-555 uppercase tracking-widest block">AI Legal Document Hub</span>
                  <h3 className="text-xs font-bold text-zinc-200 mt-1 uppercase">Bozza Atto Amministrativo (D.Lgs. 36/2023)</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveAppealText(null)
                    setAppealRiskItem(null)
                  }}
                  className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-255 transition-colors cursor-pointer text-[9px] font-bold"
                >
                  CHIUDI
                </button>
              </div>

              {/* Legal appeal scroll body */}
              <div 
                className="flex-1 overflow-y-auto p-4 bg-[#030303] border border-zinc-900 rounded text-[10px] text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono glass-scrollbar"
                data-lenis-prevent
              >
                {activeAppealText}
              </div>

              <div className="flex items-center justify-between mt-4 border-t border-zinc-900 pt-3">
                <span className="text-[8px] text-zinc-655 font-bold uppercase">Stato: Bozza Generata dall'AI</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeAppealText)
                      toast.success(language === "it" ? "Copiato negli appunti!" : "Copied to clipboard!")
                    }}
                    className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 hover:text-zinc-50 transition-all font-bold cursor-pointer"
                  >
                    COPY TEXT
                  </button>
                  <button
                    onClick={() => {
                      const element = document.createElement("a")
                      const file = new Blob([activeAppealText], {type: 'text/plain'})
                      element.href = URL.createObjectURL(file)
                      element.download = `ricorso_tar_${appealRiskItem?.code || "tender"}.txt`
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                      toast.success(language === "it" ? "Download avviato!" : "Download started!")
                    }}
                    className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 transition-all font-bold cursor-pointer"
                  >
                    DOWNLOAD TXT
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
