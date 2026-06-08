"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Zap } from "lucide-react"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
]

export function Navbar() {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40 p-4"
    >
      <nav className="max-w-5xl mx-auto flex items-center justify-between h-14 px-6 rounded-full bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-xl shadow-lg shadow-black/20">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-zinc-100 hover:text-zinc-300 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-zinc-950" />
          </div>
          TenderFlow
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-1.5 text-sm rounded-full transition-all duration-300 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-2 text-sm rounded-full bg-zinc-100 text-zinc-900 font-semibold hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-zinc-950/50"
        >
          Launch App
        </Link>
      </nav>
    </motion.header>
  )
}
