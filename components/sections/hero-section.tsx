"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"
import { Spotlight } from "@/components/ui/spotlight"

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#09090b] px-6 pt-20 pb-20 antialiased">
      {/* Grid Background Pattern */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 select-none",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)]"
        )}
      />

      {/* Spotlight Effect - Top Left shining down */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />

      {/* Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-20 md:pt-0">
        <div className="flex flex-col items-center text-center">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-2 backdrop-blur-sm"
          >
            <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
              TenderFlow 3.0 — AI-Powered
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            <span className="block bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Vinci più appalti.
            </span>
            <span className="mt-2 block bg-gradient-to-b from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              Riduci i rischi.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-2xl text-base text-zinc-400 md:text-lg"
          >
            L&apos;operating system per gare d&apos;appalto infrastrutturali. 
            Estrazione computi metrici assistita da AI, verifica prezzari regionali 
            e simulazione delle probabilità di vittoria in tempo reale.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link href="/dashboard">
              <LiquidCtaButton>Launch App Hub</LiquidCtaButton>
            </Link>
            <Link
              href="#features"
              className="group flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-white"
            >
              <span>See the Features</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
