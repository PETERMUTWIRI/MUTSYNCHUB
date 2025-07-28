// src/routes/Home.tsx
import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import HeroSection from "../components/home/HeroSection";
import AboutSection from "../components/home/AboutSection";
import { FAQSection } from "../components/home/faq";
import { CTASection } from "../components/home/cta";
import AnalyticsPreview from "../components/home/AnalyticsPreview";
import SolutionsOverview from "../components/home/SolutionsOverview";
import EnterpriseTrust from "../components/home/EnterpriseTrust";
import IndustryImpact from "../components/home/IndustryImpact";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <button
        className="fixed top-6 left-6 z-50 p-2 rounded-full bg-white shadow-md text-2xl text-blue-700 hover:bg-blue-100 focus:outline-none md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars />
      </button>

      <main className="w-full">
        {/* Consistent blue gradient background for all sections */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 min-h-screen">
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