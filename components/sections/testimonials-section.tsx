"use client"

import { motion } from "framer-motion"
import { TestimonialsColumn } from "@/components/ui/testimonials-column"

const testimonials = [
  {
    text: "TenderFlow ha rivoluzionato l'ufficio gare. Estraiamo computi metrici complessi da oltre 3.000 voci in meno di 15 minuti con precisione assoluta.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Ing. Stefano Bianchi",
    role: "Direttore Tecnico presso S.I.T. Costruzioni S.p.A.",
  },
  {
    text: "La verifica automatica dei prezzari regionali (Lombardia, Veneto, Piemonte) ci ha salvato da pesanti contestazioni formali in fase di offerta.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    name: "Geom. Laura Rossi",
    role: "Responsabile Gare Nord-Ovest",
  },
  {
    text: "Il controllo del DURC e delle qualifiche SOA dei subappaltatori integrato nel Copilot riduce a zero i rischi di esclusione ANAC.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "Avv. Marco Ferri",
    role: "Legal & Compliance Director presso Costruzioni Generali",
  },
  {
    text: "La simulazione What-If del margine e la stima del win-rate ci permettono di deliberare le offerte con dati predittivi reali.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    name: "Dott.ssa Elena Moretti",
    role: "CFO Gruppo Infrastrutture Italiane",
  },
  {
    text: "Indispensabile per gestire i ritmi serrati del nuovo Codice degli Appalti. La collaborazione sui lotti è istantanea.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    name: "Arch. Giovanni Neri",
    role: "Project Manager Grandi Opere",
  },
  {
    text: "Prima impiegavamo giorni per confrontare i preventivi dei subappaltatori. Oggi facciamo tutto in pochi clic dal portale.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "Geom. Alessandro Villa",
    role: "Capo Cantiere & Preventivatore",
  },
]

const firstColumn = testimonials.slice(0, 2)
const secondColumn = testimonials.slice(2, 4)
const thirdColumn = testimonials.slice(4, 6)

const logos = ["Italstrade", "Veneta Costruzioni", "Milano Edilizia", "Roma Infrastrutture", "Torino Scavi", "Sicilia Opere"]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-6 py-24 bg-[#09090b] relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.005),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-xl mx-auto mb-16"
        >
          <div className="border border-zinc-900 py-1.5 px-4 rounded-full text-xs font-mono font-bold text-zinc-550 uppercase tracking-widest bg-zinc-950">
            TESTIMONIANZE
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 mt-6 text-center tracking-tight">
            La parola ai professionisti dell'edilizia
          </h2>
          <p className="text-center mt-4 text-zinc-500 text-sm leading-relaxed max-w-md">
            Scopri come i direttori tecnici e i responsabili gare ottimizzano le offerte economiche con TenderFlow.
          </p>
        </motion.div>

        {/* Carousel of Columns */}
        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[550px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={18} className="w-full max-w-xs" />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block w-full max-w-xs" duration={22} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block w-full max-w-xs" duration={20} />
        </div>

        {/* Partner Logos ticker */}
        <div className="mt-20 pt-16 border-t border-zinc-900/60">
          <p className="text-center text-xs font-mono font-bold text-zinc-550 uppercase tracking-wider mb-8">
            Adottato dai principali consorzi e imprese generali
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <motion.div
              className="flex gap-16 md:gap-24"
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                x: {
                  duration: 25,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
              }}
            >
              {/* Duplicate logos for seamless loop */}
              {[...logos, ...logos].map((logo, index) => (
                <span
                  key={`${logo}-${index}`}
                  className="text-sm font-mono font-bold text-zinc-700 whitespace-nowrap flex-shrink-0 uppercase tracking-widest"
                >
                  {logo}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
