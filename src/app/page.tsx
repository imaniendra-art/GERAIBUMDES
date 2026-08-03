import { ArrowRight, ShoppingBag, Store, TrendingUp, CheckCircle, Search, ShieldCheck, MapPin, ArrowRightCircle, PackageOpen, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import dbConnect from "@/lib/db";
import ProductModel from "@/models/Product";
import StoreModel from "@/models/Store";
import Category from "@/models/Category";
import BumdesProfile from "@/models/BumdesProfile";
import { ProductCard } from "@/components/ui/ProductCard";
import { StoreCard } from "@/components/ui/StoreCard";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  await dbConnect();

  // Get up to 8 active products for the grid
  const products = await ProductModel.find({ status: "ACTIVE" })
    .populate({ path: "storeId", model: StoreModel, match: { status: "ACTIVE" }, select: "name slug" })
    .populate({ path: "categoryId", model: Category, select: "name slug" })
    .sort({ createdAt: -1 })
    .limit(8);
  const availableProducts = products.filter(p => p.storeId != null);

  // Get active stores for marquee
  const stores = await StoreModel.find({ status: "ACTIVE" })
    .sort({ createdAt: -1 })
    .limit(10);
    
  // Duplicate stores for seamless marquee if there are any
  const marqueeStores = [...stores, ...stores, ...stores];

  return (
    <div className="flex flex-col min-h-screen">
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: scroll-left 30s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Hero Section */}
      <section className="bg-surface-bg text-text-main min-h-[85vh] flex items-center relative overflow-hidden border-b border-border py-24">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="max-w-3xl flex-1 animate-fade-in">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
              🚀 Platform B2B BUMDes #1 di Indonesia
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold tracking-tight mb-8 text-primary leading-[1.05]">
              Pasar Digital <br className="hidden sm:block" /> <span className="text-text-main">BUMDes Nasional</span>
            </h1>
            <p className="text-xl sm:text-2xl text-text-muted mb-12 max-w-2xl leading-relaxed">
              Jelajahi komoditas unggulan dari BUMDes seluruh Indonesia. Platform marketplace terpercaya untuk transaksi bisnis antar-daerah yang aman dan saling menguntungkan.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <Link href="/produk" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full font-bold px-10">
                  Jelajahi Produk
                </Button>
              </Link>
              {!session && (
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full px-8 h-14 text-lg">
                    Daftarkan BUMDes
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="mt-14 pt-8 border-t border-border flex flex-wrap items-center gap-8 sm:gap-12">
              <div>
                <div className="text-3xl font-black text-text-main">500+</div>
                <div className="text-sm font-medium text-text-muted mt-1">BUMDes Bergabung</div>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block"></div>
              <div>
                <div className="text-3xl font-black text-text-main">10rb+</div>
                <div className="text-sm font-medium text-text-muted mt-1">Produk Unggulan</div>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block"></div>
              <div>
                <div className="text-3xl font-black text-text-main">100%</div>
                <div className="text-sm font-medium text-text-muted mt-1">Transaksi Aman</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 hidden lg:block relative w-full h-full min-h-[500px]">
             {/* Decorative Elements for Hero */}
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-[3rem] transform rotate-3 animate-float"></div>
             <div className="absolute inset-4 bg-white rounded-[2.5rem] shadow-natural overflow-hidden flex items-center justify-center border border-border">
                <div className="text-center p-12 relative z-10">
                  <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Store className="w-16 h-16 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-primary mb-3">Ekonomi Desa</h3>
                  <p className="text-lg text-text-muted font-medium">Tumbuh Bersama GeraiBUMDes</p>
                </div>
                
                {/* Abstract corner decorations */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-secondary/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-2xl"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-surface">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-text-main mb-3">Pilihan Terbaik</h2>
              <p className="text-lg text-text-muted max-w-2xl">Komoditas unggulan langsung dari pengelola BUMDes di berbagai daerah.</p>
            </div>
            <Link href="/produk">
               <Button variant="outline" className="hidden md:flex">Lihat Semua Kategori</Button>
            </Link>
          </div>
          
          {availableProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {availableProducts.map((product) => (
                  <ProductCard key={product._id.toString()} product={product} />
                ))}
              </div>
              <div className="mt-12 text-center md:hidden">
                <Link href="/produk">
                  <Button variant="outline" className="w-full">Lihat Semua Kategori</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-24 bg-surface-bg rounded-2xl border border-border border-dashed">
              <PackageOpen className="h-16 w-16 text-border mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-main mb-2">Belum Ada Produk</h3>
              <p className="text-text-muted">BUMDes terdaftar sedang mempersiapkan katalog produk mereka.</p>
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-surface-bg border-y border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-6">Membangun Ekosistem Desa</h2>
            <p className="text-lg sm:text-xl text-text-muted max-w-3xl mx-auto">
              Lebih dari sekadar tempat berjualan. Platform digital nasional untuk memperkuat rantai pasok antar-daerah secara terstruktur.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-surface">
              <CardContent className="p-10 text-center">
                <div className="mx-auto bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-text-main">Aman & Terverifikasi</h3>
                <p className="text-text-muted leading-relaxed">
                  Setiap BUMDes melewati proses verifikasi ketat. Transaksi bisnis Anda dijamin keabsahannya oleh mitra resmi.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-surface">
              <CardContent className="p-10 text-center">
                <div className="mx-auto bg-secondary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8">
                  <TrendingUp className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-text-main">Skala B2B Grosir</h3>
                <p className="text-text-muted leading-relaxed">
                  Penuhi stok BUMDes Anda dengan harga pabrik/petani. Sistem minimal order memastikan harga yang paling kompetitif.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-surface">
              <CardContent className="p-10 text-center">
                <div className="mx-auto bg-cta/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8">
                  <Users className="h-10 w-10 text-cta" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-text-main">Saling Menguatkan</h3>
                <p className="text-text-muted leading-relaxed">
                  Surplus komoditas di satu desa akan menutupi defisit di desa lain. Rantai ekonomi lokal yang kuat dan mandiri.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Skenario Flow */}
      <section id="cara-kerja" className="py-24 bg-surface">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-main mb-6">Cara Kerja Platform</h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Tiga langkah mudah untuk mulai berkolaborasi dengan ribuan BUMDes di seluruh nusantara.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center z-10 w-full lg:w-72">
              <div className="bg-primary/5 p-8 rounded-[2rem] mb-6 w-full aspect-square flex flex-col items-center justify-center border border-primary/10 relative">
                <div className="absolute top-4 left-4 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                <Store className="h-16 w-16 text-primary mb-4" />
                <h4 className="font-bold text-xl mb-2">BUMDes Penyedia</h4>
              </div>
              <p className="text-text-muted">Menawarkan komoditas unggulan desanya dengan harga grosir kompetitif.</p>
            </div>

            <ArrowRight className="hidden lg:block h-12 w-12 text-border flex-shrink-0" />
            <div className="lg:hidden h-12 w-[2px] bg-border border-dashed"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center z-10 w-full lg:w-72">
              <div className="bg-cta/5 p-8 rounded-[2rem] mb-6 w-full aspect-square flex flex-col items-center justify-center border border-cta/10 relative">
                <div className="absolute top-4 left-4 bg-cta text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                <ShieldCheck className="h-16 w-16 text-cta mb-4" />
                <h4 className="font-bold text-xl mb-2 text-text-main">GeraiBUMDes</h4>
              </div>
              <p className="text-text-muted">Platform pintar yang menjembatani transaksi B2B antar-desa secara aman.</p>
            </div>

            <ArrowRight className="hidden lg:block h-12 w-12 text-border flex-shrink-0" />
            <div className="lg:hidden h-12 w-[2px] bg-border border-dashed"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center z-10 w-full lg:w-72">
              <div className="bg-secondary/5 p-8 rounded-[2rem] mb-6 w-full aspect-square flex flex-col items-center justify-center border border-secondary/10 relative">
                <div className="absolute top-4 left-4 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                <Users className="h-16 w-16 text-secondary mb-4" />
                <h4 className="font-bold text-xl mb-2">BUMDes Pembeli</h4>
              </div>
              <p className="text-text-muted">Menerima pasokan komoditas untuk disalurkan ke masyarakat lokal.</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Verified Stores (Marquee) */}
      <section className="py-24 bg-surface-bg border-t border-border overflow-hidden relative">
        <div className="w-full px-4 sm:px-8 lg:px-24 mb-12 relative z-10 text-center">
          <h2 className="text-3xl font-bold text-text-main mb-4">Jejaring BUMDes Terverifikasi</h2>
          <p className="text-lg text-text-muted">Ribuan desa telah bergabung dalam ekosistem pasokan digital.</p>
        </div>
        
        {stores.length > 0 ? (
          <div className="w-full overflow-hidden">
            <div className="animate-marquee flex gap-6 px-4 py-4">
              {marqueeStores.map((store, index) => (
                <div key={`${store._id}-${index}`} className="w-80 flex-shrink-0">
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center py-16 px-4 bg-surface rounded-2xl border border-border border-dashed">
            <Store className="h-16 w-16 text-border mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-main mb-2">Belum Ada Toko</h3>
            <p className="text-text-muted">Jadilah BUMDes pertama yang berkolaborasi di platform ini.</p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link href="/bumdes">
            <Button variant="outline" size="lg" className="px-8">Lihat Direktori BUMDes</Button>
          </Link>
        </div>
      </section>

      {/* CTA Akhir */}
      <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
           <div className="absolute top-24 -right-24 w-96 h-96 bg-secondary rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight">Siap Memperluas Pasar <br/> BUMDes Anda?</h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-2xl mx-auto">
            Bergabunglah sekarang. Temukan pasokan harga grosir atau pasarkan komoditas unggulan desa Anda ke seluruh Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold px-10 h-14 text-lg bg-white text-primary hover:bg-surface-bg border-none">
                Gabung Menjadi Mitra
              </Button>
            </Link>
            <Link href="/produk">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 h-14 text-lg border-white text-white hover:bg-white/10">
                Mulai Belanja
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
