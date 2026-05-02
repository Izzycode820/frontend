/**
 * Landing Page - Clean Implementation
 * Modern landing page with a hero and interactive scroll section.
 * Organized component structure
 */

import React from 'react';
import { Hero, BrandSection, PricingGallery, HowToStartSection, StageDropshipping, StageFashion, StageInspiration, CustomizationSection, ThemeShowcaseSection, ProductOrganizationSection, DomainSection, DashboardFeaturesSection, EducationalGuideSection, FAQSection, FooterHero, LargeFooter } from '@/components/landing/sections';
import { StackedLayout } from '@/components/landing/ui/StackedLayout';

export default function LandingPage() {
  return (
    <>
      {/* 
        Hero Wrapper:
        - h-screen: Defines the scroll track for the sticky Hero.
        - z-[1]: Puts Hero ABOVE the fixed FooterHero (z-0) so we see Hero at the start.
        - The internal Hero component is 'sticky top-0'. 
        - When we scroll past h-screen, this wrapper leaves the viewport, taking the 'sticky' Hero with it.
        - This prevents Hero from overlapping FooterHero at the bottom.
      */}
      <div className="relative h-screen w-full z-[1]">
        <Hero />
      </div>

      {/* 
        STICKY STACK CONTEXT:
        Wraps BrandSection and the first 3 cards.
        BrandSection sticks relative to THIS container.
        When this container scrolls out of view, BrandSection goes with it.
        
        Added pb-[40vh] to create a "Pause" effect. 
        After CustomizationSection locks, the user scrolls for 40% of viewport 
        BEFORE the Normal Flow comes up to push the stack away.
      */}
      {/* 
        STICKY STACK CONTEXT:
        Wraps BrandSection and the first 3 cards.
        BrandSection sticks relative to THIS container.
        When this container scrolls out of view, BrandSection goes with it.
        
        Added pb-[40vh] to create a "Pause" effect. 
        After CustomizationSection locks, the user scrolls for 40% of viewport 
        BEFORE the Normal Flow comes up to push the stack away.

        Added z-30 bg-white to ensure this sits ABOVE the fixed/sticky footer 
        at the bottom, preventing "bleed through" when scrolling back up.
      */}
      <div className="relative w-full z-30 bg-white">
        <BrandSection />

        {/* The Stack that slides over BrandSection */}
        <StackedLayout>
          <PricingGallery />
          <HowToStartSection />
          {/* CustomizationSection removed for now as requested */}
        </StackedLayout>
      </div>

      {/* 
        NORMAL FLOW:
        These sections follow naturally after the stack finishes. 
        HowToStartSection covers Pricing, pauses, and then scrolls away 
        to reveal these normal sections.
      */}
      <div className="relative z-10 bg-white">
        <StageDropshipping />
        <StageFashion />
        <StageInspiration />
      </div>

      {/* 
        NEW STACK: Customization & Features
        CustomizationSection acts as the "base" of this new stack.
        Its children (ProductOrg, Domain, Dashboard) stack on top of it.
        This entire stack follows StageInspiration.
      */}
      <div className="relative w-full z-20 bg-white">
        <StackedLayout>
          <CustomizationSection />
          <ProductOrganizationSection />
          <DomainSection />
          <DashboardFeaturesSection />
        </StackedLayout>
      </div>

      <div className="relative h-[20vh] w-full bg-white z-20" /> {/* Spacer for scroll flow if needed */}

      {/* Educational Guide follows separately or can be added to stack if desired */}
      <div className="relative h-[140vh] w-full z-10 bg-gray-50">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <EducationalGuideSection />
        </div>
      </div>

      {/* FAQ: Stick & Pause (bg-white removed to allow transparency on corners) */}
      <div className="relative h-[140vh] w-full z-40 shadow-[0_-40px_60px_-15px_rgba(0,0,0,0.1)]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <FAQSection />
        </div>
      </div>

      {/* 
        CURTAIN REVEAL SPACER:
        This spacer provides the scroll distance to "reveal" the fixed FooterHero behind the FAQ.
        We see the FooterHero because this spacer is transparent.
      */}
      <div className="relative w-full h-screen pointer-events-none z-10" />

      {/* 
        FIXED FOOTER HERO:
        It sits at z-0 (behind everything).
        Visible only when we scroll through the Spacer above.
      */}
      <FooterHero />

      {/* 
        LARGE FOOTER:
        Slides UP over the fixed FooterHero.
        Must be z-50 (higher than FooterHero's z-0) to cover it.
      */}
      <div className="relative z-50">
        <LargeFooter />
      </div>
    </>
  );
}