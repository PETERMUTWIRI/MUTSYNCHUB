// src/app/page.tsx
'use client';

import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import { FAQSection } from '@/components/home/faq';
import { CTASection } from '@/components/home/cta';
import AnalyticsPreview from '@/components/home/AnalyticsPreview';
import SolutionsOverview from '@/components/home/SolutionsOverview';
import EnterpriseTrust from '@/components/home/EnterpriseTrust';
import IndustryImpact from '@/components/home/IndustryImpact';

import { PostLoginRedirect } from '@/components/PostLoginRedirect';
import { useRoleRedirect } from '@/context/useRoleRedirect';

export default function Home() {
  const { loading } = useRoleRedirect();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E2A44]">

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D7D] mx-auto"></div>
            <p className="mt-2 text-[#2E7D7D] text-lg font-semibold">Loading...</p>
          </div>
        </div>
      ) : (
        <main className="w-full">
          <PostLoginRedirect />
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 min-h-screen">
            <HeroSection />
            <AboutSection />
            <EnterpriseTrust />
            <AnalyticsPreview />
            <SolutionsOverview />
            <IndustryImpact />
            <FAQSection />
            <CTASection />
          </div>
        </main>
      )}
    </div>
  );
}