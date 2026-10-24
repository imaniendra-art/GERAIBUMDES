"use client";

import React, { useState } from "react";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ProductImageGalleryProps {
  images?: string[];
  productName: string;
  isWholesaleAvailable?: boolean;
}

export function ProductImageGallery({
  images = [],
  productName,
  isWholesaleAvailable = false,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Bersihkan array dari string kosong
  const validImages = (images || []).filter((img) => Boolean(img?.trim()));
  const activeImage = validImages[selectedIndex] || validImages[0] || "";

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden p-6 flex flex-col gap-4">
      {/* Main Square Image */}
      <div className="aspect-square bg-surface-bg rounded-xl flex items-center justify-center overflow-hidden w-full relative group">
        {activeImage ? (
          <img
            src={activeImage}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
            }}
          />
        ) : (
          <Package className="h-24 w-24 text-border" />
        )}

        {isWholesaleAvailable && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="warning" className="shadow-sm font-semibold">
              Grosir
            </Badge>
          </div>
        )}

        {validImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow">
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails Row (hanya tampil jika foto lebih dari 1) */}
      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pt-1 pb-1 hide-scrollbar">
          {validImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 border-2 ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 scale-105"
                    : "border-border opacity-70 hover:opacity-100 hover:border-primary/50"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductImageGallery;
