import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-100 mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-zinc-400">
          <p>Last updated: {new Date().getFullYear()}</p>
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including name, email, company information, and tender data.</p>
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">2. How We Use Information</h2>
          <p>We use the information to provide AI-powered tender analysis, pricing suggestions, and subcontractor matching services.</p>
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data.</p>
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">4. Contact</h2>
          <p>For privacy questions, contact us through our website.</p>
        </div>
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <Link href="/" className="text-amber-500 hover:text-amber-400 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
