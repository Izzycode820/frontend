"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type MediaImage = {
  id: string;
  url: string | null;
  thumbnailUrl: string | null;
  optimizedUrl: string | null;
  width: number | null;
  height: number | null;
};

interface ProductImagesSectionProps {
  images: MediaImage[];
  productName: string;
}

export function ProductImagesSection({
  images,
  productName,
}: ProductImagesSectionProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Filter out null images and images without URLs
  const validImages = images.filter((img) => img && img.url);

  if (validImages.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">No image available</p>
        </div>
      </div>
    );
  }

  const selectedImage = validImages[selectedImageIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Featured Image */}
      <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden relative">
        <Image
          src={selectedImage.optimizedUrl || selectedImage.url || ""}
          alt={productName}
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnail Gallery - Only show if multiple images */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {validImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "aspect-square rounded-md overflow-hidden border-2 transition-all",
                selectedImageIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.thumbnailUrl || image.url || ""}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
