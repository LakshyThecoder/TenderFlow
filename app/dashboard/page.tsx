"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Toaster, toast } from "sonner"
import {
  LayoutDashboard,
  FileSpreadsheet,
  Coins,
  Users2,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  Search,
  Globe,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  Briefcase,
  Terminal,
  BarChart3,
} from "lucide-react"

// Import tabs & components
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { IntakeTab } from "@/components/dashboard/intake-tab"
import { BuilderTab } from "@/components/dashboard/builder-tab"
import { SubcontractorsTab } from "@/components/dashboard/subcontractors-tab"
import { RiskTab } from "@/components/dashboard/risk-tab"
import { CommandPalette } from "@/components/dashboard/command-palette"
import { CopilotDrawer } from "@/components/dashboard/copilot-drawer"
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview"
import { ActivityFeed } from "@/components/dashboard/activity-feed"

// Import providers & translation system
import { LanguageProvider, useLanguage } from "@/lib/LanguageContext"
import { Language } from "@/lib/translations"

// Import Zustand store
import { useAppStore } from "@/lib/store/useAppStore"
import { RiskItem } from "@/lib/types/tender"

function DashboardContent() {
  const { language, setLanguage, t } = useLanguage()
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null)
  
  // Sidebar and presence toggles
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showPresenceDetails, setShowPresenceDetails] = useState(false)

  // Zustand State & Actions
  const activeTenderId = useAppStore((state) => state.activeTenderId)
  const tenders = useAppStore((state) => state.tenders)
  const ui = useAppStore((state) => state.ui)
  const actions = useAppStore((state) => state.actions)

  const currentTender = tenders.find((t) => t.id === activeTenderId) || tenders[0] || null

  const handleResolveRisk = (riskId: string) => {
    if (currentTender) {
      const updatedRiskItems = currentTender.riskItems.map((r) =>
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
            Math.max(0, 100 - currentTender.computed.marginPercent * 3.5) * 0.2 -
            newRiskScore * 0.4 +
            (currentTender.region === "Lombardia" ? 80 : 50) * 0.3
        )
      )

      actions.updateTender(currentTender.id, {
        riskItems: updatedRiskItems,
        computed: {
          ...currentTender.computed,
          riskScore: newRiskScore,
          winProbability: Math.round(newWinProb),
        }
      })
      toast.success(language === "it" ? "Anomalia risolta con successo!" : "Anomaly resolved successfully!")
    }
  }

  // Key listener for Ctrl+K command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        actions.toggleCommandPalette()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [actions])

  const handleRunAudit = () => {
    if (!currentTender) return;

    const scanPromise = async () => {
      const res = await fetch("/api/v1/risk/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenderId: currentTender.id, boq: currentTender.boq })
      })
      if (!res.ok) {
        throw new Error(language === "it" ? "Errore audit" : "Audit error")
      }
      const data = await res.json()
      
      const newRiskScore = data.riskScore ?? 0
      const newWinProb = Math.max(
        0,
        Math.min(
          100,
          70 +
            Math.max(0, 100 - currentTender.computed.marginPercent * 3.5) * 0.2 -
            newRiskScore * 0.4 +
            (currentTender.region === "Lombardia" ? 80 : 50) * 0.3
        )
      )

      actions.updateTender(currentTender.id, {
        riskItems: data.items || [],
        computed: {
          ...currentTender.computed,
          riskScore: newRiskScore,
          winProbability: Math.round(newWinProb)
        }
      })
      return data
    }

    toast.promise(scanPromise(), {
      loading: language === "it" ? "Scansione capitolati in corso..." : "Running compliance audit...",
      success: (data: any) => 
        language === "it" 
          ? `Audit completato. Rilevate ${data?.items?.length || 0} anomalie.` 
          : `Audit completed. Found ${data?.items?.length || 0} anomalies.`,
      error: (err: any) => err.message || "Error"
    })
  }

  const tabItems = [
    { id: "overview", label: t("tabOverview"), icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "intake", label: t("tabIntake"), icon: FileSpreadsheet },
    { id: "builder", label: t("tabBuilder"), icon: Coins },
    { id: "subcontractors", label: t("tabSubs"), icon: Users2 },
    {
      id: "risk",
      label: t("tabRisk"),
      icon: AlertTriangle,
      badge: currentTender ? currentTender.riskItems.filter((r) => r.status === "Flagged").length : 0,
    },
  ]

  const languages: { code: Language; name: string }[] = [
    { code: "it", name: "Italiano" },
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans overflow-hidden selection:bg-zinc-800 selection:text-zinc-100">
      <Toaster position="top-right" theme="dark" closeButton />

      {/* Command Center & Copilot Drawers */}
      <CommandPalette
        isOpen={ui.commandPaletteOpen}
        onClose={() => actions.toggleCommandPalette()}
        tenders={tenders}
        selectedTenderId={activeTenderId || ""}
        setSelectedTenderId={(id) => actions.setTender(id)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setGlobalMargin={(margin) => {
          if (currentTender) {
            actions.updateTender(currentTender.id, {
              computed: {
                ...currentTender.computed,
                marginPercent: margin,
              },
            })
          }
        }}
        onRunAudit={handleRunAudit}
      />

      {currentTender && (
        <CopilotDrawer
          isOpen={ui.copilotOpen}
          onClose={() => {
            actions.toggleCopilot()
            setSelectedRisk(null)
          }}
          tender={currentTender}
          selectedRisk={selectedRisk}
          onResolveRisk={handleResolveRisk}
        />
      )}

      {/* Sidebar - Tenders Directory (Split-Pane style) */}
      <aside
        className={`bg-[#09090b] border-r border-zinc-900 flex-shrink-0 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out relative z-20 ${
          sidebarCollapsed ? "w-16" : "w-72"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header block */}
          <div className="h-16 border-b border-zinc-900 flex items-center justify-between px-4">
            {!sidebarCollapsed && (
              <Link href="/" className="flex items-center gap-1.5 font-display text-sm font-bold tracking-wider uppercase text-zinc-100">
                <span>tenderflow</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono">v2</span>
              </Link>
            )}
            
            {sidebarCollapsed && (
              <Link href="/" className="mx-auto text-sm font-bold tracking-widest font-mono uppercase text-zinc-100">
                TF
              </Link>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
            >
              {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Directory Listings */}
          <div className="flex-1 overflow-y-auto pr-1 glass-scrollbar p-3 space-y-4" data-lenis-prevent>
            {!sidebarCollapsed ? (
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2 font-mono">Active Tenders ({tenders.length})</p>
                <div className="space-y-1">
                  {tenders.map((tender) => {
                    const isSelected = tender.id === activeTenderId
                    return (
                      <button
                        key={tender.id}
                        onClick={() => actions.setTender(tender.id)}
                        className={`w-full text-left p-3 rounded-lg border text-xs flex flex-col gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 border-zinc-800 text-zinc-100 font-bold"
                            : "bg-zinc-950/40 border-zinc-900/50 text-zinc-400 hover:bg-zinc-900/30 hover:border-zinc-800 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-mono text-[9px] text-zinc-500 tracking-wide">{tender.cig || "NO_CIG"}</span>
                          <span className={`text-[8px] font-bold uppercase px-1 rounded border ${
                            tender.status === "won" ? "bg-emerald-950/20 text-emerald-450 border-emerald-900/50" : tender.status === "analyzing" ? "bg-zinc-900 text-zinc-300 border-zinc-800" : "bg-zinc-950 text-zinc-500 border-zinc-900"
                          }`}>
                            {tender.status}
                          </span>
                        </div>
                        <span className="truncate w-full font-semibold">{tender.title.split(" - ")[0]}</span>
                        <span className="text-[9px] text-zinc-600 font-mono tracking-wider">
                          {tender.region} • €{(tender.budgetEUR / 1000).toFixed(0)}k
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {tenders.map((tender) => {
                  const isSelected = tender.id === activeTenderId
                  return (
                    <button
                      key={tender.id}
                      onClick={() => actions.setTender(tender.id)}
                      title={tender.title}
                      className={`w-9 h-9 rounded-md border flex items-center justify-center font-mono text-[10px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                          : "bg-zinc-950/50 border-zinc-900 text-zinc-500 hover:bg-zinc-900/40 hover:border-zinc-800 hover:text-zinc-300"
                      }`}
                    >
                      {tender.region.substring(0, 2).toUpperCase()}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-350 text-[10px]">
                  LK
                </div>
                <span className="truncate font-semibold text-zinc-400">Lakshy</span>
              </div>
              <Link href="/" className="hover:text-zinc-300 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#09090b]">
        {/* Workspace Toolbar Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 z-30 bg-[#09090b]">
          {/* Left: Breadcrumbs & CIG */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="text-zinc-600 font-bold uppercase">Workspace</span>
            <span className="text-zinc-800">/</span>
            <span className="font-semibold text-zinc-200">{currentTender ? currentTender.cig || "N/A" : "SELECT_TENDER"}</span>
          </div>

          {/* Center: Tabs Switcher */}
          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-900">
            {tabItems.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                      : "text-zinc-450 hover:text-zinc-200 hover:bg-zinc-900/20"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[8px] bg-red-950/20 text-red-400 border border-red-900/50 rounded font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right: Presence & Language Selector */}
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-550">
            <div
              className="flex items-center gap-1.5 cursor-pointer relative"
              onMouseEnter={() => setShowPresenceDetails(true)}
              onMouseLeave={() => setShowPresenceDetails(false)}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>3 ONLINE</span>

              <AnimatePresence>
                {showPresenceDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-6 w-48 bg-zinc-950 border border-zinc-900 rounded-lg p-3 z-50 text-[10px] space-y-2 shadow-2xl font-sans"
                  >
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-1 font-mono">Team Active</p>
                    <div className="space-y-1.5">
                      <p className="text-zinc-300 font-bold">Giovanni R. <span className="text-[8px] text-zinc-650 font-mono font-normal">Est</span></p>
                      <p className="text-zinc-300 font-bold">Elena B. <span className="text-[8px] text-zinc-650 font-mono font-normal">Legal</span></p>
                      <p className="text-zinc-300 font-bold">Marco L. <span className="text-[8px] text-zinc-650 font-mono font-normal">Site</span></p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-4 w-[1px] bg-zinc-900" />

            <div className="relative group">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-transparent text-zinc-500 hover:text-zinc-300 border-0 focus:outline-none focus:ring-0 cursor-pointer pr-4 font-mono font-bold"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-zinc-950 text-zinc-400">
                    {l.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Console Workspace summary dashboard bar */}
        {currentTender && (
          <div className="border-b border-zinc-900 bg-zinc-950/20 px-6 py-4 flex flex-wrap justify-between items-center gap-4 z-10">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-zinc-200 tracking-tight">{currentTender.title}</h2>
              <p className="text-[10px] text-zinc-600 truncate mt-0.5 font-mono leading-none">
                Stazione: {currentTender.stazioneAppaltante || "N/A"}
              </p>
            </div>

            <div className="flex items-center gap-8 font-mono text-[10px]">
              <div>
                <span className="text-zinc-600 block">BASE PRICE</span>
                <span className="font-bold text-zinc-300 text-xs">€{currentTender.budgetEUR.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-zinc-600 block">WIN PROB</span>
                <span className="font-bold text-zinc-300 text-xs flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentTender.computed.winProbability > 70 ? "bg-emerald-500" : "bg-blue-500"}`} />
                  {currentTender.computed.winProbability}%
                </span>
              </div>
              <div>
                <span className="text-zinc-600 block">AI MARGIN</span>
                <span className="font-bold text-zinc-300 text-xs">+{currentTender.computed.marginPercent}%</span>
              </div>
              <div>
                <span className="text-zinc-600 block">DEADLINE</span>
                <span className="font-bold text-zinc-400 text-xs">{currentTender.deadlineISO}</span>
              </div>
            </div>
          </div>
        )}

        {/* Console Work area */}
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl w-full mx-auto glass-scrollbar" data-lenis-prevent>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="min-h-full"
            >
              {activeTab === "overview" && <OverviewTab setActiveTab={setActiveTab} />}
              {activeTab === "analytics" && <AnalyticsOverview />}
              {activeTab === "intake" && <IntakeTab setActiveTab={setActiveTab} />}
              {activeTab === "builder" && <BuilderTab setActiveTab={setActiveTab} />}
              {activeTab === "subcontractors" && <SubcontractorsTab />}
              {activeTab === "risk" && (
                <RiskTab
                  onTriggerCopilot={(risk) => {
                    setSelectedRisk(risk)
                    if (!ui.copilotOpen) {
                      actions.toggleCopilot()
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  )
}
