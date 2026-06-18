"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Store as StoreIcon, Trash2, Plus, Minus, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCartStore, calculateActivePrice, CartItem } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils/formatters";

export default function KeranjangPage() {
  const [isMounted, setIsMounted] = useState(false);
  const cartStore = useCartStore();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-surface-bg py-8 px-4 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { items, updateQuantity, removeItem } = cartStore;

  // Group items by store
  const itemsByStore = items.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeId: item.storeId,
        storeName: item.storeName,
        storeSlug: item.storeSlug,
        items: [],
        subtotal: 0,
        isValid: true
      };
    }
    const { price } = calculateActivePrice(item);
    acc[item.storeId].items.push(item);
    acc[item.storeId].subtotal += price * item.quantity;
    
    if (item.quantity < item.minOrder) {
      acc[item.storeId].isValid = false;
    }
    
    return acc;
  }, {} as Record<string, { storeId: string; storeName: string; storeSlug: string; items: CartItem[]; subtotal: number; isValid: boolean }>);

  const storeGroups = Object.values(itemsByStore);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-text-main mb-8">Keranjang Belanja</h1>

        {storeGroups.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-xl border border-border">
            <Package className="h-16 w-16 text-border mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-main mb-2">Keranjang Anda Kosong</h2>
            <p className="text-text-muted mb-6">Mulai cari kebutuhan BUMDes Anda di marketplace.</p>
            <Link href="/produk">
              <Button>Mulai Belanja</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm text-text-main">
                <p className="font-semibold mb-1">Perhatian:</p>
                <p>Checkout pesanan akan diproses <strong>per Toko/BUMDes</strong>. Anda hanya dapat melakukan checkout untuk satu toko dalam satu waktu.</p>
              </div>
            </div>

            {storeGroups.map((group) => (
              <Card key={group.storeId} className="overflow-hidden border-border">
                {/* Store Header */}
                <div className="bg-surface-bg border-b border-border p-4 flex justify-between items-center">
                  <Link href={`/toko/${group.storeSlug}`} className="flex items-center text-text-main hover:text-primary transition-colors">
                    <StoreIcon className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-bold">{group.storeName}</span>
                  </Link>
                </div>
                
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {group.items.map((item) => {
                      const { price, type } = calculateActivePrice(item);
                      const itemSubtotal = price * item.quantity;
                      
                      return (
                        <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                          {/* Item Image */}
                          <div className="w-full sm:w-24 h-24 bg-surface-bg rounded-md flex items-center justify-center border border-border flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                            ) : (
                              <Package className="h-8 w-8 text-border" />
                            )}
                          </div>
                          
                          {/* Item Info */}
                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <Link href={`/produk/${item.slug}`} className="font-semibold text-text-main hover:text-primary line-clamp-2">
                                {item.name}
                              </Link>
                              <button 
                                onClick={() => removeItem(item.productId)}
                                className="text-text-muted hover:text-danger p-1"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                            
                            <div className="mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-lg text-text-main">
                                    {formatCurrency(price)}
                                  </span>
                                  {type === "WHOLESALE" ? (
                                    <span className="bg-secondary/10 text-secondary-dark text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-secondary/20">
                                      Grosir
                                    </span>
                                  ) : (
                                    <span className="bg-border/30 text-text-muted text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                      Eceran
                                    </span>
                                  )}
                                </div>
                                <p className={`text-xs ${item.quantity < item.minOrder ? "text-danger font-bold" : "text-text-muted"}`}>
                                  Min. Order: {item.minOrder} {item.unit}
                                </p>
                                {item.quantity < item.minOrder && (
                                  <p className="text-[10px] text-danger mt-1">Kuantitas belum memenuhi minimum order.</p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center border border-border rounded-md bg-surface">
                                  <button 
                                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                    className="p-1.5 text-text-muted hover:text-primary disabled:opacity-50"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-10 text-center text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <button 
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    className="p-1.5 text-text-muted hover:text-primary"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="text-right sm:hidden">
                                  <p className="text-xs text-text-muted">Subtotal</p>
                                  <p className="font-bold text-text-main">{formatCurrency(itemSubtotal)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Store Footer / Checkout Action */}
                  <div className="bg-surface-bg border-t border-border p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-text-muted mb-1">Subtotal Belanja di Toko Ini:</p>
                      <p className="text-xl font-bold text-earth">{formatCurrency(group.subtotal)}</p>
                    </div>
                    <Button 
                      onClick={() => router.push(`/checkout?storeId=${group.storeId}`)}
                      className="w-full sm:w-auto flex items-center justify-center"
                      disabled={!group.isValid}
                    >
                      Buat Pesanan <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
