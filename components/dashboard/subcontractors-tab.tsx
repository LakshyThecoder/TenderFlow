"use client"

import { useState } from "react"
import { ShieldCheck, ShieldAlert, Plus, Users, Award, UserPlus2, RefreshCw, Star, Check, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useLanguage } from "@/lib/LanguageContext"
import { useAppStore } from "@/lib/store/useAppStore"
import { Subcontractor, SubcontractorBid } from "@/lib/types/tender"

export function SubcontractorsTab() {
  const { t, language } = useLanguage()

  // Zustand Store hooks
  const tenders = useAppStore((state) => state.tenders)
  const activeTenderId = useAppStore((state) => state.activeTenderId)
  const subcontractors = useAppStore((state) => state.subcontractors)
  const subBids = useAppStore((state) => state.subBids)
  const updateTender = useAppStore((state) => state.actions.updateTender)
  const setSubcontractors = useAppStore((state) => state.actions.setSubcontractors)
  const setSubBids = useAppStore((state) => state.actions.setSubBids)

  const tender = tenders.find((t) => t.id === activeTenderId) || tenders[0]
  const [selectedPkgId, setSelectedPkgId] = useState<string>(tender?.workPackages[0]?.id || "")
  
  // Dialog controls
  const [showAddSub, setShowAddSub] = useState(false)
  const [newSubName, setNewSubName] = useState("")
  const [newSubSpecialty, setNewSubSpecialty] = useState("excavation")
  const [newSubSoa, setNewSubSoa] = useState("OG1 Classifica II")

  // Sub bidding simulations
  const [biddingSubId, setBiddingSubId] = useState<string | null>(null)
  const [bidPrice, setBidPrice] = useState(100000)
  const [bidDays, setBidDays] = useState(30)

  // Registry verifier states
  const [verifyingPiva, setVerifyingPiva] = useState("")
  const [verifyingName, setVerifyingName] = useState("")
  const [isVerifyingRegistry, setIsVerifyingRegistry] = useState(false)
  const [registryResult, setRegistryResult] = useState<any>(null)

  if (!tender) {
    return <div className="text-zinc-550 text-center py-12 font-mono text-xs">Nessun capitolato attivo. Carica un file nella sezione Ingestione.</div>
  }

  const handleVerifyRegistry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyingName.trim() || !verifyingPiva.trim()) {
      toast.error(language === "it" ? "Inserisci il nome e la partita IVA." : "Please enter company name and VAT number.")
      return
    }
    
    setIsVerifyingRegistry(true)
    setRegistryResult(null)

    const checkPromise = async () => {
      const res = await fetch("/api/v1/subcontractors/verify-registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: verifyingName, partitaIva: verifyingPiva })
      })
      if (!res.ok) {
        throw new Error(language === "it" ? "Errore verifica registro" : "Registry lookup error")
      }
      const data = await res.json()
      setRegistryResult(data)
      setIsVerifyingRegistry(false)
      
      // Update subcontractors list in Zustand store
      const existing = subcontractors.find((s) => s.name.toLowerCase() === verifyingName.toLowerCase())
      if (existing) {
        const updated = subcontractors.map((s) => 
          s.id === existing.id 
            ? { ...s, durcValid: data.durcStatus === "VALID", soaCategory: data.soaCategory, riskScore: data.durcStatus === "VALID" ? ("Basso" as const) : ("Alto" as const) } 
            : s
        )
        setSubcontractors(updated)
      } else {
        const newSub: Subcontractor = {
          id: `sub-${Date.now()}`,
          name: verifyingName,
          specialty: activePackage?.category || "excavation",
          rating: 4.8,
          riskScore: data.durcStatus === "VALID" ? "Basso" as const : "Alto" as const,
          completedProjects: 12,
          durcValid: data.durcStatus === "VALID",
          soaCategory: data.soaCategory
        }
        setSubcontractors([...subcontractors, newSub])
      }

      return data
    }

    toast.promise(checkPromise(), {
      loading: language === "it" ? "Interrogazione registri INPS e ANAC..." : "Querying INPS & ANAC registries...",
      success: (data: any) => 
        data.durcStatus === "VALID" 
          ? (language === "it" ? "Verifica completata: POSIZIONE REGOLARE." : "Audit complete: STANDING OK.")
          : (language === "it" ? "Verifica completata: DURC IRREGOLARE o ANOMALIA SOA." : "Audit complete: EXPIRED DURC or SOA anomaly."),
      error: (err: any) => {
        setIsVerifyingRegistry(false)
        return err.message || "Error"
      }
    })
  }

  const activePackage = tender.workPackages.find((p) => p.id === selectedPkgId)
  const packageBids = subBids.filter((b) => b.workPackageId === selectedPkgId)

  const handleAddSubcontractor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubName.trim()) return

    const newSub: Subcontractor = {
      id: `sub-${Date.now()}`,
      name: newSubName,
      specialty: newSubSpecialty,
      rating: 4.5,
      riskScore: "Basso",
      completedProjects: 8,
      durcValid: true,
      soaCategory: newSubSoa,
    }

    setSubcontractors([...subcontractors, newSub])
    setNewSubName("")
    setShowAddSub(false)
    toast.success(language === "it" ? `Subappaltatore "${newSub.name}" registrato.` : `Subcontractor "${newSub.name}" registered.`);
  }

  const handleSimulateBid = (e: React.FormEvent) => {
    e.preventDefault()
    if (!biddingSubId || !activePackage) return

    const sub = subcontractors.find((s) => s.id === biddingSubId)
    if (!sub) return

    const existingBidIdx = subBids.findIndex(
      (b) => b.subcontractorId === biddingSubId && b.workPackageId === selectedPkgId
    )

    const newBid: SubcontractorBid = {
      id: `bid-${Date.now()}`,
      subcontractorId: sub.id,
      subcontractorName: sub.name,
      workPackageId: activePackage.id,
      priceProposed: bidPrice,
      deliveryDays: bidDays,
      notes: "Preventivo inviato da portale subappalti.",
      isSubmitted: true,
    }

    let updatedBids = [...subBids];
    if (existingBidIdx > -1) {
      updatedBids[existingBidIdx] = newBid;
    } else {
      updatedBids.push(newBid);
    }
    
    setSubBids(updatedBids)
    setBiddingSubId(null)
    toast.success(language === "it" ? `Offerta di €${bidPrice.toLocaleString()} ricevuta!` : `Quote of €${bidPrice.toLocaleString()} received!`)
  }

  const handleAssignSub = (subId: string, bidPriceProposed: number) => {
    const updatedPkgs = tender.workPackages.map((pkg) => {
      if (pkg.id === selectedPkgId) {
        return { ...pkg, assignedSubId: subId, estimatedBudget: bidPriceProposed }
      }
      return pkg
    })
    
    updateTender(tender.id, {
      workPackages: updatedPkgs,
    })
    toast.success(language === "it" ? `Offerta assegnata!` : "Contract assigned!")
  }

  const calculateScore = (bid: SubcontractorBid, sub: Subcontractor, pkgBudget: number) => {
    const priceRatio = pkgBudget / bid.priceProposed
    let priceScore = Math.min(Math.max(priceRatio * 50, 20), 60)
    const ratingScore = (sub.rating / 5) * 20
    let riskScore = 20
    if (sub.riskScore === "Medio") riskScore = 12
    if (sub.riskScore === "Alto" || !sub.durcValid) riskScore = 0

    return Math.round(priceScore + ratingScore + riskScore)
  }

  // Find the AI choice (the bid with highest score)
  const getAiChoiceId = () => {
    if (packageBids.length === 0 || !activePackage) return null
    let bestScore = -1
    let bestSubId = null
    
    packageBids.forEach((bid) => {
      const sub = subcontractors.find((s) => s.id === bid.subcontractorId)
      if (sub) {
        const score = calculateScore(bid, sub, activePackage.estimatedBudget)
        if (score > bestScore) {
          bestScore = score
          bestSubId = bid.subcontractorId
        }
      }
    })
    return bestSubId
  }

  const aiChoiceId = getAiChoiceId()

  return (
    <div className="space-y-6 font-sans">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[8px] font-bold text-zinc-550 uppercase tracking-widest font-mono">Dossier Subappalti</span>
          <h2 className="text-sm font-bold text-zinc-200 mt-1">Confronto Preventivi Lotti</h2>
        </div>
        <button
          onClick={() => setShowAddSub(true)}
          className="px-3.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-zinc-50 transition-all text-xs font-mono font-bold cursor-pointer"
        >
          REGISTER SUBCONTRACTOR
        </button>
      </div>

      {/* Package Selection Bar */}
      <div className="flex bg-zinc-950 p-1 rounded border border-zinc-900 font-mono text-[10px] w-max max-w-full overflow-x-auto scrollbar-hidden" data-lenis-prevent>
        {tender.workPackages.map((pkg) => {
          const isSelected = pkg.id === selectedPkgId
          const bidsCount = subBids.filter((b) => b.workPackageId === pkg.id).length
          
          return (
            <button
              key={pkg.id}
              onClick={() => setSelectedPkgId(pkg.id)}
              className={`px-3.5 py-1.5 rounded font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-zinc-900 text-zinc-100 border border-zinc-850 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/20"
              }`}
            >
              <span>{pkg.name.toUpperCase()}</span>
              <span className="px-1.5 bg-zinc-950 text-zinc-550 border border-zinc-900 rounded">{bidsCount}</span>
            </button>
          )
        })}
      </div>

      {/* Main split work board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side: Side-by-side table comparisons (col-span-3) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20">
            <div className="p-3 bg-zinc-950/40 border-b border-zinc-900 text-[10px] font-mono font-bold text-zinc-400">
              CONFRONTO OFFERTE LOTTO: {activePackage?.name.toUpperCase()}
            </div>
            
            <div className="overflow-x-auto glass-scrollbar" data-lenis-prevent>
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] uppercase tracking-wider bg-zinc-950/20">
                    <th className="p-3 pl-4">Ragione Sociale</th>
                    <th className="p-3 text-right">Offerta (EUR)</th>
                    <th className="p-3 text-right">Scostamento</th>
                    <th className="p-3 text-center">Valutazione</th>
                    <th className="p-3 text-center">DURC</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-center pr-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {packageBids.map((bid) => {
                    const sub = subcontractors.find((s) => s.id === bid.subcontractorId)
                    if (!sub) return null

                    const isAssigned = activePackage?.assignedSubId === sub.id
                    const isAiChoice = aiChoiceId === sub.id
                    const score = calculateScore(bid, sub, activePackage?.estimatedBudget || 1)
                    const priceDiff = ((bid.priceProposed - (activePackage?.estimatedBudget || 1)) / (activePackage?.estimatedBudget || 1)) * 100

                    return (
                      <tr
                        key={bid.subcontractorId}
                        className={`hover:bg-zinc-900/15 transition-all ${
                          isAiChoice ? "bg-zinc-900/10 border-l border-r border-zinc-700" : ""
                        }`}
                      >
                        <td className="p-3 pl-4 font-sans font-bold text-zinc-300 flex items-center gap-1.5">
                          {isAiChoice && <Sparkles className="w-3.5 h-3.5 text-zinc-400 shrink-0 animate-pulse" />}
                          {sub.name}
                        </td>
                        <td className="p-3 text-right font-bold text-zinc-200">€{bid.priceProposed.toLocaleString()}</td>
                        <td className={`p-3 text-right font-bold ${priceDiff > 0 ? "text-zinc-500" : "text-zinc-400"}`}>
                          {priceDiff > 0 ? `+${priceDiff.toFixed(1)}%` : `${priceDiff.toFixed(1)}%`}
                        </td>
                        <td className="p-3 text-center">
                          <span className="flex items-center justify-center gap-1 text-zinc-400">
                            {sub.rating} <Star className="w-3 h-3 text-zinc-500 fill-zinc-500" />
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-1 py-0.2 rounded text-[8px] border font-bold ${
                            sub.durcValid 
                              ? "bg-zinc-900 text-zinc-400 border-zinc-800" 
                              : "bg-red-950/20 text-red-400 border-red-900/50 animate-pulse"
                          }`}>
                            {sub.durcValid ? "VALID" : "EXPIRED"}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-zinc-300">{score}/100</td>
                        <td className="p-3 text-center pr-4">
                          {isAssigned ? (
                            <span className="text-zinc-500 font-bold text-[9px] uppercase bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">ASSIGNED</span>
                          ) : (
                            <button
                              onClick={() => handleAssignSub(sub.id, bid.priceProposed)}
                              disabled={!sub.durcValid}
                              className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                !sub.durcValid
                                  ? "bg-zinc-950 text-zinc-700 cursor-not-allowed border border-zinc-900"
                                  : isAiChoice
                                  ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-950"
                                  : "bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800"
                              }`}
                            >
                              ASSIGN
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {packageBids.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-600">
                        Nessuna offerta caricata per questo lotto. Utilizza il pannello simulatore a destra.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Portal Simulator (col-span-2) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="border border-zinc-900 rounded-lg p-5 flex flex-col justify-between bg-zinc-950/10 min-h-[300px]">
            <div>
              <span className="text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-widest">Simulator Desk</span>
              <h3 className="text-xs font-bold text-zinc-200 mt-1">Simulatore Ricezione Offerte</h3>
              <p className="text-[10px] text-zinc-550 leading-relaxed mt-0.5">Invia un preventivo simulato per il lotto attivo tramite portale subappalti.</p>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 glass-scrollbar mt-4" data-lenis-prevent>
              {subcontractors
                .filter((sub) => sub.specialty === activePackage?.category)
                .map((sub) => {
                  const hasSubmitted = packageBids.some((b) => b.subcontractorId === sub.id)
                  return (
                    <div
                      key={sub.id}
                      className="p-3 bg-zinc-950 border border-zinc-900 rounded flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 font-sans">
                        <p className="font-bold text-zinc-300 truncate">{sub.name}</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{sub.soaCategory} • DURC: {sub.durcValid ? "OK" : "NO"}</p>
                      </div>
                      <button
                        onClick={() => {
                          setBiddingSubId(sub.id)
                          const baseEst = activePackage?.estimatedBudget || 100000
                          setBidPrice(Math.round(baseEst * (0.85 + Math.random() * 0.2)))
                          setBidDays(25 + Math.round(Math.random() * 15))
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-zinc-100 transition-all text-[9px] font-mono font-bold cursor-pointer"
                      >
                        {hasSubmitted ? "UPDATE" : "SIMULATE"}
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Registry Verification Panel */}
          <div className="border border-zinc-900 rounded-lg p-5 bg-zinc-950/10 space-y-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-zinc-555 uppercase tracking-widest">Registry Standing Auditor</span>
              <h3 className="text-xs font-bold text-zinc-200 mt-1">Verifica Posizione DURC / ANAC</h3>
              <p className="text-[10px] text-zinc-555 leading-relaxed mt-0.5">Interroga in tempo reale le banche dati INPS e il Casellario Informatico ANAC.</p>
            </div>

            <form onSubmit={handleVerifyRegistry} className="space-y-3 font-mono text-[10px]">
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-bold text-zinc-500">Ragione Sociale</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nuova Clima S.r.l."
                  value={verifyingName}
                  onChange={(e) => setVerifyingName(e.target.value)}
                  className="w-full h-8 bg-zinc-950 border border-zinc-900 rounded px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-850"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] uppercase font-bold text-zinc-500">Partita IVA (11 Cifre)</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="e.g. 01234567890"
                  value={verifyingPiva}
                  onChange={(e) => setVerifyingPiva(e.target.value)}
                  className="w-full h-8 bg-zinc-950 border border-zinc-900 rounded px-2.5 text-xs text-zinc-350 focus:outline-none focus:border-zinc-850"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingRegistry}
                className="w-full py-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-250 transition-all font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isVerifyingRegistry ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    AUDITING STANDING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    RUN COMPLIANCE VERIFICATION
                  </>
                )}
              </button>
            </form>

            {/* Verification Result Stamp Document */}
            {registryResult && (
              <div className="border border-zinc-900 bg-zinc-950 p-4 rounded space-y-3 relative overflow-hidden font-mono text-[9px] text-zinc-400">
                {/* Official Stamp Border */}
                <div className={`absolute top-2 right-2 border-[1.5px] uppercase font-bold text-[8px] px-2 py-0.5 tracking-wider rotate-[4deg] select-none ${
                  registryResult.durcStatus === "VALID"
                    ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/10"
                    : "border-red-500/40 text-red-400 bg-red-950/10"
                }`}>
                  {registryResult.durcStatus === "VALID" ? "APPROVED" : "REJECTED"}
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-zinc-350">REGISTRY AUDIT REPORT</p>
                  <p className="text-zinc-600">VAT ID: {registryResult.registryDetails.vat || verifyingPiva} • AUDIT: INPS-{registryResult.registryDetails.inpsInspectorCode}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-zinc-500 border-t border-b border-zinc-900 py-2">
                  <div>
                    <span className="block text-[8px] text-zinc-600 font-bold">DURC STATUS</span>
                    <span className={`font-bold ${registryResult.durcStatus === "VALID" ? "text-emerald-400" : "text-red-400 animate-pulse"}`}>
                      {registryResult.durcStatus}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-600 font-bold">EXPIRATION</span>
                    <span className="font-bold text-zinc-350">{registryResult.expirationDate}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-600 font-bold">SOA CERT</span>
                    <span className="font-bold text-zinc-350 truncate block">{registryResult.soaCategory || "Nessuna"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-600 font-bold">ANAC PRECLUSION</span>
                    <span className="font-bold text-zinc-350">{registryResult.anacPreclusion ? "YES" : "NO"}</span>
                  </div>
                </div>

                <div className="leading-relaxed">
                  <p className="text-[8px] text-zinc-600 font-bold">AUDIT FINDINGS</p>
                  <p className="text-zinc-500 mt-0.5 leading-normal">{registryResult.registryDetails.findings}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Subcontractor Dialog */}
      <AnimatePresence>
        {showAddSub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-955/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl font-mono text-xs"
            >
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Register Subcontractor</h3>
              <form onSubmit={handleAddSubcontractor} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Company Name</label>
                  <Input
                    required
                    placeholder="Milano Costruzioni S.r.l."
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="bg-[#030303] border-zinc-900 text-zinc-200 text-xs focus-visible:ring-zinc-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500">Specialty</label>
                    <select
                      value={newSubSpecialty}
                      onChange={(e) => setNewSubSpecialty(e.target.value)}
                      className="w-full h-9 bg-[#030303] border border-zinc-900 rounded px-2 text-xs text-zinc-350 focus:outline-none"
                    >
                      <option value="excavation">Scavi (Excavation)</option>
                      <option value="concrete">Cemento (Concrete)</option>
                      <option value="steel">Acciaio (Steel)</option>
                      <option value="finishing">Finiture (Finishing)</option>
                      <option value="installations">Impianti (Installations)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500">SOA Qualification</label>
                    <Input
                      placeholder="OG1 Classifica III"
                      value={newSubSoa}
                      onChange={(e) => setNewSubSoa(e.target.value)}
                      className="bg-[#030303] border-zinc-900 text-zinc-200 text-xs focus-visible:ring-zinc-800"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSub(false)}
                    className="px-3.5 py-1.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 font-bold hover:text-zinc-200 cursor-pointer"
                  >
                    CLOSE
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold cursor-pointer"
                  >
                    SAVE
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Simulate Bid Dialog */}
        {biddingSubId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-955/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl font-mono text-xs"
            >
              <div>
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Simulate Quote Entry</h3>
                <p className="text-[10px] text-zinc-500 mt-1 leading-normal font-sans">
                  Lotto: {activePackage?.name}
                </p>
              </div>
              
              <form onSubmit={handleSimulateBid} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Proposed Price (EUR)</label>
                  <Input
                    type="number"
                    required
                    value={bidPrice}
                    onChange={(e) => setBidPrice(parseInt(e.target.value) || 0)}
                    className="bg-[#030303] border-zinc-900 text-zinc-200 focus-visible:ring-zinc-800"
                  />
                  <p className="text-[9px] text-zinc-550 mt-1 font-mono">ESTIMATE: €{activePackage?.estimatedBudget.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Delivery timeframe (Days)</label>
                  <Input
                    type="number"
                    required
                    value={bidDays}
                    onChange={(e) => setBidDays(parseInt(e.target.value) || 0)}
                    className="bg-[#030303] border-zinc-900 text-zinc-200 focus-visible:ring-zinc-800"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setBiddingSubId(null)}
                    className="px-3.5 py-1.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 font-bold hover:text-zinc-200 cursor-pointer"
                  >
                    CLOSE
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold cursor-pointer"
                  >
                    SUBMIT
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
