import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { Package, Store as StoreIcon, MapPin, Search, Phone, Clock } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";

export default async function StoreProfilePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  await dbConnect();

  const store = await Store.findOne({ slug: resolvedParams.slug, status: "ACTIVE" })
    .populate({ path: "bumdesId", model: BumdesProfile, select: "village district cityOrRegency province description businessType" })
    .lean();

  if (!store) {
    notFound();
  }

  const productQuery: any = { storeId: store._id, status: "ACTIVE" };
  if (resolvedSearchParams.q) {
    productQuery.name = { $regex: resolvedSearchParams.q, $options: "i" };
  }

  const products = await Product.find(productQuery)
    .populate({ path: "categoryId", model: Category, select: "name slug" })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="bg-surface-bg min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full px-4 sm:px-8 lg:px-24">
        
        {/* Store Profile Header */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden mb-8 shadow-sm">
          <div className="h-48 bg-primary relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-end">
              <div className="h-20 w-20 sm:h-24 sm:w-24 bg-surface rounded-lg border-4 border-surface flex items-center justify-center text-primary shadow-lg overflow-hidden flex-shrink-0">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <StoreIcon className="h-10 w-10 sm:h-12 sm:w-12" />
                )}
              </div>
              <div className="ml-4 sm:ml-5 pb-1 text-surface">
                <h1 className="text-2xl sm:text-3xl font-bold">{store.name}</h1>
                <p className="flex items-start sm:items-center text-surface/90 mt-1 text-xs sm:text-sm">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 mt-0.5 sm:mt-0 flex-shrink-0" /> 
                  <span className="line-clamp-2 sm:line-clamp-1">{store.bumdesId?.village}, {store.bumdesId?.district}, {store.bumdesId?.cityOrRegency}, {store.bumdesId?.province}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 pt-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3 text-text-main">
                <h3 className="font-bold text-lg mb-2">Tentang BUMDes</h3>
                <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{store.description || store.bumdesId?.description || "BUMDes ini belum menambahkan deskripsi toko."}</p>
              </div>
              <div className="md:w-1/3 bg-surface-bg p-4 rounded-lg border border-border h-fit">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-border">
                  <span className="text-text-muted text-sm">Status Toko</span>
                  <span className="bg-success/20 text-success-dark px-2 py-0.5 rounded text-xs font-bold">TERVERIFIKASI</span>
                </div>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-border">
                  <span className="text-text-muted text-sm">Fokus Usaha</span>
                  <span className="font-medium text-sm text-text-main text-right">{store.bumdesId?.businessType || "-"}</span>
                </div>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-border">
                  <span className="text-text-muted text-sm">Total Produk</span>
                  <span className="font-medium text-sm text-text-main">{products.length} Produk Aktif</span>
                </div>
                
                {(store.whatsappNumber || store.phoneNumber || store.operationalHours) && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <h4 className="font-bold text-sm mb-2 text-text-main">Info Kontak & Jam Buka</h4>
                    
                    {(store.whatsappNumber || store.phoneNumber) && (
                      <div className="flex items-start text-sm">
                        <Phone className="h-4 w-4 mr-2 text-text-muted mt-0.5" />
                        <span className="text-text-main">{store.whatsappNumber || store.phoneNumber}</span>
                      </div>
                    )}
                    
                    {store.operationalHours && (
                      <div className="flex items-start text-sm">
                        <Clock className="h-4 w-4 mr-2 text-text-muted mt-0.5" />
                        <span className="text-text-main whitespace-pre-wrap">{store.operationalHours}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Store Products */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-text-main">Produk {store.name}</h2>
          <form className="relative w-full sm:w-64">
             <input
              type="text"
              name="q"
              defaultValue={resolvedSearchParams.q}
              placeholder="Cari di toko ini..."
              className="w-full bg-surface border border-border text-text-main rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id.toString()} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 bg-surface rounded-lg border border-border mt-4">
            <Package className="h-16 w-16 text-border mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-main">Belum Ada Produk</h2>
            <p className="text-text-muted mt-2">Toko ini belum menambahkan produk ke katalog.</p>
          </div>
        )}

      </div>
    </div>
  );
}
