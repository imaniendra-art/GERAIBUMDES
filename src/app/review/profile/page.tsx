import { StoreCard } from "@/components/ui/StoreCard";
import { ProductCard } from "@/components/ui/ProductCard";
import { mockStores, mockProducts } from "@/lib/mock-data";
import { MapPin, Phone, Mail, ShieldCheck } from "lucide-react";

export default function MockProfilePage() {
  const store = mockStores[0];
  const products = mockProducts.filter(p => p.storeId.slug === store.slug);

  return (
    <div className="min-h-screen bg-surface-bg pb-20">
      <div className="w-full h-64 md:h-80 relative">
        <img src={store.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-surface rounded-3xl shadow-natural border border-border p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-surface shadow-md flex-shrink-0 bg-surface-bg">
            <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-text-main">{store.name}</h1>
                  <ShieldCheck className="w-6 h-6 text-secondary flex-shrink-0" />
                </div>
                <div className="text-sm font-semibold text-primary mb-4">{store.businessType}</div>
                <p className="text-text-muted leading-relaxed max-w-2xl">{store.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-border text-sm text-text-muted">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {store.village}, {store.province}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> 0812-3456-7890</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> kontak@{store.slug}.com</div>
            </div>
          </div>
        </div>
        
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-main">Katalog BUMDes</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard key={p._id} product={p as any} />
          ))}
          {/* Duplicate products just to fill up space for mockup */}
          {products.map(p => (
            <ProductCard key={p._id + "dup1"} product={p as any} />
          ))}
        </div>
      </div>
    </div>
  );
}
