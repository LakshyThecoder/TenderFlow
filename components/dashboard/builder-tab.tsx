"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from "recharts"
import { FileDown, Percent, Coins, Award, FileText, Info, TrendingUp, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useLanguage } from "@/lib/LanguageContext"
import { useAppStore } from "@/lib/store/useAppStore"
import { calculateTenderPricing, computeWinProbability } from "@/lib/engines"
import { SmartPriceSuggestionV2 } from "./smart-price-suggestion-v2"

interface BuilderTabProps {
  setActiveTab: (tab: string) => void
}

export function BuilderTab({ setActiveTab }: BuilderTabProps) {
  const { t, language } = useLanguage()
  
  const tenders = useAppStore((state) => state.tenders)
  const activeTenderId = useAppStore((state) => state.activeTenderId)
  const updateTender = useAppStore((state) => state.actions.updateTender)

  const tender = tenders.find((t) => t.id === activeTenderId) || tenders[0]
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfReady, setPdfReady] = useState(false)

  if (!tender) {
    return <div className="text-zinc-550 text-center py-12 font-mono text-xs">Nessun capitolato attivo. Carica un file nella sezione Intake.</div>
  }

  const marginPercent = tender.computed.marginPercent
  const totalBaseCost = tender.boq.reduce((acc, item) => acc + item.quantity * item.unitPriceEUR, 0)
  
  // Region multiplier lookup
  let regionMultiplier = 1.0;
  switch (tender.region) {
    case "Lombardia":
      regionMultiplier = 1.05;
      break;
    case "Veneto":
      regionMultiplier = 1.02;
      break;
    case "Lazio":
      regionMultiplier = 1.04;
      break;
    case "Campania":
      regionMultiplier = 0.98;
      break;
    case "Sicilia":
      regionMultiplier = 0.95;
      break;
    case "Piemonte":
    default:
      regionMultiplier = 1.00;
      break;
  }

  const pricing = calculateTenderPricing({
    boq: tender.boq,
    regionMultiplier,
    targetMargin: marginPercent,
  })

  const totalBidPrice = pricing.suggestedBid
  const netProfit = totalBidPrice - pricing.adjustedCost

  const handleMarginChange = (margin: number) => {
    const newPricing = calculateTenderPricing({
      boq: tender.boq,
      regionMultiplier,
      targetMargin: margin,
    })

    const newWinProb = computeWinProbability({
      priceCompetitiveness: Math.max(0, 100 - margin * 3.5),
      riskScore: tender.computed.riskScore,
      regionStrength: tender.region === "Lombardia" ? 80 : 50,
    })

    updateTender(tender.id, {
      computed: {
        ...tender.computed,
        marginPercent: margin,
        suggestedBidEUR: newPricing.suggestedBid,
        winProbability: Math.round(newWinProb),
      }
    })
  }

  const handleGenerateProposal = () => {
    setIsGeneratingPdf(true)
    setPdfReady(false)

    setTimeout(() => {
      setIsGeneratingPdf(false)
      setPdfReady(true)
      toast.success(language === "it" ? "Documento d'offerta pronto!" : "Proposal ready!");
    }, 1500)
  }

  const handleDownloadPdf = () => {
    setPdfReady(false)
    toast.success(language === "it" ? "File scaricato." : "Downloaded.")
  }

  // Sweet Spot Simulator Data Generation
  const simulatorData = Array.from({ length: 31 }, (_, m) => {
    const simPricing = calculateTenderPricing({
      boq: tender.boq,
      regionMultiplier,
      targetMargin: m,
    })
    const simWinProb = computeWinProbability({
      priceCompetitiveness: Math.max(0, 100 - m * 3.5),
      riskScore: tender.computed.riskScore,
      regionStrength: tender.region === "Lombardia" ? 80 : 50,
    })
    const expectedValue = (simWinProb * simPricing.suggestedBid) / 100

    return {
      margin: m,
      winProbability: Math.round(simWinProb),
      expectedValue: Math.round(expectedValue)
    }
  })

  // Find Sweet Spot (where expectedValue is maximized)
  let sweetSpotMargin = 0
  let maxExpectedValue = -1
  simulatorData.forEach((d) => {
    if (d.expectedValue > maxExpectedValue) {
      maxExpectedValue = d.expectedValue
      sweetSpotMargin = d.margin
    }
  })

  const activeExpectedValue = Math.round((tender.computed.winProbability * totalBidPrice) / 100)

  return (
    <div className="space-y-6 font-sans">
      {/* Grid of flat stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-zinc-900 rounded-lg divide-y md:divide-y-0 md:divide-x divide-zinc-900 bg-zinc-950/20">
        {[
          { title: t("widgetBaseCost"), value: `€${Math.round(totalBaseCost).toLocaleString()}`, desc: t("widgetBaseCostDesc"), icon: Coins },
          { title: t("widgetFinalOffer"), value: `€${Math.round(totalBidPrice).toLocaleString()}`, desc: `${t("widgetFinalOfferDesc")}${marginPercent}%`, icon: Award },
          { title: t("widgetNetProfit"), value: `€${Math.round(netProfit).toLocaleString()}`, desc: `Net margin (${marginPercent}%)`, icon: Percent },
        ].map((item, idx) => (
          <div key={idx} className="p-5 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{item.title}</span>
              <item.icon className="w-3.5 h-3.5 text-zinc-650" />
            </div>
            <div>
              <span className="text-xl font-bold font-display text-zinc-100 block">{item.value}</span>
              <span className="text-[9px] text-zinc-600 font-mono mt-0.5 block">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Simulator panels split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Controls Pane */}
        <div className="lg:col-span-2 border border-zinc-900 rounded-lg p-5 flex flex-col justify-between min-h-[320px] bg-zinc-950/10">
          <div>
            <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest font-mono">Control Desk</span>
            <h3 className="text-sm font-bold text-zinc-200 mt-1">{t("sliderTitle")}</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">{t("sliderDesc")}</p>
          </div>

          <div className="flex gap-1.5 bg-zinc-950 p-1 rounded border border-zinc-900 font-mono mt-4">
            {[5, 10, 15, 20].map((m) => (
              <button
                key={m}
                onClick={() => handleMarginChange(m)}
                className={`flex-1 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  marginPercent === m
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/25"
                }`}
              >
                {m}%
              </button>
            ))}
          </div>

          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-baseline text-[9px] font-bold font-mono text-zinc-500">
              <span>Applied Markup:</span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    handleMarginChange(sweetSpotMargin)
                    toast.success(
                      language === "it"
                        ? `Margine ottimizzato al ${sweetSpotMargin}% (Valore atteso massimizzato)`
                        : `Margin optimized to ${sweetSpotMargin}% (Maximum Expected Value)`
                    )
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[8px] text-zinc-450 hover:text-zinc-200 transition-all font-bold cursor-pointer"
                >
                  AUTO-OPTIMIZE
                </button>
                <span className="text-zinc-100 text-base">{marginPercent}%</span>
              </div>
            </div>
            
            <Slider
              min={0}
              max={30}
              step={0.5}
              value={[marginPercent]}
              onValueChange={(val) => handleMarginChange(val[0])}
              className="py-2 cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-zinc-900 flex items-start gap-2 text-[10px] text-zinc-500 mt-4 leading-normal font-sans">
            <Info className="w-4 h-4 text-zinc-650 shrink-0 mt-0.5" />
            <p>
              Expected Value peaks at a markup of <strong className="text-zinc-300">{sweetSpotMargin}%</strong> based on current competitive risk profiles.
            </p>
          </div>
        </div>

        {/* Recharts chart Pane */}
        <div className="lg:col-span-3 border border-zinc-900 rounded-lg p-5 flex flex-col justify-between min-h-[320px] bg-zinc-950/10">
          <div>
            <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold tracking-widest text-zinc-400 uppercase bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded w-max">
              <TrendingUp className="w-3.5 h-3.5" /> Expected Value Curve
            </div>
            <h3 className="text-sm font-bold text-zinc-200 mt-2">Curve Optimization Engine</h3>
            <p className="text-[10px] text-zinc-550 mt-0.5">Calculated expected payout (Bid Price × Win Probability) per margin percentage.</p>
          </div>

          <div className="h-[180px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={simulatorData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(data) => {
                  if (data && data.activeLabel !== undefined) {
                    const selectedMargin = parseInt(data.activeLabel.toString())
                    handleMarginChange(selectedMargin)
                  }
                }}
              >
                <defs>
                  <linearGradient id="expValMono" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="#18181b" vertical={false} />
                <XAxis dataKey="margin" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} dy={5} className="font-mono" />
                <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} dx={-5} className="font-mono" />
                <Tooltip
                  cursor={{ stroke: "#27272a", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    borderRadius: "6px",
                    color: "#f4f4f5",
                    fontSize: "9px",
                    fontFamily: "monospace",
                    padding: "6px 10px"
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === "expectedValue") return [`€${value.toLocaleString()}`, "Exp Revenue"]
                    if (name === "winProbability") return [`${value}%`, "Win Prob"]
                    return [value, name]
                  }}
                />
                
                <Area
                  type="monotone"
                  dataKey="expectedValue"
                  name="expectedValue"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  fill="url(#expValMono)"
                />

                <ReferenceLine x={sweetSpotMargin} stroke="#3f3f46" strokeWidth={1} strokeDasharray="3 3" />
                <ReferenceDot x={sweetSpotMargin} y={maxExpectedValue} r={3.5} fill="#ffffff" stroke="#09090b" strokeWidth={1.5} />
                <ReferenceDot x={marginPercent} y={activeExpectedValue} r={3.5} fill="#52525b" stroke="#09090b" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-600 border-t border-zinc-900 pt-2.5 mt-2">
            <div className="flex gap-4">
              <span>SWEET SPOT: {sweetSpotMargin}%</span>
              <span>ACTIVE MARKUP: {marginPercent}%</span>
            </div>
            <span>CLICK CHART TO SET MARKUP</span>
          </div>
        </div>
      </div>

      {/* Bill of Quantities final bids */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-550">{t("tableBoqTitle")}</h3>
        <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20">
          <div className="overflow-x-auto glass-scrollbar max-h-[300px]" data-lenis-prevent>
            <Table>
              <TableHeader className="bg-zinc-950/80 sticky top-0 z-20 backdrop-blur-lg">
                <TableRow className="border-b border-zinc-900 hover:bg-transparent">
                  <TableHead className="w-24 text-zinc-500 text-xs font-mono">{t("colCode")}</TableHead>
                  <TableHead className="text-zinc-505 text-xs">{t("colDescription")}</TableHead>
                  <TableHead className="w-28 text-right text-zinc-505 text-xs">{t("colQuantity")}</TableHead>
                  <TableHead className="w-28 text-right text-zinc-505 text-xs">{t("colRegPrice")}</TableHead>
                  <TableHead className="w-32 text-right text-zinc-505 text-xs">
                    <span className="flex items-center gap-1 justify-end">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      AI Price
                    </span>
                  </TableHead>
                  <TableHead className="w-28 text-right text-zinc-505 text-xs">Offered Unit</TableHead>
                  <TableHead className="w-32 text-right text-zinc-505 text-xs">Offered Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-mono text-xs">
                {tender.boq.map((item) => {
                  const offeredPrice = item.unitPriceEUR * (1 + marginPercent / 100)
                  const offeredSubtotal = item.quantity * offeredPrice

                  return (
                    <TableRow key={item.id} className="border-b border-zinc-900/30 hover:bg-zinc-900/10">
                      <td className="p-3 text-zinc-500">{item.id}</td>
                      <td className="p-3 font-sans text-zinc-350 max-w-sm truncate">{item.description}</td>
                      <td className="p-3 text-right text-zinc-400">
                        {item.quantity} <span className="text-[9px] text-zinc-600 font-sans">{item.unit}</span>
                      </td>
                      <td className="p-3 text-right text-zinc-500">€{item.unitPriceEUR.toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex justify-end">
                          <SmartPriceSuggestionV2
                            itemDescription={item.description}
                            quantity={item.quantity}
                            unit={item.unit}
                            region={tender.region}
                            category={item.category}
                            currentPrice={item.unitPriceEUR}
                            onApplySuggestion={(price) => {
                              // Update the item price via store
                              const updatedBoq = tender.boq.map((boqItem) =>
                                boqItem.id === item.id
                                  ? { ...boqItem, unitPriceEUR: price }
                                  : boqItem
                              );
                              updateTender(tender.id, { boq: updatedBoq });
                              toast.success(`Price updated for ${item.id}`);
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-right text-zinc-350 font-bold">€{offeredPrice.toFixed(2)}</td>
                      <td className="p-3 text-right text-zinc-200 font-bold pr-4">
                        €{offeredSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-zinc-950/20 border border-zinc-900 p-5 rounded-lg shadow-sm">
        <div className="max-w-md space-y-1">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
            <FileText className="w-4 h-4" /> {t("pdfTitle")}
          </h4>
          <p className="text-[10px] text-zinc-550 leading-relaxed font-sans">{t("pdfDesc")}</p>
        </div>
        <button
          onClick={handleGenerateProposal}
          disabled={isGeneratingPdf}
          className="px-4 py-2 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono font-bold transition-all text-xs disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isGeneratingPdf ? t("pdfCompiling").toUpperCase() : t("btnGeneratePdf").toUpperCase()}
        </button>
      </div>

      {/* Simulated compiler modal */}
      <AnimatePresence>
        {isGeneratingPdf && (
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
              className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 max-w-xs w-full text-center space-y-4 shadow-xl"
            >
              <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto animate-pulse">
                <FileDown className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="space-y-1 font-mono">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Generating PDF</h3>
                <p className="text-[9px] text-zinc-550 leading-relaxed font-sans">
                  Compiling bid sheet dossier for {tender.cig || tender.id}...
                </p>
              </div>
              <div className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-zinc-100"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Paper Document Preview */}
        {pdfReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-955/70 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              className="bg-[#09090b] border border-zinc-900 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl my-8 font-sans"
            >
              {/* Preview Header bar */}
              <div className="bg-[#09090b] border-b border-zinc-900 px-6 py-3.5 flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{t("pdfPreviewTitle")}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleDownloadPdf}
                    className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-xs cursor-pointer"
                  >
                    DOWNLOAD
                  </button>
                  <button
                    onClick={() => setPdfReady(false)}
                    className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-750 text-zinc-300 hover:text-zinc-100 transition-all font-mono font-bold text-xs cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>
              </div>

              {/* Paper styled document */}
              <div className="p-10 pdf-sheet text-zinc-800 space-y-6 text-xs max-h-[60vh] overflow-y-auto glass-scrollbar select-text leading-relaxed relative border border-slate-350" data-lenis-prevent>
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-900">{t("pdfAuthor")}</h2>
                    <p className="text-[8px] text-zinc-500 font-mono mt-0.5 leading-normal">{t("pdfAuthorAddress")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-zinc-450 tracking-wider uppercase">{t("pdfToAuthority")}</p>
                    <p className="text-[10px] font-extrabold text-zinc-700">{tender.stazioneAppaltante || "N/A"}</p>
                  </div>
                </div>

                <div className="text-center space-y-1 py-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 font-mono">{t("pdfDocTitle")}</h3>
                  <p className="text-[9px] font-mono text-zinc-500">{t("kpiSelectedTender")}: {tender.title} — {tender.cig || tender.id}</p>
                </div>

                <p className="text-zinc-650 leading-relaxed text-[11px]">
                  {t("pdfIntro")}
                </p>

                {/* Economic Summary Table */}
                <table className="w-full border-collapse border border-slate-200 text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-zinc-700 font-bold uppercase tracking-wider text-[8px] font-mono">
                      <th className="border border-slate-200 p-2">{t("pdfColDesc")}</th>
                      <th className="border border-slate-200 p-2 text-right">{t("pdfColBase")}</th>
                      <th className="border border-slate-200 p-2 text-right">{t("pdfColMarkup")}</th>
                      <th className="border border-slate-200 p-2 text-right">{t("pdfColFinal")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="border border-slate-200 p-2 font-medium text-zinc-800">{t("pdfRowBoq")}</td>
                      <td className="border border-slate-200 p-2 text-right font-mono text-zinc-500">€{totalBaseCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="border border-slate-200 p-2 text-right font-mono text-zinc-600 font-bold">+{marginPercent.toFixed(1)}%</td>
                      <td className="border border-slate-200 p-2 text-right font-bold font-mono text-zinc-900">€{totalBidPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="border border-slate-200 p-2 font-medium text-zinc-800">{t("pdfRowSafety")}</td>
                      <td className="border border-slate-200 p-2 text-right font-mono text-zinc-500">€34.200,00</td>
                      <td className="border border-slate-200 p-2 text-right font-mono text-zinc-600">0.0%</td>
                      <td className="border border-slate-200 p-2 text-right font-mono text-zinc-600">€34.200,00</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-zinc-900 border-t border-slate-300 font-mono text-[11px]">
                      <td className="border border-slate-200 p-2 uppercase text-zinc-800">{t("pdfRowTotal")}</td>
                      <td className="border border-slate-200 p-2 text-right text-zinc-500">€{(totalBaseCost + 34200).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="border border-slate-200 p-2 text-right"></td>
                      <td className="border border-slate-200 p-2 text-right text-zinc-950">€{(totalBidPrice + 34200).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-zinc-650 text-[10px] italic">
                  {t("pdfValidity")}
                </p>

                <div className="pt-6 flex justify-between items-end text-[10px]">
                  <div>
                    <p className="text-zinc-450 font-bold uppercase tracking-wider text-[7px] font-mono">{t("pdfSignatureDate")}</p>
                    <p className="font-bold mt-1 text-zinc-700">{tender.region}, {new Date().toLocaleDateString()}</p>
                  </div>
                  
                  <div className="pdf-stamp px-3 py-1 text-center font-mono">
                    <p className="text-[6px] font-bold leading-none">APPROVED</p>
                    <p className="text-[9px] font-bold tracking-widest mt-0.5">{tender.cig || "VERIFIED"}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-zinc-450 font-bold uppercase tracking-wider text-[7px] font-mono">{t("pdfSignatureTitle")}</p>
                    <div className="w-24 h-[1px] bg-slate-350 mt-4 mx-auto" />
                    <p className="italic text-[8px] text-zinc-450 mt-1 font-mono">{t("pdfSignatureDigital")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
