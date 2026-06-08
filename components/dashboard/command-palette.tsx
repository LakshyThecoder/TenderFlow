"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Compass, Briefcase, Sparkles, X } from "lucide-react"
import { Tender } from "@/lib/types/tender"
import { useLanguage } from "@/lib/LanguageContext"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  tenders: Tender[]
  selectedTenderId: string
  setSelectedTenderId: (id: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  setGlobalMargin: (margin: number) => void
  onRunAudit: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  tenders,
  selectedTenderId,
  setSelectedTenderId,
  activeTab,
  setActiveTab,
  setGlobalMargin,
  onRunAudit,
}: CommandPaletteProps) {
  const { t } = useLanguage()
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  // Command database
  const navigationItems = [
    { label: t("tabOverview"), value: "overview", type: "nav" },
    { label: t("tabIntake"), value: "intake", type: "nav" },
    { label: t("tabBuilder"), value: "builder", type: "nav" },
    { label: t("tabSubs"), value: "subcontractors", type: "nav" },
    { label: t("tabRisk"), value: "risk", type: "nav" },
  ]

  const actionItems = [
    { label: "Audit AI Completo (Run AI Compliance Audit)", action: "audit", type: "action" },
    { label: "Imposta ricarico al 5% (Set markup margin to 5%)", action: "margin-5", type: "action" },
    { label: "Imposta ricarico al 10% (Set markup margin to 10%)", action: "margin-10", type: "action" },
    { label: "Imposta ricarico al 15% (Set markup margin to 15%)", action: "margin-15", type: "action" },
  ]

  // Filter commands
  const filteredNavs = navigationItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const filteredProjects = tenders.filter(tender =>
    tender.title.toLowerCase().includes(query.toLowerCase()) ||
    (tender.cig || "").toLowerCase().includes(query.toLowerCase())
  )

  const filteredActions = actionItems.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelectNav = (tabId: string) => {
    setActiveTab(tabId)
    onClose()
  }

  const handleSelectProject = (projectId: string) => {
    setSelectedTenderId(projectId)
    onClose()
  }

  const handleSelectAction = (action: string) => {
    if (action === "audit") {
      onRunAudit()
    } else if (action === "margin-5") {
      setGlobalMargin(5)
    } else if (action === "margin-10") {
      setGlobalMargin(10)
    } else if (action === "margin-15") {
      setGlobalMargin(15)
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Dialog Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl bg-zinc-950/90 border border-zinc-850/80 rounded-2xl overflow-hidden shadow-2xl relative z-10 backdrop-blur-2xl"
        >
          {/* Header Search Field */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-900">
            <Search className="w-5 h-5 text-zinc-550 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("cmdCenterSearchPlaceholder")}
              className="flex-1 bg-transparent border-0 text-sm text-zinc-200 placeholder-zinc-550 focus:outline-none focus:ring-0 w-full"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-550 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[350px] overflow-y-auto p-3.5 space-y-4 scrollbar-hidden" data-lenis-prevent>
            {/* Navigations */}
            {filteredNavs.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest px-2.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> {t("cmdNavigate")}
                </p>
                <div className="space-y-0.5">
                  {filteredNavs.map((nav) => (
                    <button
                      key={nav.value}
                      onClick={() => handleSelectNav(nav.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex justify-between items-center transition-all cursor-pointer ${
                        activeTab === nav.value
                          ? "bg-zinc-900 text-zinc-100 font-semibold border border-zinc-800"
                          : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                      }`}
                    >
                      {nav.label}
                      <span className="text-[10px] text-zinc-650 font-mono">/tab</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {filteredProjects.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest px-2.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> {t("cmdProjects")}
                </p>
                <div className="space-y-0.5">
                  {filteredProjects.map((tender) => (
                    <button
                      key={tender.id}
                      onClick={() => handleSelectProject(tender.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex justify-between items-center transition-all cursor-pointer ${
                        selectedTenderId === tender.id
                          ? "bg-zinc-900 text-zinc-100 font-semibold border border-zinc-800"
                          : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                      }`}
                    >
                      <span className="truncate max-w-[340px]">
                        {tender.title.split(" - ")[0]} <strong className="text-[10px] text-zinc-500 font-normal font-mono">({tender.region})</strong>
                      </span>
                      <span className="text-[9px] font-mono text-zinc-550 shrink-0 font-bold">{tender.cig}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Actions */}
            {filteredActions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest px-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> {t("cmdActions")}
                </p>
                <div className="space-y-0.5">
                  {filteredActions.map((act) => (
                    <button
                      key={act.action}
                      onClick={() => handleSelectAction(act.action)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200 flex justify-between items-center transition-all cursor-pointer"
                    >
                      {act.label}
                      <span className="text-[9px] text-zinc-660 font-bold border border-zinc-900 px-1.5 py-0.5 rounded uppercase font-mono">Run</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {filteredNavs.length === 0 && filteredProjects.length === 0 && filteredActions.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-xs">
                Nessuna voce corrispondente alla ricerca.
              </div>
            )}
          </div>

          {/* Footer Shortcuts help */}
          <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 text-[10px] text-zinc-550 flex items-center justify-between font-mono font-bold tracking-wide">
            <span>TenderFlow Command Center</span>
            <div className="flex gap-2">
              <span>↑↓ naviga</span>
              <span>↵ seleziona</span>
              <span>esc chiudi</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
