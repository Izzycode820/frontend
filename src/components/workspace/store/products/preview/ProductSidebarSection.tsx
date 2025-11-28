"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import { ShoppingCart, Heart, Package, Truck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  option1: string;
  option2: string;
  price: any | null;
  compareAtPrice: any | null;
  isAvailable: boolean | null;
  totalStock: number | null;
};

interface ProductSidebarSectionProps {
  name: string;
  description: string;
  price: any;
  compareAtPrice: any | null;
  isOnSale: boolean | null;
  salePercentage: number | null;
  hasVariants: boolean;
  variants: Variant[] | null;
  options: any;
  brand: string;
  vendor: string;
  tags: any;
  isInStock: boolean | null;
  totalStock: number | null;
  requiresShipping: boolean;
  weight: any | null;
}

export function ProductSidebarSection({
  name,
  description,
  price,
  compareAtPrice,
  isOnSale,
  salePercentage,
  hasVariants,
  variants,
  options,
  brand,
  vendor,
  tags,
  isInStock,
  totalStock,
  requiresShipping,
  weight,
}: ProductSidebarSectionProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Parse options if it's a JSON array
  const parsedOptions = Array.isArray(options) ? options : [];

  // Get unique option values
  const getOptionValues = (optionName: string) => {
    if (!variants) return [];
    const values = new Set<string>();
    variants.forEach((v) => {
      if (optionName === parsedOptions[0]?.name && v.option1) values.add(v.option1);
      if (optionName === parsedOptions[1]?.name && v.option2) values.add(v.option2);
    });
    return Array.from(values).filter(Boolean);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Product Name */}
      <div>
        <h1 className="text-3xl font-bold">{name}</h1>
        {/* Short description - first 100 chars */}
        {description && (
          <p className="text-muted-foreground mt-2">
            {description.substring(0, 100)}
            {description.length > 100 && "..."}
          </p>
        )}
      </div>

      {/* Pricing */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">FCFA {Number(price).toLocaleString()}</span>
        {compareAtPrice && Number(compareAtPrice) > Number(price) && (
          <>
            <span className="text-xl text-muted-foreground line-through">
              FCFA {Number(compareAtPrice).toLocaleString()}
            </span>
            {salePercentage && (
              <Badge variant="destructive">-{Math.round(salePercentage)}%</Badge>
            )}
          </>
        )}
      </div>

      {/* Variants/Options */}
      {hasVariants && parsedOptions.length > 0 && (
        <div className="flex flex-col gap-4">
          {parsedOptions.map((option: any) => {
            const values = getOptionValues(option.name);
            if (values.length === 0) return null;

            return (
              <div key={option.name}>
                <label className="text-sm font-medium mb-2 block">
                  {option.name}:{" "}
                  <span className="text-primary">
                    {selectedOptions[option.name] || values[0]}
                  </span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {values.map((value) => (
                    <Button
                      key={value}
                      variant={
                        (selectedOptions[option.name] || values[0]) === value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [option.name]: value,
                        }))
                      }
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add to Cart */}
      <Button size="lg" className="w-full" disabled>
        <ShoppingCart className="mr-2 h-5 w-5" />
        ADD TO CART
      </Button>

      {/* Stock & Shipping Info */}
      <div className="flex flex-col gap-2 text-sm">
        {/* Stock Status */}
        <div className="flex items-center gap-2">
          {isInStock ? (
            <>
              <Package className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">Available</span>
              {totalStock !== null && totalStock > 0 && (
                <span className="text-muted-foreground">
                  ({totalStock} in stock)
                </span>
              )}
            </>
          ) : (
            <>
              <Package className="h-4 w-4 text-destructive" />
              <span className="text-destructive font-medium">Out of stock</span>
            </>
          )}
        </div>

        {/* Shipping */}
        {requiresShipping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Shipping within 3-4 days</span>
          </div>
        )}
      </div>

      {/* Description with Benefits */}
      {description && (
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-2">Long description and benefits below</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
          </div>
        </div>
      )}

      {/* Brand/Vendor - Show if available */}
      {(brand || vendor) && (
        <div className="border-t pt-4 flex flex-col gap-2 text-sm">
          {brand && (
            <div className="flex gap-2">
              <span className="text-muted-foreground">Brand:</span>
              <span className="font-medium">{brand}</span>
            </div>
          )}
          {vendor && (
            <div className="flex gap-2">
              <span className="text-muted-foreground">Vendor:</span>
              <span className="font-medium">{vendor}</span>
            </div>
          )}
        </div>
      )}

      {/* Tags - Show if available */}
      {tags && Array.isArray(tags) && tags.length > 0 && (
        <div className="border-t pt-4">
          <span className="text-sm text-muted-foreground mb-2 block">Tags:</span>
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
