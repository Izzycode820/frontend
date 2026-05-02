"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ImageIcon, ExternalLink, ShoppingBag } from "lucide-react"

interface MetaProductBubbleProps {
  data: {
    type: string
    product?: {
      id: string
      name: string
      description?: string
      price?: number
      currency?: string
      image_url?: string
      url?: string
    }
  }
  isOutgoing: boolean
  className?: string
}

export function MetaProductBubble({ data, isOutgoing, className }: MetaProductBubbleProps) {
  const product = data.product
  if (!product) return null

  // Format price if available
  const formattedPrice = product.price != null 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: product.currency || 'XAF',
      }).format(product.price)
    : null

  return (
    <div className={cn(
      "mt-2 flex w-full max-w-[280px] flex-col overflow-hidden rounded-xl border shadow-sm transition-all",
      isOutgoing 
        ? "border-white/10 bg-[#005C4B/30] backdrop-blur-sm" 
        : "border-border bg-card",
      className
    )}>
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full bg-muted/20">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted/50 text-muted-foreground/30">
            <ImageIcon className="size-10" />
          </div>
        )}
        
        {/* Price Badge Overlay (Optional, matches some Meta variations) */}
        {formattedPrice && (
          <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[12px] font-bold text-white backdrop-blur-md">
            {formattedPrice}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col p-3 pb-2">
        <h4 className="text-[14px] font-bold leading-tight tracking-tight text-foreground line-clamp-1">
          {product.name}
        </h4>
        {product.description && (
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      {/* Meta-style Action Button */}
      <div className="flex items-center justify-center border-t border-border/50 py-2 transition-colors hover:bg-muted/30">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-primary">
          <ShoppingBag className="size-3.5" />
          <span>View Product</span>
        </div>
      </div>
    </div>
  )
}
