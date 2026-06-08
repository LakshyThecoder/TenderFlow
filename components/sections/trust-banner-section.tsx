"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Lock, BadgeCheck, Clock, CreditCard, RefreshCcw } from "lucide-react"

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Sicurezza Bancaria",
    description: "Crittografia AES-256",
  },
  {
    icon: Lock,
    title: "Dati Privati",
    description: "Isolamento completo",
  },
  {
    icon: BadgeCheck,
    title: "Certificato ISO 27001",
    description: "Standard internazionali",
  },
  {
    icon: Clock,
    title: "Attivazione 24h",
    description: "Setup immediato",
  },
  {
    icon: CreditCard,
    title: "Pagamento Sicuro",
    description: "Stripe & SEPA",
  },
  {
    icon: RefreshCcw,
    title: "Cancellazione",
    description: "Zero penali",
  },
]

export function TrustBannerSection() {
  return (
    <section className="px-6 py-16 bg-[#09090b] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.008),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
            Investimento chiaro, zero sorprese
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
            Trasparenza totale sui costi. Nessuna tariffa nascosta, nessun vincolo di permanenza. 
            Scegli il piano, attivalo in 24 ore, cancella quando vuoi.
          </p>
        </motion.div>

        {/* Trust Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-900/30 transition-all duration-300 text-center"
            >
              <motion.div
                className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-3 group-hover:bg-zinc-800 transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              </motion.div>
              <h3 className="text-xs font-bold text-zinc-300 mb-1 font-mono uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="text-[10px] text-zinc-550 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-zinc-800/50"
        >
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: "14 giorni", label: "Prova gratuita" },
              { value: "0€", label: "Costi di setup" },
              { value: "24/7", label: "Supporto premium" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-mono text-xl font-bold text-zinc-200">{stat.value}</p>
                <p className="text-[10px] text-zinc-550 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
