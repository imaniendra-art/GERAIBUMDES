import { ProductCard } from "@/components/ui/ProductCard";
import { StoreCard } from "@/components/ui/StoreCard";
import { mockProducts, mockStores } from "@/lib/mock-data";
import { PackageOpen, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MockMarketplace() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-surface-bg py-16 border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-text-main mb-4">Marketplace Simulasi</h1>
          <p className="text-xl text-text-muted">Melihat komponen produk dan toko menggunakan data dummy statis.</p>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-text-main mb-3">Produk Terbaru</h2>
            <p className="text-text-muted">Daftar produk dummy yang di-render dengan komponen ProductCard aktual.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface-bg border-t border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-text-main mb-3">Direktori BUMDes</h2>
            <p className="text-text-muted">Daftar BUMDes dummy yang di-render dengan komponen StoreCard aktual.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockStores.map((store) => (
              <StoreCard key={store._id} store={store} activeProductCount={Math.floor(Math.random() * 50) + 1} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
