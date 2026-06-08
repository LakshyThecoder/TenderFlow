"use client"

import { useEffect, useRef } from "react"
import { Activity, Radio } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { useAppStore } from "@/lib/store/useAppStore"

export function ItalyMap() {
  const { t } = useLanguage()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const tenders = useAppStore((state) => state.tenders)
  const activeTenderId = useAppStore((state) => state.activeTenderId)
  const setTender = useAppStore((state) => state.actions.setTender)

  // Map nodes corresponding to tenders/regions
  const mapNodes = [
    { id: "tender-1", city: "Milano", region: "Lombardia" },
    { id: "tender-2", city: "Torino", region: "Piemonte" },
    { id: "tender-5", city: "Venezia", region: "Veneto" },
    { id: "tender-3", city: "Roma", region: "Lazio" },
    { id: "tender-4", city: "Napoli", region: "Campania" },
  ]

  // Listen for selection messages from Leaflet map iframe
  useEffect(() => {
    const handleMapMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SELECT_TENDER") {
        setTender(event.data.id)
      }
    }
    window.addEventListener("message", handleMapMessage)
    return () => window.removeEventListener("message", handleMapMessage)
  }, [setTender])

  // Post selected project changes to Leaflet map iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const timer = setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({
          type: "SET_ACTIVE",
          id: activeTenderId
        }, "*")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTenderId])

  const totalActivePipeline = tenders.reduce((acc, t) => acc + t.budgetEUR, 0)

  return (
    <div className="border border-zinc-900 rounded-lg p-5 relative overflow-hidden min-h-[460px] flex flex-col justify-between font-sans bg-zinc-950/20">
      {/* Mesh and Radar overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293704_1px,transparent_1px),linear-gradient(to_bottom,#1f293704_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-20" />

      {/* Main Grid: Left is Info Panel, Right is Visual Map */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 flex-1 items-stretch">
        
        {/* Info Column (md:col-span-2) */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-850 text-[9px] font-bold tracking-widest uppercase text-zinc-400 font-mono">
              <Activity className="w-3.5 h-3.5" /> Spatial Telemetry
            </div>
            <h3 className="text-sm font-bold text-zinc-200 mt-3">
              Geo-Control Center
            </h3>
            <p className="text-[10px] text-zinc-550 leading-relaxed mt-1 font-sans">
              Monitoraggio geografico dei cantieri attivi. Clicca sui nodi radar per caricare i dettagli del computo metrico.
            </p>
          </div>

          {/* Regional stats indicators */}
          <div className="space-y-3 flex-1 flex flex-col justify-end">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1 font-mono">Pipeline per Regione</p>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 glass-scrollbar" data-lenis-prevent>
              {mapNodes.map((node) => {
                const associatedTender = tenders.find(t => t.id === node.id)
                const isSelected = activeTenderId === node.id

                return (
                  <button
                    key={node.id}
                    onClick={() => setTender(node.id)}
                    className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-zinc-750 bg-zinc-900 text-zinc-100 shadow-sm"
                        : "border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="font-sans flex items-center gap-2">
                      <Radio className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-zinc-200 animate-pulse" : "text-zinc-700"}`} />
                      <div>
                        <span className="text-xs font-semibold text-zinc-200 block leading-tight">{node.city}</span>
                        <span className="text-[9px] text-zinc-500 block font-mono font-bold leading-none mt-1">{node.region}</span>
                      </div>
                    </div>
                    
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-zinc-300 block">
                        €{(associatedTender?.budgetEUR || 0).toLocaleString()}
                      </span>
                      <span className={`text-[9px] font-bold uppercase ${
                        associatedTender?.status === "won" 
                          ? "text-emerald-555" 
                          : associatedTender?.status === "draft" 
                          ? "text-zinc-650" 
                          : "text-zinc-450"
                      }`}>
                        {associatedTender?.status}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Visual Map Column (md:col-span-3) */}
        <div className="md:col-span-3 border border-zinc-900 rounded-lg bg-zinc-950/40 relative overflow-hidden flex items-stretch justify-stretch min-h-[300px]">
          <iframe
            ref={iframeRef}
            src="/map.html"
            className="w-full h-full border-0 absolute inset-0 bg-[#030712]"
            title="TenderFlow Interactive Map"
          />
        </div>
      </div>
      
      {/* Map Footer status */}
      <div className="pt-4 border-t border-zinc-900/60 mt-4 flex items-center justify-between text-[9px] text-zinc-550 font-bold font-mono uppercase tracking-wider">
        <span>Contatti Satellite: Rilievo Conforme</span>
        <span>Pipeline Totale: €{(totalActivePipeline / 1000000).toFixed(2)}M</span>
      </div>
    </div>
  )
}
