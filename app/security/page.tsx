import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Shield, Lock, Server } from "lucide-react"

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-zinc-100">Security</h1>
        </div>
        <div className="space-y-8 text-zinc-400">
          <p>At TenderFlow, we take security seriously. Here's how we protect your data.</p>
          
          <div className="grid gap-6 mt-8">
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-zinc-200">Data Encryption</h3>
              </div>
              <p className="text-sm">All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.</p>
            </div>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Server className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-zinc-200">Infrastructure</h3>
              </div>
              <p className="text-sm">We use secure cloud infrastructure with regular security audits and monitoring.</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">AI Data Processing</h2>
          <p>When using AI features, data is processed securely. We do not store sensitive tender data permanently.</p>
          
          <h2 className="text-xl font-semibold text-zinc-200 mt-8">Report Security Issues</h2>
          <p>If you discover a security vulnerability, please contact us immediately through our support channels.</p>
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
