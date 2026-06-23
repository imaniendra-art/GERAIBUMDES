import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { Package, Store as StoreIcon, MapPin, Search, Phone, Clock, FileCheck } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";

const formatWhatsAppNumber = (phone: string) => {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  return cleaned;
};

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
          {/* Banner Cover */}
          {store.bannerUrl ? (
            <img src={store.bannerUrl} alt={`${store.name} Banner`} className="w-full h-48 md:h-64 object-cover" />
          ) : (
            <div className="bg-gradient-to-r from-green-600 to-teal-700 w-full h-48 md:h-64"></div>
          )}

          <div className="relative">
            {/* Overlapping Logo */}
            <div className="absolute -top-12 sm:-top-16 left-4 sm:left-8 h-24 w-24 sm:h-32 sm:w-32 bg-surface rounded-full border-4 border-surface shadow-md flex items-center justify-center text-primary overflow-hidden z-10">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <StoreIcon className="h-10 w-10 sm:h-14 sm:w-14" />
              )}
            </div>

            <div className="px-4 sm:px-8 pt-16 sm:pt-20 pb-8">
              <div className="mb-6 pb-6 border-b border-border">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-main">{store.name}</h1>
                {store.nib && (
                  <div className="flex items-center mt-2 mb-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50/50 border border-blue-100 text-blue-700 text-xs font-medium">
                      <FileCheck className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      NIB: {store.nib}
                    </span>
                  </div>
                )}
                {store.googleMapsUrl ? (
                  <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-text-muted mt-1.5 text-sm hover:text-blue-600 hover:underline transition-colors group w-fit">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0 group-hover:text-blue-600" /> 
                    <span className="line-clamp-1">{store.bumdesId?.village}, {store.bumdesId?.district}, {store.bumdesId?.cityOrRegency}, {store.bumdesId?.province}</span>
                    <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">Lihat Peta</span>
                  </a>
                ) : (
                  <p className="flex items-center text-text-muted mt-1.5 text-sm">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" /> 
                    <span className="line-clamp-1">{store.bumdesId?.village}, {store.bumdesId?.district}, {store.bumdesId?.cityOrRegency}, {store.bumdesId?.province}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3 text-text-main">
                  <h3 className="font-bold text-lg mb-2">Tentang BUMDes</h3>
                  <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">{store.description || store.bumdesId?.description || "BUMDes ini belum menambahkan deskripsi toko."}</p>
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

                {(store.directorName || store.villageHeadName) && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <h4 className="font-bold text-sm mb-2 text-text-main">Struktur Kepengurusan</h4>
                    {store.directorName && (
                      <div className="flex flex-col mb-2">
                        <span className="text-text-muted text-xs">👨‍💼 Direktur</span>
                        <span className="font-medium text-sm text-text-main">{store.directorName}</span>
                      </div>
                    )}
                    {store.villageHeadName && (
                      <div className="flex flex-col">
                        <span className="text-text-muted text-xs">🏛️ Kepala Desa / Penasihat</span>
                        <span className="font-medium text-sm text-text-main">{store.villageHeadName}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {(store.whatsappNumber || store.phoneNumber || store.operationalHours || store.address) && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <h4 className="font-bold text-sm mb-2 text-text-main">Info Kontak & Operasional</h4>
                    
                    {(store.whatsappNumber || store.phoneNumber) && (
                      <div className="flex items-start text-sm group">
                        <Phone className="h-4 w-4 mr-2 text-text-muted mt-0.5 flex-shrink-0 group-hover:text-green-600 transition-colors" />
                        <a 
                          href={`https://wa.me/${formatWhatsAppNumber((store.whatsappNumber || store.phoneNumber) as string)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-main hover:text-green-600 hover:underline transition-colors cursor-pointer"
                        >
                          {store.whatsappNumber || store.phoneNumber}
                        </a>
                      </div>
                    )}
                    
                    {store.operationalHours && (
                      <div className="flex items-start text-sm">
                        <Clock className="h-4 w-4 mr-2 text-text-muted mt-0.5 flex-shrink-0" />
                        <span className="text-text-main whitespace-pre-wrap">{store.operationalHours}</span>
                      </div>
                    )}

                    {store.address && (
                      <div className="flex items-start text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-text-muted mt-0.5 flex-shrink-0" />
                        {store.googleMapsUrl ? (
                          <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-text-main hover:text-blue-600 hover:underline transition-colors">
                            <span className="whitespace-pre-wrap">{store.address}</span>
                          </a>
                        ) : (
                          <span className="text-text-main whitespace-pre-wrap">{store.address}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
