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
    <div className="flex flex-col gap-4 w-full sm:w-auto">
      <div className="flex items-center justify-between sm:justify-start gap-4">
        <span className="text-sm text-text-muted font-medium">Kuantitas:</span>
        <div className="flex items-center border border-border rounded-md bg-surface-bg">
          <button 
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= product.minOrder}
            className="p-2 text-text-muted hover:text-primary disabled:opacity-50"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(Math.max(product.minOrder, parseInt(e.target.value) || product.minOrder))}
            className="w-16 text-center bg-transparent border-none focus:ring-0 text-text-main font-medium p-0"
            min={product.minOrder}
          />
          <button 
            type="button"
            onClick={handleIncrease}
            className="p-2 text-text-muted hover:text-primary"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button onClick={handleAddToCart} variant="outline" className="flex-1 flex items-center justify-center">
          <ShoppingCart className="h-4 w-4 mr-2" /> Masukkan Keranjang
        </Button>
        <Button onClick={handleBuyNow} className="flex-1">
          Beli Langsung
        </Button>
      </div>
    </div>
  );
}
