import React from 'react';
import { WorkmanGuestHero } from '@/components/landing/workman/WorkmanGuestHero';

export const metadata = {
  title: 'Workman | Guest Assistant',
  description: 'Your conversational online store assistant.',
};

export default function CampPage() {
  return (
    <main className="min-h-screen bg-black">
      <WorkmanGuestHero />
    </main>
  );
}
