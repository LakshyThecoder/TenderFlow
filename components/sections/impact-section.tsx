const metrics = [
  { value: "€4.8B+", label: "Gare d'Appalto Scansionate", description: "Volume totale analizzato dall'AI" },
  { value: "+14.5%", label: "Margine Medio Ottimizzato", description: "Aumento della marginalità lorda" },
  { value: "15 Min", label: "Estrazione Computi Metrici", description: "Rispetto a 3 giorni lavorativi" },
  { value: "3.2k+", label: "Imprese Utenti in Italia", description: "Appaltatori generali e locali" },
]

export function ImpactSection() {
  return (
    <section className="px-6 py-24 bg-[#09090b] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.005),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Impact Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono">TENDERFLOW IN NUMERI</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 mt-4 mb-4">
            L'impatto reale sulle gare d'appalto
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto text-sm leading-relaxed">
            Statistiche reali raccolte dai consorzi e dalle imprese edili italiane che utilizzano la nostra tecnologia per presentare offerte vincenti.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-6 rounded-2xl glass-card border border-zinc-900/60 hover:border-zinc-700 transition-all duration-400 group text-center relative overflow-hidden shadow-lg hover:scale-[1.02]"
            >
              {/* Top ambient highlight on hover */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <p className="font-mono text-3xl md:text-4xl font-bold text-zinc-300 mb-1 group-hover:text-zinc-100 transition-colors">
                  {metric.value}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-350 mb-1">{metric.label}</p>
                <p className="text-[10px] text-zinc-550 leading-relaxed font-sans">{metric.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
