import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-100 mb-8">Terms of Service</h1>
        <div className="space-y-6 text-zinc-400">
          <p>Last updated: {new Date().getFullYear()}</p>
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using TenderFlow, you agree to these Terms of Service.</p>
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">2. Use of Service</h2>
          <p>TenderFlow provides AI-powered tools for construction tender management. You agree to use the service lawfully.</p>
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">3. Account Registration</h2>
          <p>You may need to create an account to access certain features. You are responsible for maintaining account security.</p>
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">4. Limitation of Liability</h2>
          <p>TenderFlow provides AI suggestions as guidance. Final decisions remain your responsibility.</p>
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
