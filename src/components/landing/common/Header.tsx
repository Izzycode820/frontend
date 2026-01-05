/**
 * Landing Page Header - Modern Minimal Design with SaaS Branding
 * Simple direct navigation using domain routes
 * No dropdowns - just clean navigation links
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/shadcn-ui/sheet';
import { cn } from '@/lib/utils';
import { HEADER_NAVIGATION, AUTH_ROUTES } from '@/routes';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={cn(
      "absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12",
      className
    )}>
      {/* 1. Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <div className="font-display text-xl font-bold tracking-tighter text-white">
          HUZILERZ CAMP
        </div>
      </Link>

      {/* 2. Center Links (Desktop) */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
        {HEADER_NAVIGATION.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition-colors hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 3. Right Actions (Desktop) */}
      <div className="hidden md:flex items-center gap-6">
        <Button variant="ghost" asChild className="text-white hover:bg-white/10">
          <Link href={AUTH_ROUTES.LOGIN}>Sign In</Link>
        </Button>
        <Button asChild className="rounded-md bg-white text-black hover:bg-huzilerz-lime">
          <Link href={AUTH_ROUTES.SIGNUP}>Get Started</Link>
        </Button>
      </div>
      
      {/* Mobile Menu */}
      <div className="ml-auto md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-huzilerz-black text-white border-l-gray-800">
            <div className="flex flex-col space-y-6 mt-6">
              {/* Mobile Navigation */}
              <div className="space-y-2">
                {HEADER_NAVIGATION.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block font-medium text-gray-300 transition-colors hover:text-white py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="pt-4 space-y-2 border-t border-gray-800">
                <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800" asChild>
                  <Link href={AUTH_ROUTES.LOGIN}>Sign In</Link>
                </Button>
                <Button className="w-full bg-white text-black hover:bg-huzilerz-lime" asChild>
                  <Link href={AUTH_ROUTES.SIGNUP}>Get Started</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}