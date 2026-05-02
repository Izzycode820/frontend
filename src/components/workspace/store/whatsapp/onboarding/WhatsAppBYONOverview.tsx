'use client';

import React, { useState } from 'react';
import { BYONOnboardingWizard } from './BYONOnboardingWizard';
import { WhatsAppAccountCard } from './WhatsAppAccountCard';

interface WhatsAppBYONOverviewProps {
  initialAccount?: any;
}

export function WhatsAppBYONOverview({ initialAccount }: WhatsAppBYONOverviewProps) {
  const [account, setAccount] = useState(initialAccount);

  const handleComplete = (newAccount: any) => {
    // In a real app, you might want to refetch the account from the server
    // to get the most up-to-date state.
    setAccount({ ...newAccount, isActive: true });
  };

  const handleDisconnect = () => {
    // Logic for disconnecting would go here
    if (confirm("Are you sure you want to disconnect this account?")) {
      setAccount(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {account ? (
        <WhatsAppAccountCard 
          account={account} 
          onDisconnect={handleDisconnect} 
        />
      ) : (
        <BYONOnboardingWizard onComplete={handleComplete} />
      )}
    </div>
  );
}
