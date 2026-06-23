import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { Package, Store as StoreIcon, MapPin, Search, Phone, Clock, FileCheck, ShieldCheck, Target } from "lucide-react";
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
    .populate({ path: "bumdesId", model: BumdesProfile, select: "village district regency province description businessType" })
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
                {(() => {
                  const locationParts = [
                    store.bumdesId?.village,
                    store.bumdesId?.district,
                    store.bumdesId?.regency,
                    store.bumdesId?.province
                  ].filter(part => part && part !== "-");
                  const locationText = locationParts.length > 0 ? locationParts.join(", ") : "Alamat belum dilengkapi";
                  
                  return store.googleMapsUrl ? (
                    <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-text-muted mt-1.5 text-sm hover:text-blue-600 hover:underline transition-colors group w-fit">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0 group-hover:text-blue-600" /> 
                      <span className="line-clamp-1">{locationText}</span>
                      <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">Lihat Peta</span>
                    </a>
                  ) : (
                    <p className="flex items-center text-text-muted mt-1.5 text-sm">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" /> 
                      <span className="line-clamp-1">{locationText}</span>
                    </p>
                  );
                })()}
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3 text-text-main">
                  <h3 className="font-bold text-lg mb-2">Tentang BUMDes</h3>
                  <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">{store.description || store.bumdesId?.description || "BUMDes ini belum menambahkan deskripsi toko."}</p>
                  
                  {store.nib && (
                    <div className="mt-6 border-t border-border pt-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Legalitas & Izin Usaha</h3>
                      <div className="flex items-center text-gray-700">
                        <FileCheck className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                        <span className="text-sm">NIB: {store.nib}</span>
                      </div>
                    </div>
                  )}

                  {(store.directorName || store.villageHeadName) && (
                    <div className="mt-6 border-t border-border pt-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">Struktur Kepengurusan</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {store.directorName && (
                          <div className="flex flex-col">
                            <span className="text-gray-500 text-xs mb-1">👨‍💼 Direktur</span>
                            <span className="font-medium text-gray-800">{store.directorName}</span>
                          </div>
                        )}
                        {store.villageHeadName && (
                          <div className="flex flex-col">
                            <span className="text-gray-500 text-xs mb-1">🏛️ Kepala Desa / Penasihat</span>
                            <span className="font-medium text-gray-800">{store.villageHeadName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              <div className="md:w-1/3 bg-white border border-gray-100 shadow-sm p-6 rounded-2xl h-fit">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                    <span className="text-gray-500 text-sm flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-gray-400" /> Status Toko
                    </span>
                    <span className="bg-green-50 border border-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">TERVERIFIKASI</span>
                  </div>
                  <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                    <span className="text-gray-500 text-sm flex items-center mt-0.5 whitespace-nowrap">
                      <Target className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" /> Fokus Usaha
                    </span>
                    <span className="font-semibold text-sm text-gray-800 text-right ml-4 leading-relaxed">{store.bumdesId?.businessType || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm flex items-center">
                      <Package className="w-4 h-4 mr-2 text-gray-400" /> Total Produk
                    </span>
                    <span className="font-semibold text-sm text-gray-800">{products.length} Aktif</span>
                  </div>
                </div>
                
                {(store.whatsappNumber || store.phoneNumber || store.operationalHours || store.address) && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <h4 className="font-bold text-sm mb-4 text-gray-800">Info Kontak & Operasional</h4>
                    <div className="space-y-4">
                      {(store.whatsappNumber || store.phoneNumber) && (
                        <div className="flex items-start text-sm group">
                          <Phone className="h-4 w-4 mr-3 text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-green-600 transition-colors" />
                          <a 
                            href={`https://wa.me/${formatWhatsAppNumber((store.whatsappNumber || store.phoneNumber) as string)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 font-medium hover:text-green-600 hover:underline transition-colors"
                          >
                            {store.whatsappNumber || store.phoneNumber}
                          </a>
                        </div>
                      )}
                      
                      {store.operationalHours && (
                        <div className="flex items-start text-sm">
                          <Clock className="h-4 w-4 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{store.operationalHours}</span>
                        </div>
                      )}

                      {store.address && (
                        <div className="flex items-start text-sm">
                          <MapPin className="h-4 w-4 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          {store.googleMapsUrl ? (
                            <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600 hover:underline transition-colors">
                              <span className="whitespace-pre-wrap leading-relaxed">{store.address}</span>
                            </a>
                          ) : (
                            <span className="text-gray-700 leading-relaxed whitespace-pre-wrap">{store.address}</span>
                          )}
                        </div>
                      )}
                    </div>
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
