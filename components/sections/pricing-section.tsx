"use client"

import { motion } from "framer-motion"
import { Check, ShieldCheck, Zap, Building2, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button as StatefulButton } from "@/components/ui/stateful-button"
import { GlowingEffect } from "@/components/ui/glowing-effect"

const plans = [
  {
    name: "Impresa Locale",
    description: "Per artigiani ed imprese edili con focus territoriale",
    price: "€149",
    period: "/mese",
    icon: Building2,
    features: [
      "1 Utente Attivo",
      "Fino a 3 Gare in contemporanea",
      "Lettura ed estrazione computo AI base",
      "Accesso a 2 Prezzari Regionali",
      "Esportazione offerta in PDF",
      "Supporto standard via email",
    ],
    cta: "Inizia Ora",
    highlighted: false,
  },
  {
    name: "Impresa Generale",
    description: "La scelta ottimale per general contractor e medie imprese",
    price: "€399",
    period: "/mese",
    icon: Zap,
    badge: "Più Popolare",
    features: [
      "Utenti e Collaboratori illimitati",
      "Gare ed estrazioni illimitate",
      "Estrazione computo AI avanzata",
      "Tutti i Prezzari Regionali d'Italia",
      "Audit DURC, ANAC e SOA automatizzato",
      "Simulatore margini e win-rate predittivo",
      "Portale Bidding per subappaltatori",
    ],
    cta: "Attiva Prova Gratuita",
    highlighted: true,
  },
  {
    name: "Grandi Opere",
    description: "Per consorzi stabili e gruppi di costruzioni nazionali",
    price: "Contattaci",
    period: "",
    icon: Crown,
    features: [
      "Tutto il pacchetto Impresa Generale",
      "Server dedicato ed isolamento dati",
      "Integrazione ERP (SAP, TeamSystem, etc.)",
      "Caricamento listini storici aziendali",
      "SLA personalizzato e supporto 24/7",
      "Account Manager dedicato e formazione",
    ],
    cta: "Parla con un Esperto",
    highlighted: false,
  },
]

export function PricingSection() {
  const router = useRouter()

  const handleSelectPlan = async (e: React.MouseEvent) => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    router.push("/dashboard")
  }

  return (
    <section id="pricing" className="px-6 py-24 bg-[#09090b] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.005),transparent_75%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono mb-4">PIANI TARIFFARI</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
            Scegli il piano per la tua impresa
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
            Soluzioni scalabili per ogni dimensione. Passa a un piano superiore in qualsiasi momento.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`rounded-3xl border flex flex-col h-full relative overflow-hidden transition-all duration-300 ${
                plan.highlighted 
                  ? "bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-700/50" 
                  : "bg-zinc-950/40 border-zinc-900/60 hover:border-zinc-800/50"
              }`}
            >
              {/* Glowing Effect - Interactive border glow */}
              <GlowingEffect
                blur={0}
                borderWidth={2}
                spread={60}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                variant={plan.highlighted ? "white" : "default"}
              />

              {/* Top accent light reflection on highlighted card */}
              {plan.highlighted && (
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent z-10" />
              )}

              {/* Card Content */}
              <div className="relative z-10 p-8 flex flex-col h-full">
                {/* Visual Header */}
                <div className="mb-6">
                  {/* Icon Badge */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                    plan.highlighted 
                      ? "bg-zinc-100 text-zinc-950 shadow-lg shadow-zinc-950/50" 
                      : "bg-zinc-800/50 text-zinc-400"
                  }`}>
                    <plan.icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading text-lg font-bold text-zinc-100">
                      {plan.name}
                    </h3>
                    {plan.badge && (
                      <span className="px-2.5 py-1 rounded-md text-[9px] font-bold font-mono tracking-widest uppercase bg-zinc-100 text-zinc-950">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 leading-normal">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6 flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-zinc-100">
                    {plan.price}
                  </span>
                  <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <motion.li 
                      key={feature} 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      {plan.highlighted ? (
                        <ShieldCheck className="w-4 h-4 shrink-0 text-zinc-300 mt-0.5" />
                      ) : (
                        <Check className="w-4 h-4 shrink-0 text-zinc-500 mt-0.5" />
                      )}
                      <span className="text-xs text-zinc-300 leading-relaxed font-sans">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA */}
                <StatefulButton
                  onClick={handleSelectPlan}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs font-mono uppercase tracking-wider transition-all border mt-auto cursor-pointer ${
                    plan.highlighted
                      ? "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-950 ring-offset-2 hover:ring-2 hover:ring-zinc-400 shadow-lg"
                      : "bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 text-zinc-300 ring-offset-2 hover:ring-2 hover:ring-zinc-700"
                  }`}
                >
                  {plan.cta}
                </StatefulButton>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-xs text-zinc-600 mt-12 font-mono"
        >
          Tutti i piani includono 14 giorni di prova gratuita • Cancellazione immediata • Nessun costo nascosto
        </motion.p>
      </div>
    </section>
  )
}
