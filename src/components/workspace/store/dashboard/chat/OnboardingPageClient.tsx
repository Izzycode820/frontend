'use client';

import React from 'react';
import { OnboardingDashboard } from './OnboardingDashboard';
import { useMerchantChat } from './MerchantChatContext';

/**
 * OnboardingPageClient
 * 
 * Specifically for the /store page content.
 * It consumes the persistent MerchantChatContext to show the onboarding status
 * but doesn't handle the chat UI itself (which is in the layout).
 */
export function OnboardingPageClient() {
  const { onboarding, onSend } = useMerchantChat();

  if (!onboarding) return null;

  return (
    <div className="flex-1 h-full overflow-hidden">
      <OnboardingDashboard 
        steps={onboarding.steps} 
        onStartStep={(prompt) => onSend(prompt)} 
        onNavigateToChat={() => {}} 
      />
    </div>
  );
}
