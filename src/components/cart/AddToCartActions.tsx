"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

interface AddToCartProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    retailPrice: number;
    minOrder: number;
    unit: string;
    isWholesaleAvailable: boolean;
    wholesalePriceTiers: any[];
    images?: string[];
  };
  store: {
    _id: string;
    name: string;
    slug: string;
  };
}

export default function AddToCartActions({ product, store }: AddToCartProps) {
  const [quantity, setQuantity] = useState(product.minOrder);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const handleDecrease = () => {
    if (quantity > product.minOrder) {
      setQuantity(q => q - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(q => q + 1);
  };

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0],
      storeId: store._id,
      storeName: store.name,
      storeSlug: store.slug,
      retailPrice: product.retailPrice,
      minOrder: product.minOrder,
      unit: product.unit,
      isWholesaleAvailable: product.isWholesaleAvailable,
      wholesalePriceTiers: product.wholesalePriceTiers,
      quantity,
    });
    alert("Produk berhasil ditambahkan ke keranjang!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/keranjang");
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-text-muted font-medium">Kuantitas:</span>
        <div className="flex items-center border border-border rounded-lg bg-surface-bg overflow-hidden h-10">
          <button 
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= product.minOrder}
            className="w-10 h-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface disabled:opacity-50 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(Math.max(product.minOrder, parseInt(e.target.value) || product.minOrder))}
            className="w-14 h-full text-center bg-transparent border-none focus:ring-0 text-text-main font-bold p-0 text-sm"
            min={product.minOrder}
          />
          <button 
            type="button"
            onClick={handleIncrease}
            className="w-10 h-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 w-full">
        {/* Primary CTA */}
        <Button onClick={handleBuyNow} className="w-full h-12 text-sm font-bold rounded-lg shadow-sm">
          Beli Langsung
        </Button>
        {/* Secondary CTA */}
        <Button 
          onClick={handleAddToCart} 
          variant="outline" 
          className="w-full h-12 text-sm font-bold flex items-center justify-center bg-surface border-success text-success hover:bg-success/5 hover:text-success hover:border-success rounded-lg"
        >
          <ShoppingCart className="h-4 w-4 mr-2" /> Masukkan Keranjang
        </Button>
      </div>
    </div>
  );
}
