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
import { useTranslations } from 'next-intl';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export default function BetaPage() {
  const t = useTranslations('Landing');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-blue-500/30">

      {/* Navbar */}
      <header className="w-full py-8 px-6 sm:px-12 border-b border-white/10 backdrop-blur-sm fixed top-0 z-50 bg-black/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-bold text-2xl tracking-tighter text-white">HUZILERZ</div>

          <div className="flex items-center gap-4">
            <Link href="/workspace">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 hidden sm:flex">
                {t('alreadyMember')}
              </Button>
            </Link>

            <BetaLoginModal>
              <Button className="bg-white text-black hover:bg-gray-200 font-medium px-6 rounded-full transition-all">
                <Lock className="w-4 h-4 mr-2" />
                {t('memberLogin')}
              </Button>
            </BetaLoginModal>

            <div className="flex items-center text-white border-white/10 hover:border-white/20 ml-2">
              <LanguageSelector />
            </div>
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
          {t('privateBeta')}
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-light text-white tracking-tight mb-8 leading-[1.1]">
          {t('theFutureOf')} <br className="hidden sm:block" />
          <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {t('futureHeadline')}
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mb-12 font-light leading-relaxed">
          {t('onboardingText')}
          <br className="hidden sm:block" />
          {t('buildText')}
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
              {t('applyAccess')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>

          <Link href="/workspace" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full border-white/20 text-white hover:bg-white/10 bg-transparent backdrop-blur-sm">
              {t('alreadyJoined')}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Large Demo Video */}
        <div className="w-full max-w-5xl aspect-video bg-gray-900/50 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative group backdrop-blur-xl">
          <video
            src="/landing/demo.mp4"
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />

          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
        </div>

      </main>
      
      {/* Contact Section for Meta Verification */}
      <section id="contact" className="w-full py-20 bg-black border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 font-sans">
          <h2 className="text-3xl font-medium mb-6 text-white">Contact Us</h2>
          <p className="text-gray-400 mb-10">Have questions about our AI WhatsApp automation? Get in touch with our team.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-white">About Huzilerz</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Huzilerz is an AI-powered commerce platform designed to help merchants sell through WhatsApp and facebook and instagram. 
                  This service is operated by <strong className="text-white">Steve Akum Abo</strong>, a sole proprietor based in Cameroon.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-medium text-white">Business Information</h3>
                <div className="space-y-3 text-gray-400 text-sm">
                  <p><strong className="text-white">Legal Entity Name:</strong> STEVE AKUM ABO</p>
                  <p><strong className="text-white">Business Type:</strong> Sole Proprietorship (Huzilerz Brand)</p>
                  <p><strong className="text-white">Registered Address:</strong> CSIPLI WOURI, CSIPLI WOURI, LITTORAL, 00000, Cameroon</p>
                  <p><strong className="text-white">Email:</strong> abosteve32@gmail.com</p>
                  <p><strong className="text-white">Phone:</strong> +237 654972680</p>
                </div>
              </div>

               {/* Links for Meta Verification */}
              <div className="flex gap-6 pt-6 text-sm font-medium text-gray-500 border-t border-white/5">
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/privacy" className="hover:text-white transition-colors">Cookies</Link>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-medium mb-6 text-white">Send us a Message</h3>
              <form className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                />
                <textarea 
                  placeholder="How can we help?" 
                  rows={4} 
                  className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                ></textarea>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium transition-all">
                  Send Message
                </Button>
              </form>
            </section>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-white/5 text-center">
        <p className="text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Huzilerz. All rights reserved. <br/>
          Huzilerz is operated by Steve Akum Abo (Sole Proprietor).
        </p>
      </footer>
    </div>
  );
}