'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MFASetup } from '@/components/shared/auth/MFASetup';

export default function MFASetupPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Redirect to dashboard or wherever the user was going
    router.push('/workspace');
  };

  const handleSkip = () => {
    // Allow skipping for now, but could implement policy enforcement here
    router.push('/workspace');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-stone-900 flex items-center justify-center p-4">
      <MFASetup 
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}