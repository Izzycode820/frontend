// // Root page - Redirects to /camp
// // This ensures users land on the new landing page

// import { redirect } from 'next/navigation';
// import { PUBLIC_ROUTES } from '@/routes';

// export default function RootPage() {
//   redirect(PUBLIC_ROUTES.CAMP);

'use client';

// ==============================================================================
// DX: BETA-LANDING - PREMIUM DARK THEME
// ==============================================================================

import React from 'react';
import { ArrowRight, Lock, Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { BetaLoginModal } from '@/components/beta/BetaLoginModal';
import Link from 'next/link';

export default function BetaPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-blue-500/30">

      {/* Navbar */}
      <header className="w-full py-8 px-6 sm:px-12 border-b border-white/10 backdrop-blur-sm fixed top-0 z-50 bg-black/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-bold text-2xl tracking-tighter text-white">HUZILERZ</div>

          <div className="flex items-center gap-4">
            <Link href="/workspace">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 hidden sm:flex">
                Already a member?
              </Button>
            </Link>

            <BetaLoginModal>
              <Button className="bg-white text-black hover:bg-gray-200 font-medium px-6 rounded-full transition-all">
                <Lock className="w-4 h-4 mr-2" />
                Member Login
              </Button>
            </BetaLoginModal>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-32 sm:py-40 text-center max-w-5xl mx-auto relative overflow-hidden">

        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-medium tracking-widest uppercase mb-10 backdrop-blur-md">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
          Private Beta Access
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-light text-white tracking-tight mb-8 leading-[1.1]">
          The Future of <br className="hidden sm:block" />
          <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Commerce in Cameroon is Here
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mb-12 font-light leading-relaxed">
          We are onboarding a select group of founding merchants.
          <br className="hidden sm:block" />
          Build your store in minutes, and stare you online business.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center mb-24 z-10">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdi6KTUareoQQNBIK1TfKIFdQO-0Yrn9riHEEvS46TDEJKPbA/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105">
              Apply for Access
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>

          <Link href="/workspace" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full border-white/20 text-white hover:bg-white/10 bg-transparent backdrop-blur-sm">
              Already Joined?
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Large Demo Video Placeholder */}
        <div className="w-full max-w-5xl aspect-video bg-gray-900/50 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative group backdrop-blur-xl">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Play Button */}
            <div className="relative z-10 p-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500 cursor-pointer">
              <Play className="w-12 h-12 text-white fill-white ml-2" />
            </div>

            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">Watch the 2-minute demo</p>
            </div>
          </div>

          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-white/5 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Huzilerz Inc. <span className="mx-2">•</span> Founding Member Build v0.9.2
        </p>
      </footer>
    </div>
  );
}