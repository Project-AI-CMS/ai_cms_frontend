"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/ai-cms/HeroSection";
import { ChallengesSection } from "@/components/ai-cms/ChallengesSection";
import { CoreFeaturesSection } from "@/components/ai-cms/CoreFeaturesSection";
import { WorkflowSection } from "@/components/ai-cms/WorkflowSection";
import { DashboardPreviewSection } from "@/components/ai-cms/DashboardPreviewSection";
import { AssetHealthSection } from "@/components/ai-cms/AssetHealthSection";
import { BenefitsSection } from "@/components/ai-cms/BenefitsSection";
import { FinalCTASection } from "@/components/ai-cms/FinalCTASection";
import { Footer } from "@/components/ai-cms/Footer";

export default function Home() {
  // State to track initial load animation
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded state after a brief delay for animation purposes
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-page-theme">
      <div 
        className={`min-h-screen flex flex-col transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <Navbar />
        <main className="flex-1 pt-0">
          <HeroSection />
          <ChallengesSection />
          <CoreFeaturesSection />
          <WorkflowSection />
          <DashboardPreviewSection />
          <AssetHealthSection />
          <BenefitsSection />
          <FinalCTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
