import { Navbar } from "@/components/ui/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import HeroScrollDemo from "@/components/container-scroll-animation-demo"
import { ImpactSection } from "@/components/sections/impact-section"
import { FeaturesSection } from "@/components/sections/features-section"
import ThreeDMarqueeDemo from "@/components/3d-marquee-demo"
import { TrustBannerSection } from "@/components/sections/trust-banner-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { CtaSection } from "@/components/sections/cta-section"
import { FooterSection } from "@/components/sections/footer-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 overflow-hidden">
      <Navbar />
      <HeroSection />
      <HeroScrollDemo />
      <ImpactSection />
      <FeaturesSection />
      <ThreeDMarqueeDemo />
      <TrustBannerSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}
