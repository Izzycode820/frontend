'use client';

import React from 'react';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Star } from 'lucide-react';

export function ReviewsPlaceholder() {
  return (
    <section id="reviews" className="bg-background border-b">
      <div className="container mx-auto px-4 py-20 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 border-b pb-4">Reviews & Ratings</h2>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-muted/30 border-dashed border-2 shadow-none">
            <CardContent className="p-16 text-center">
              <div className="flex justify-center mb-6">
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-8 h-8 text-muted-foreground/30 fill-muted-foreground/30" />
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Coming Soon</h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                We're working on adding a review system for themes. Stay tuned for user ratings and feedback!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
