"use client"

import { useState, useRef } from "react"
import { Upload, Check, AlertCircle, Plus, Trash2, ArrowRight, Server, AlertTriangle, Search, Filter, RefreshCw, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useLanguage } from "@/lib/LanguageContext"
import { useAppStore } from "@/lib/store/useAppStore"
import { BOQItem } from "@/lib/types/tender"

interface IntakeTabProps {
  setActiveTab: (tab: string) => void
}

export function IntakeTab({ setActiveTab }: IntakeTabProps) {
  const { t, language } = useLanguage()
  
  const tenders = useAppStore((state) => state.tenders)
  const activeTenderId = useAppStore((state) => state.activeTenderId)
  const updateTender = useAppStore((state) => state.actions.updateTender)

  const tender = tenders.find((t) => t.id === activeTenderId) || tenders[0]
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [logMessages, setLogMessages] = useState<{ type: "info" | "warn" | "success"; text: string }[]>([])
  const [hasUploaded, setHasUploaded] = useState(tender ? tender.boq.length > 0 : false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAligning, setIsAligning] = useState(false)

  const handleAlignPrezzario = async () => {
    if (!tender || tender.boq.length === 0) return
    setIsAligning(true)

    const alignPromise = async () => {
      const res = await fetch("/api/v1/pricing/prezzario-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: tender.boq, region: tender.region })
      })
      if (!res.ok) {
        throw new Error(language === "it" ? "Errore allineamento prezzari" : "Bulletins alignment error")
      }
      const data = await res.json()
      const matches = data.matches || []

      // Map matching results back to the BOQ items
      const updatedBoq = tender.boq.map((item) => {
        const match = matches.find((m: any) => m.id === item.id)
        if (match) {
          return {
            ...item,
            matchedCode: match.matchedCode,
            catalogPrice: match.catalogPrice,
            variancePercent: match.variancePercent
          }
        }
        return item
      })

      updateTender(tender.id, {
        boq: updatedBoq,
        computed: {
          ...tender.computed,
          totalCostEUR: updatedBoq.reduce((acc, item) => acc + item.quantity * item.unitPriceEUR, 0),
          suggestedBidEUR: updatedBoq.reduce((acc, item) => acc + item.quantity * item.unitPriceEUR, 0) * (1 + tender.computed.marginPercent / 100),
        }
      })
      return matches
    }

    toast.promise(alignPromise(), {
      loading: language === "it" ? "Allineamento prezzari regionali con AI..." : "Aligning items with Regional bulletins...",
      success: (matches: any) => {
        setIsAligning(false)
        return language === "it" 
          ? `Allineati con successo ${matches.length} articoli.` 
          : `Aligned ${matches.length} items successfully.`;
      },
      error: (err: any) => {
        setIsAligning(false)
        return err.message || "Error"
      }
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(10)
    setLogMessages([
      { type: "info", text: language === "it" ? "Inizializzazione motore di Ingestione..." : "Initializing Ingestion engine..." },
      { type: "success", text: `${language === "it" ? "File caricato" : "File uploaded"}: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` }
    ])
    setHasUploaded(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      setLogMessages((prev) => [...prev, { type: "info", text: language === "it" ? "Invio file a LlamaParse per estrazione tabelle (40s max)..." : "Uploading document to LlamaParse for layout extraction..." }])
      setUploadProgress(30)

      const response = await fetch("/api/v1/boq/parse", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(70)

      if (!response.ok) {
        throw new Error(await response.text())
      }

      setLogMessages((prev) => [
        ...prev,
        { type: "info", text: language === "it" ? "Estrazione tabelle Markdown completata." : "Extracted Markdown tables successfully." },
        { type: "info", text: language === "it" ? "Mappatura schema JSON con Mistral AI..." : "Mapping database schemas with Mistral AI..." }
      ])
      setUploadProgress(85)

      const data = await response.json()
      const parsedItems = data.items || []

      setUploadProgress(100)
      setLogMessages((prev) => [
        ...prev,
        { type: "success", text: language === "it" ? `Completato. Mappate ${parsedItems.length} voci nel computo.` : `Complete. Mapped ${parsedItems.length} BOQ items.` }
      ])

      setTimeout(() => {
        setIsUploading(false)
        setHasUploaded(true)

        if (tender) {
          updateTender(tender.id, {
            boq: parsedItems,
            status: "analyzing" as const,
            computed: {
              ...tender.computed,
              totalCostEUR: parsedItems.reduce((acc: number, item: any) => acc + item.quantity * item.unitPriceEUR, 0),
              suggestedBidEUR: parsedItems.reduce((acc: number, item: any) => acc + item.quantity * item.unitPriceEUR, 0) * (1 + tender.computed.marginPercent / 100),
            }
          })
        }
        toast.success(language === "it" ? "Capitolato letto ed importato!" : "Tender parsed successfully!")
      }, 800)

    } catch (err: any) {
      console.error(err)
      setIsUploading(false)
      toast.error(language === "it" ? "Errore di parsing. Riprova." : "Ingestion parse failed.")
    }
  }

  const handleSimulatedUpload = async () => {
    setIsUploading(true)
    setUploadProgress(0)
    setLogMessages([])
    setHasUploaded(false)

    const getLogs = () => {
      switch (language) {
        case "en":
          return [
            { type: "info", text: "Initializing TenderFlow Ingestion Engine v2.4.6..." },
            { type: "success", text: "Target File: computo_metrico_scuola.pdf uploaded successfully (4.2MB)" },
            { type: "info", text: "Starting computer vision layout analysis..." },
            { type: "info", text: "OCR Pipeline active. OCR engine: LayoutLMv3-Construction." },
            { type: "info", text: "Mapping table structure: extracted raw tabular rows." },
            { type: "info", text: "Aligning items with Regional Price Catalog..." },
            { type: "success", text: "Code match found: NP.01.010 aligned with Excavation." },
            { type: "success", text: "Code match found: NP.02.040 aligned with Concrete structures." },
            { type: "warn", text: "Compliance Check: Subcontractor 'Nuova Clima S.r.l.' possesses expired DURC certificate (Exp: 15/05/2026)." },
            { type: "info", text: "Work packages parsed: Excavation, Structural, MEP, Finishes mapped." },
            { type: "success", text: "Ingestion and extraction complete. Matrix generated." }
          ]
        case "it":
        default:
          return [
            { type: "info", text: "Inizializzazione del motore di Ingestione TenderFlow v2.4.6..." },
            { type: "success", text: "File di destinazione caricato con successo: computo_metrico_scuola.pdf (4.2MB)" },
            { type: "info", text: "Analisi del layout tramite computer vision..." },
            { type: "info", text: "Pipeline OCR attiva. OCR engine: LayoutLMv3-Construction." },
            { type: "info", text: "Struttura tabellare mappata: estratte righe grezze dal documento." },
            { type: "info", text: "Allineamento voci con il Prezzario Regionale di riferimento..." },
            { type: "success", text: "Corrispondenza codice trovata: NP.01.010 corrisponde a Scavo." },
            { type: "success", text: "Corrispondenza codice trovata: NP.02.040 corrisponde a Calcestruzzo." },
            { type: "warn", text: "Verifica Conformità: Subappaltatore 'Nuova Clima S.r.l.' presenta DURC scaduto in data 15/05/2026." },
            { type: "info", text: "Mappatura lotti completata: Scavi, Strutture, Impianti, Finiture." },
            { type: "success", text: "Estrazione e analisi completata. Matrice generata con successo." }
          ]
      }
    }

    const logs = getLogs()
    let logIdx = 0
    
    // Perform API call to parser in parallel
    let parsedItems: BOQItem[] = [];
    try {
      const response = await fetch("/api/v1/boq/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileText: "scavo calcestruzzo acciaio intonaco impianto" }),
      });
      const data = await response.json();
      parsedItems = data.items || [];
    } catch (err) {
      console.error("Error calling parse API:", err);
    }

    const interval = setInterval(() => {
      if (logIdx < logs.length) {
        setLogMessages((prev) => [...prev, logs[logIdx]])
        setUploadProgress((prev) => Math.min(prev + 10, 100))
        logIdx++
      } else {
        clearInterval(interval)
        setUploadProgress(100)
        setTimeout(() => {
          setIsUploading(false)
          setHasUploaded(true)

          if (tender) {
            updateTender(tender.id, {
              boq: parsedItems,
              status: "analyzing" as const,
              computed: {
                ...tender.computed,
                totalCostEUR: parsedItems.reduce((acc, item) => acc + item.quantity * item.unitPriceEUR, 0),
                suggestedBidEUR: parsedItems.reduce((acc, item) => acc + item.quantity * item.unitPriceEUR, 0) * (1 + tender.computed.marginPercent / 100),
              }
            })
          }

          toast.success(language === "it" ? "Computo metrico caricato!" : "BOQ loaded successfully!")
        }, 600)
      }
    }, 200)
  }

  const handleUpdateItem = (itemId: string, field: keyof BOQItem, value: any) => {
    if (!tender) return;

    const updatedBoq = tender.boq.map((item) => {
      if (item.id === itemId) {
        const updatedVal = field === "quantity" || field === "unitPriceEUR" ? parseFloat(value) || 0 : value
        return { ...item, [field]: updatedVal }
      }
      return item
    })

    const totalCostEUR = updatedBoq.reduce((acc, item) => acc + item.quantity * item.unitPriceEUR, 0)
    updateTender(tender.id, {
      boq: updatedBoq,
      computed: {
        ...tender.computed,
        totalCostEUR,
        suggestedBidEUR: totalCostEUR * (1 + tender.computed.marginPercent / 100),
      }
    })
  }

  const handleAddRow = () => {
    if (!tender) return;

    const newItem: BOQItem = {
      id: `NP.0${tender.boq.length + 1}.010`,
      category: "concrete",
      description: language === "it" ? "Lavorazione edile integrativa da computo" : "Supplementary construction work item",
      quantity: 10,
      unit: "mq",
      unitPriceEUR: 45.00,
    }

    const updatedBoq = [...tender.boq, newItem]
    const totalCostEUR = updatedBoq.reduce((acc, item) => acc + item.quantity * item.unitPriceEUR, 0)

    updateTender(tender.id, {
      boq: updatedBoq,
      computed: {
        ...tender.computed,
        totalCostEUR,
        suggestedBidEUR: totalCostEUR * (1 + tender.computed.marginPercent / 100),
      }
    })
    toast.success(language === "it" ? "Nuova riga inserita." : "New row added.")
  }

  const handleDeleteRow = (itemId: string) => {
    if (!tender) return;

    const updatedBoq = tender.boq.filter((i) => i.id !== itemId)
    const totalCostEUR = updatedBoq.reduce((acc, item) => acc + item.quantity * item.unitPriceEUR, 0)

    updateTender(tender.id, {
      boq: updatedBoq,
      computed: {
        ...tender.computed,
        totalCostEUR,
        suggestedBidEUR: totalCostEUR * (1 + tender.computed.marginPercent / 100),
      }
    })
    toast.success(language === "it" ? "Voce rimossa dal computo." : "Item removed from BOQ.")
  }

  const filteredBoq = tender?.boq.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  }) || []

  return (
    <div className="space-y-6 font-sans">
      <AnimatePresence mode="wait">
        {!hasUploaded && !isUploading ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-zinc-800 bg-zinc-950/20 hover:bg-[#0c0c0e] hover:border-zinc-700 rounded-lg p-16 text-center cursor-pointer transition-all duration-300 relative overflow-hidden"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.xlsx"
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center max-w-sm mx-auto relative z-10">
                <div className="w-10 h-10 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Upload BOQ Document</h3>
                <p className="text-[10px] text-zinc-550 mt-1">
                  Seleziona o trascina il computo metrico estimativo (PDF o XLSX).
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSimulatedUpload()
                  }}
                  className="mt-3 text-[9px] text-zinc-400 hover:text-zinc-200 underline font-mono cursor-pointer"
                >
                  O carica dati di test predefiniti
                </button>
                <div className="mt-5 inline-flex items-center gap-1.5 text-[8px] text-zinc-500 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded font-mono font-bold tracking-wide uppercase">
                  <AlertCircle className="w-3 h-3" />
                  PDF, XLSX up to 10MB
                </div>
              </div>
            </div>
          </motion.div>
        ) : isUploading ? (
          <motion.div
            key="loading-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="border border-zinc-900 bg-zinc-950/40 p-6 relative overflow-hidden rounded-lg shadow-sm">
              <div className="absolute left-0 right-0 h-[1.5px] laser-line top-0 z-10" />
              
              <div className="space-y-4 relative z-10 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Server className="w-4 h-4" />
                    <span className="uppercase font-bold tracking-wider text-[10px]">Parser Ingestion</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-300">{uploadProgress}%</span>
                </div>

                <div className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-zinc-100"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                <div className="bg-black border border-zinc-900 rounded p-4 h-48 overflow-y-auto text-[9px] text-zinc-500 space-y-1.5 glass-scrollbar" data-lenis-prevent>
                  {logMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={msg.type === "success" ? "text-zinc-300" : msg.type === "warn" ? "text-zinc-500 font-bold" : "text-zinc-650"}>
                        {msg.type === "success" ? "[OK]" : msg.type === "warn" ? "[WRN]" : "[INF]"}
                      </span>
                      <span>{msg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="table-zone"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Filter controls */}
            <div className="flex flex-col gap-3 bg-zinc-950/20 p-4 border border-zinc-900 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-mono">DOCUMENT SOURCE</p>
                  <h4 className="text-xs font-mono font-bold text-zinc-350 mt-0.5">computo_metrico_scuola.pdf</h4>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleAddRow}
                    className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200 transition-all text-xs font-mono font-bold cursor-pointer"
                  >
                    ADD ROW
                  </button>
                  <button
                    onClick={handleSimulatedUpload}
                    className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200 transition-all text-xs font-mono font-bold cursor-pointer"
                  >
                    RE-UPLOAD
                  </button>
                  <button
                    onClick={handleAlignPrezzario}
                    disabled={isAligning || !tender || tender.boq.length === 0}
                    className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 transition-all text-xs font-mono font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isAligning ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-zinc-400" />
                    )}
                    <span>{language === "it" ? "ALLINEA AI" : "ALIGN AI"}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("builder")}
                    className="px-4 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 transition-all text-xs font-mono font-bold cursor-pointer"
                  >
                    RUN PRICING
                  </button>
                </div>
              </div>

              <div className="h-[1px] bg-zinc-900" />
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtra lavorazione per descrizione o codice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 bg-zinc-950 border border-zinc-900 rounded pl-8 pr-3 text-xs text-zinc-300 focus:outline-none focus:border-zinc-850"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider font-mono">Filtra:</span>
                  <div className="flex gap-1 bg-zinc-950 p-0.5 rounded border border-zinc-900">
                    {[
                      { id: "all", label: "Tutti" },
                      { id: "excavation", label: "Scavi" },
                      { id: "concrete", label: "Cemento" },
                      { id: "installations", label: "Impianti" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer ${
                          categoryFilter === cat.id
                            ? "bg-zinc-900 text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-400"
                        }`}
                      >
                        {cat.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Flat Spreadsheet Ledger */}
            <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20">
              <div className="overflow-x-auto glass-scrollbar max-h-[440px]" data-lenis-prevent>
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-[10px] uppercase bg-zinc-950/40">
                      <th className="p-3 pl-4 w-28">Codice</th>
                      <th className="p-3 w-1/3">Voce / Descrizione Lavorazione</th>
                      <th className="p-3 text-center w-32">Prezzario Cod.</th>
                      <th className="p-3 text-center">Cat</th>
                      <th className="p-3 text-center">U.m.</th>
                      <th className="p-3 text-right">Qta</th>
                      <th className="p-3 text-right font-bold">Listino (EUR)</th>
                      <th className="p-3 text-right">Unitario (EUR)</th>
                      <th className="p-3 text-right">Scost.</th>
                      <th className="p-3 text-right font-bold">Importo (EUR)</th>
                      <th className="p-3 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 font-mono">
                    {filteredBoq.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/15 group/row">
                        <td className="p-3 pl-4 text-zinc-400 font-bold">{item.id}</td>
                        <td className="p-2 font-sans text-zinc-300">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                            className="bg-transparent border-0 hover:bg-zinc-900/40 focus:bg-zinc-900/50 w-full h-8 px-2 text-xs rounded text-zinc-300 focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-center text-zinc-400">
                          <input
                            type="text"
                            value={item.matchedCode || "-"}
                            placeholder="N/A"
                            onChange={(e) => handleUpdateItem(item.id, "matchedCode", e.target.value)}
                            className="bg-transparent border-0 hover:bg-zinc-900/40 focus:bg-zinc-900/50 text-center w-full h-8 text-xs text-zinc-400 rounded focus:outline-none font-bold"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-[8px] font-bold border border-zinc-850 px-1.5 py-0.5 rounded text-zinc-450 bg-zinc-900 uppercase">
                            {item.category.substring(0, 4)}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(item.id, "unit", e.target.value)}
                            className="bg-transparent border-0 hover:bg-zinc-900/40 focus:bg-zinc-900/50 text-center w-12 h-8 mx-auto text-xs text-zinc-400 rounded focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, "quantity", e.target.value)}
                            className="bg-transparent border-0 hover:bg-zinc-900/40 focus:bg-zinc-900/50 text-right w-20 h-8 ml-auto text-xs text-zinc-300 rounded focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={item.catalogPrice || 0}
                            onChange={(e) => handleUpdateItem(item.id, "catalogPrice", e.target.value)}
                            className="bg-transparent border-0 hover:bg-zinc-900/40 focus:bg-zinc-900/50 text-right w-20 h-8 ml-auto text-xs text-zinc-450 rounded focus:outline-none font-bold"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={item.unitPriceEUR}
                            onChange={(e) => handleUpdateItem(item.id, "unitPriceEUR", e.target.value)}
                            className="bg-transparent border-0 hover:bg-zinc-900/40 focus:bg-zinc-900/50 text-right w-24 h-8 ml-auto text-xs text-zinc-300 rounded focus:outline-none font-bold"
                          />
                        </td>
                        <td className={`p-3 text-right font-bold ${
                          (item.variancePercent || 0) > 0 ? "text-red-400" : (item.variancePercent || 0) < 0 ? "text-emerald-400" : "text-zinc-500"
                        }`}>
                          {item.variancePercent !== undefined ? `${item.variancePercent > 0 ? "+" : ""}${item.variancePercent.toFixed(1)}%` : "-"}
                        </td>
                        <td className="p-3 text-right font-bold text-zinc-300">
                          €{(item.quantity * item.unitPriceEUR).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteRow(item.id)}
                            className="text-zinc-700 hover:text-red-400 p-1 opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary statistics */}
            <div className="flex justify-between items-center bg-zinc-950/20 p-4 border border-zinc-900 rounded-lg text-xs font-mono">
              <span className="text-zinc-600">COUNT: {filteredBoq.length} ITEMS</span>
              <span className="text-zinc-400">
                TOTAL BASE COST: 
                <strong className="text-zinc-100 text-sm ml-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded">
                  €{(tender?.boq.reduce((acc, i) => acc + i.quantity * i.unitPriceEUR, 0) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
