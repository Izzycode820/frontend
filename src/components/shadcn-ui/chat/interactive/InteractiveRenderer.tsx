"use client"

import * as React from "react"
import { MetaProductBubble } from "./MetaProductBubble"

interface InteractiveRendererProps {
  data: any
  isOutgoing: boolean
}

const RENDERERS: Record<string, React.ComponentType<any>> = {
  'product': MetaProductBubble,
  // Future: 'list': MetaListBubble,
  // Future: 'button': MetaButtonBubble,
}

export function InteractiveRenderer({ data, isOutgoing }: InteractiveRendererProps) {
  if (!data || !data.type) return null

  const Renderer = RENDERERS[data.type]
  
  if (!Renderer) {
    console.warn(`No interactive renderer found for type: ${data.type}`)
    return null
  }

  return <Renderer data={data} isOutgoing={isOutgoing} />
}
