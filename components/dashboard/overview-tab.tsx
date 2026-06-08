"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ShieldCheck, TrendingUp, Calendar, Euro, Eye, Brain, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/LanguageContext"
import { ItalyMap } from "./italy-map"
import { useAppStore } from "@/lib/store/useAppStore"
import { WinProbabilityPanelV2 } from "./win-probability-panel-v2"
import { ActivityFeedV2 } from "./activity-feed-v2"

interface OverviewTabProps {
  setActiveTab: (tab: string) => void
}

const chartData = [
  { name: "Gen", Offerte: 4, Vinte: 2 },
  { name: "Feb", Offerte: 6, Vinte: 3 },
  { name: "Mar", Offerte: 3, Vinte: 1 },
  { name: "Apr", Offerte: 8, Vinte: 5 },
  { name: "Mag", Offerte: 5, Vinte: 3 },
  { name: "Giu", Offerte: 7, Vinte: 4 },
]

export function OverviewTab({ setActiveTab }: OverviewTabProps) {
  const { t } = useLanguage()
  
  const tenders = useAppStore((state) => state.tenders)
  const activeTenderId = useAppStore((state) => state.activeTenderId)
  const setTender = useAppStore((state) => state.actions.setTender)

  const activeTender = tenders.find((t) => t.id === activeTenderId) || tenders[0]
  const totalPipeline = tenders.reduce((acc, t) => acc + t.budgetEUR, 0)
  
  const handleManage = (id: string) => {
    setTender(id)
    setActiveTab("intake")
  }

  // Mini sparklines data
  const pipelineSparkline = [30, 45, 35, 60, 50, 75]
  const winRateSparkline = [55, 60, 58, 62, 65, 67.5]

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Flat Grid KPI Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-zinc-900 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-zinc-900 bg-zinc-950/20">
        {[
          {
            title: t("kpiPipeline"),
            value: `€${(totalPipeline / 1000000).toFixed(2)}M`,
            desc: t("kpiPipelineDesc"),
            sparkline: pipelineSparkline,
            color: "#3f3f46",
          },
          {
            title: t("kpiWinRate"),
            value: "67.5%",
            desc: t("kpiWinRateDesc"),
            sparkline: winRateSparkline,
            color: "#3f3f46",
          },
          {
            title: t("kpiSelectedTender"),
            value: activeTender ? activeTender.title.split(" - ")[0] : "-",
            desc: `€${activeTender?.budgetEUR.toLocaleString()}`,
          },
          {
            title: t("kpiCompliance"),
            value: `${
              activeTender
                ? Math.round(
                    ((activeTender.riskItems.length -
                      activeTender.riskItems.filter((r) => r.status === "Flagged").length) /
                      (activeTender.riskItems.length || 1)) *
                      100
                  )
                : 0
            }%`,
            desc: `${activeTender ? activeTender.riskItems.filter((r) => r.status === "Flagged").length : 0} anomalie aperte`,
          },
        ].map((kpi, idx) => (
          <div key={idx} className="p-5 flex flex-col justify-between h-32">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-550 uppercase block">{kpi.title}</span>
              <span className="text-xl font-bold text-zinc-100 font-display block mt-1">{kpi.value}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
              <span className="truncate max-w-[120px]">{kpi.desc}</span>
              {kpi.sparkline && (
                <svg className="w-14 h-4 overflow-visible" strokeWidth={1} fill="none">
                  <path
                    className="sparkline-path"
                    d={kpi.sparkline
                      .map((val, i) => `${i === 0 ? "M" : "L"} ${(i * 14) / 5} ${16 - (val / 100) * 12}`)
                      .join(" ")}
                  />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Map & Chart Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Geo Center Map */}
        <div className="lg:col-span-3">
          <ItalyMap />
        </div>

        {/* Analytics chart */}
        <div className="lg:col-span-2 border border-zinc-900 rounded-lg p-5 flex flex-col justify-between min-h-[460px] bg-zinc-950/10">
          <div>
            <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest font-mono">Bidding Analytics</span>
            <h3 className="text-sm font-bold text-zinc-200 mt-1">Stato Offerte Inviate</h3>
            <p className="text-[10px] text-zinc-500 leading-normal mt-0.5 font-sans">Rapporto storico lotti partecipati vs. lotti aggiudicati.</p>
          </div>

          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="monochromeArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="#18181b" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} dy={10} className="font-mono" />
                <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} dx={-5} className="font-mono" />
                <Tooltip
                  cursor={{ stroke: "#27272a", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    borderRadius: "6px",
                    color: "#f4f4f5",
                    fontSize: "10px",
                    padding: "8px 12px",
                    fontFamily: "monospace"
                  }}
                />
                
                <Area
                  type="monotone"
                  dataKey="Offerte"
                  stroke="#e4e4e7"
                  strokeWidth={1.5}
                  fill="url(#monochromeArea)"
                  dot={{ stroke: "#71717a", strokeWidth: 1, r: 2.5, fill: "#09090b" }}
                />

                <Area
                  type="monotone"
                  dataKey="Vinte"
                  stroke="#52525b"
                  strokeWidth={1.5}
                  fill="transparent"
                  dot={{ stroke: "#3f3f46", strokeWidth: 1, r: 2.5, fill: "#09090b" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-550 border-t border-zinc-900 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span>Partecipate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-650" />
              <span>Aggiudicate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dossier & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 font-sans">
        {/* Left: Tenders Dossier Table (lg:col-span-3) */}
        <div className="lg:col-span-3 border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">Dossier Capitolati Attivi</span>
              <span className="text-[9px] text-zinc-500 font-mono">{tenders.length} record</span>
            </div>
            <div className="overflow-x-auto glass-scrollbar" data-lenis-prevent>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] uppercase font-mono tracking-wider">
                    <th className="p-3 pl-4">CIG / Codice</th>
                    <th className="p-3">Oggetto del Capitolato</th>
                    <th className="p-3 text-right">Prezzo Base</th>
                    <th className="p-3 text-center">Stato</th>
                    <th className="p-3 pr-4 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {tenders.map((tender) => {
                    const isSelected = tender.id === activeTenderId
                    return (
                      <tr
                        key={tender.id}
                        onClick={() => setTender(tender.id)}
                        className={`hover:bg-zinc-900/10 transition-colors cursor-pointer ${
                          isSelected ? "bg-zinc-900/20" : ""
                        }`}
                      >
                        <td className="p-3 pl-4 font-mono font-bold text-zinc-400">{tender.cig || "N/A"}</td>
                        <td className="p-3 font-semibold text-zinc-200 max-w-[150px] truncate">{tender.title.split(" - ")[0]}</td>
                        <td className="p-3 text-right font-mono text-zinc-350">€{(tender.budgetEUR / 1000).toFixed(0)}k</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase border ${
                            tender.status === "won"
                              ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/50"
                              : tender.status === "analyzing"
                              ? "bg-zinc-900 text-zinc-300 border-zinc-800"
                              : "bg-zinc-955 text-zinc-500 border-zinc-900"
                          }`}>
                            {tender.status}
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleManage(tender.id)
                            }}
                            className="p-1 px-2.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-all font-mono text-[9px] font-bold cursor-pointer"
                          >
                            MANAGE
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: AI Insights Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Win Probability Panel */}
          {activeTender && (
            <WinProbabilityPanelV2
              tender={activeTender}
              onMarginChange={(margin) => {
                // Update tender margin via store action would go here
                console.log("Margin changed to:", margin);
              }}
            />
          )}

          {/* Activity Feed */}
          <ActivityFeedV2 />
        </div>
      </div>
    </div>
  )
}
