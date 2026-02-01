'use client';

import React from 'react';
import Image from 'next/image';

interface ThemeHeroSectionProps {
  previewImage: string | null;
  themeName: string;
}

export function ThemeHeroSection({ previewImage, themeName }: ThemeHeroSectionProps) {
  return (
    <section id="overview" className="w-full bg-muted/30 border-b">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="relative w-full max-w-6xl aspect-[16/10] rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-background">
          {previewImage ? (
            <Image
              src={previewImage}
              alt={`${themeName} preview`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
              <div className="p-4 rounded-full bg-background shadow-sm mb-4">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-muted-foreground font-medium">No preview available</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
