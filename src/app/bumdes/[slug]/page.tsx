import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { Package, Store as StoreIcon, MapPin, Search, Phone, Clock, FileCheck, ShieldCheck, Target, Globe } from "lucide-react";
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Store Profile Header */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden mb-10 shadow-natural">
          {/* Banner Cover */}
          <div className="relative w-full h-64 md:h-[360px] bg-gradient-to-r from-gray-900 to-gray-800">
            {store.bannerUrl ? (
              <img src={store.bannerUrl} alt={`${store.name} Banner`} className="w-full h-full object-cover opacity-90" />
            ) : (
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop" alt="Default Banner" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          <div className="relative px-6 sm:px-10 pb-12">
            {/* Overlapping Logo & Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 -mt-12 sm:-mt-[68px] relative z-10">
              <div className="h-40 w-40 sm:h-48 sm:w-48 bg-surface rounded-2xl border-[6px] sm:border-[8px] border-surface shadow-lg flex items-center justify-center text-primary overflow-hidden flex-shrink-0">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover bg-surface-bg" />
                ) : (
                  <StoreIcon className="h-20 w-20 sm:h-24 sm:w-24 text-primary/50" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left mb-2 sm:mb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-5">
                  <h1 className="text-4xl sm:text-5xl font-black text-text-main leading-tight">{store.name}</h1>
                  <span className="inline-flex items-center justify-center gap-1.5 bg-success/10 border border-success/20 text-success px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase w-fit mx-auto sm:mx-0 shadow-sm">
                    <ShieldCheck className="w-4 h-4" /> TERVERIFIKASI
                  </span>
                </div>
                {(() => {
                  const locationParts = [
                    store.village || store.bumdesId?.village,
                    store.district || store.bumdesId?.district,
                    store.regency || store.bumdesId?.regency,
                    store.province || store.bumdesId?.province
                  ].filter(part => part && part !== "-");
                  const locationText = locationParts.length > 0 ? locationParts.join(", ") : "Alamat belum dilengkapi";
                  
                  return store.googleMapsUrl ? (
                    <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center sm:justify-start text-text-muted hover:text-blue-600 hover:underline transition-colors group text-sm sm:text-base">
                      <MapPin className="h-5 w-5 mr-2 flex-shrink-0 group-hover:text-blue-600" /> 
                      <span className="line-clamp-1">{locationText}</span>
                    </a>
                  ) : (
                    <p className="inline-flex items-center justify-center sm:justify-start text-text-muted text-sm sm:text-base">
                      <MapPin className="h-5 w-5 mr-2 flex-shrink-0" /> 
                      <span className="line-clamp-1">{locationText}</span>
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column (8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* About Card */}
            <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group">
              <h3 className="font-bold text-xl mb-4 text-text-main flex items-center">
                Tentang BUMDes
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">{store.description || store.bumdesId?.description || "BUMDes ini belum menambahkan deskripsi toko."}</p>
            </div>

            {/* Structure Card */}
            {(store.directorName || store.villageHeadName) && (
              <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                <h3 className="font-bold text-xl mb-6 text-text-main">Struktur Kepengurusan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {store.directorName && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        👨‍💼
                      </div>
                      <div>
                        <span className="block text-gray-500 text-sm mb-1 font-medium">Direktur BUMDes</span>
                        <span className="block font-bold text-gray-800 text-lg">{store.directorName}</span>
                      </div>
                    </div>
                  )}
                  {store.villageHeadName && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        🏛️
                      </div>
                      <div>
                        <span className="block text-gray-500 text-sm mb-1 font-medium">Kepala Desa / Penasihat</span>
                        <span className="block font-bold text-gray-800 text-lg">{store.villageHeadName}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column (4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Trust Panel Card */}
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300">
                <ShieldCheck className="w-32 h-32 text-success" />
              </div>
              <h4 className="font-bold text-lg mb-5 text-text-main relative z-10">Informasi Usaha</h4>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                  <span className="text-gray-500 text-sm flex items-center mt-0.5 whitespace-nowrap">
                    <Target className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" /> Fokus Usaha
                  </span>
                  <span className="font-semibold text-sm text-gray-800 text-right ml-4 leading-relaxed">{store.bumdesId?.businessType || "-"}</span>
                </div>
                {store.nib && (
                  <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                    <span className="text-gray-500 text-sm flex items-center mt-0.5 whitespace-nowrap">
                      <FileCheck className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" /> Legalitas NIB
                    </span>
                    <span className="font-semibold text-sm text-gray-800 text-right ml-4">{store.nib}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-400" /> Total Produk
                  </span>
                  <span className="font-semibold text-sm text-gray-800">{products.length} Aktif</span>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            {(store.whatsappNumber || store.phoneNumber || store.operationalHours || store.address || store.villageWebsiteUrl) && (
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all">
                <h4 className="font-bold text-lg mb-5 text-text-main">Kontak & Operasional</h4>
                <div className="space-y-4">
                  {(store.whatsappNumber || store.phoneNumber) && (
                    <div className="flex items-start text-sm group">
                      <Phone className="h-5 w-5 mr-3 text-primary mt-0.5 flex-shrink-0 transition-colors" />
                      <div>
                        <span className="block text-xs text-gray-500 mb-0.5 font-medium">Telepon / WhatsApp</span>
                        <a 
                          href={`https://wa.me/${formatWhatsAppNumber((store.whatsappNumber || store.phoneNumber) as string)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 font-bold hover:text-green-600 hover:underline transition-colors"
                        >
                          {store.whatsappNumber || store.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {store.operationalHours && (
                    <div className="flex items-start text-sm">
                      <Clock className="h-5 w-5 mr-3 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-xs text-gray-500 mb-0.5 font-medium">Jam Operasional</span>
                        <span className="text-gray-800 font-medium">{store.operationalHours}</span>
                      </div>
                    </div>
                  )}

                  {store.address && (
                    <div className="flex items-start text-sm">
                      <MapPin className="h-5 w-5 mr-3 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-xs text-gray-500 mb-0.5 font-medium">Alamat</span>
                        {store.googleMapsUrl ? (
                          <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-gray-800 font-medium hover:text-blue-600 hover:underline transition-colors">
                            <span className="whitespace-pre-wrap leading-relaxed">{store.address}</span>
                          </a>
                        ) : (
                          <span className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{store.address}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {store.villageWebsiteUrl && (
                    <div className="flex items-start text-sm">
                      <Globe className="h-5 w-5 mr-3 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-xs text-gray-500 mb-0.5 font-medium">Website Desa</span>
                        <a href={store.villageWebsiteUrl.startsWith('http') ? store.villageWebsiteUrl : `https://${store.villageWebsiteUrl}`} target="_blank" rel="noopener noreferrer" className="text-gray-800 font-medium hover:text-blue-600 hover:underline transition-colors break-all">
                          {store.villageWebsiteUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Store Products Section */}
        <div className="mt-20 pt-10 border-t border-border">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-3xl font-black text-text-main">Katalog Produk BUMDes</h2>
            <form className="relative w-full sm:w-72">
               <input
                type="text"
                name="q"
                defaultValue={resolvedSearchParams.q}
                placeholder="Cari produk di toko ini..."
                className="w-full h-11 bg-surface border border-border text-text-main rounded-xl pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm shadow-sm transition-all duration-200"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
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
        
        </div> {/* Ends Store Products Section */}

      </div>
    </div>
  );
}
