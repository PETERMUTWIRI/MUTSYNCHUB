"use client";
import HeroSection from "@/components/home/HeroSection";
import CallBackendOnAuth from '@/components/auth/CallBackendOnAuth';
import AboutSection from "@/components/home/AboutSection";
import { FAQSection } from "@/components/home/faq";
import { CTASection } from "@/components/home/cta";
import AnalyticsPreview from "@/components/home/AnalyticsPreview";
import SolutionsOverview from "@/components/home/SolutionsOverview";
import EnterpriseTrust from "@/components/home/EnterpriseTrust";
import IndustryImpact from "@/components/home/IndustryImpact";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full">
        {/* Consistent blue gradient background for all sections */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 min-h-screen">
          <CallBackendOnAuth endpoint="/api/users/me" />
          <HeroSection />
          <AboutSection />
          <EnterpriseTrust />
          <AnalyticsPreview />
          <SolutionsOverview />
          <IndustryImpact />
          <FAQSection/>
          <CTASection/>
        </div>
      </main>
    </div>
  );
}
