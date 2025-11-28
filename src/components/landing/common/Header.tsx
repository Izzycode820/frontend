/**
 * Landing Page Header - Modern Minimal Design with SaaS Branding
 * Simple direct navigation using domain routes
 * No dropdowns - just clean navigation links
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/shadcn-ui/sheet'
import { cn } from '@/lib/utils'
import { HEADER_NAVIGATION, AUTH_ROUTES } from '@/routes'

interface HeaderProps {
  className?: string
}

export default function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            HUZILERZ
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:ml-auto md:items-center md:space-x-6">
          {HEADER_NAVIGATION.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
          <Button variant="ghost" asChild>
            <Link href={AUTH_ROUTES.LOGIN}>Sign In</Link>
          </Button>
          <Button asChild>
            <Link href={AUTH_ROUTES.SIGNUP}>Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="ml-auto md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-6 mt-6">
                {/* Mobile Navigation */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Navigation</h3>
                  {HEADER_NAVIGATION.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block text-muted-foreground transition-colors hover:text-primary ml-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="font-medium">{item.label}</div>
                    </Link>
                  ))}
                </div>

                <div className="pt-4 space-y-2 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={AUTH_ROUTES.LOGIN}>Sign In</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href={AUTH_ROUTES.SIGNUP}>Get Started</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}