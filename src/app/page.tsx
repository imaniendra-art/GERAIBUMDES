import { Store, ArrowRight, ShieldCheck, TrendingUp, Users, ArrowRightCircle, PackageOpen } from "lucide-react";
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
      <section className="bg-primary text-surface py-20 relative overflow-hidden">
        <div className="w-full px-4 sm:px-8 lg:px-24 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Platform Bisnis Digital <span className="whitespace-nowrap">Antar-BUMDes</span>
            </h1>
            <p className="text-xl sm:text-2xl text-surface/90 mb-10 max-w-2xl leading-relaxed">
              Menghubungkan BUMDes penyedia komoditas, layanan jasa, dan potensi pariwisata dengan mitra strategis untuk saling memenuhi kebutuhan bisnis dan menggerakkan ekonomi antar-daerah.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <Link href="/produk" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full font-bold px-8">
                  Mulai Belanja
                </Button>
              </Link>
              <Link href="/produk" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full bg-surface/10 text-surface border-surface hover:bg-surface/20">
                  Lihat Produk
                </Button>
              </Link>
              <Link href="/bumdes" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full bg-surface/10 text-surface border-surface hover:bg-surface/20">
                  Lihat Toko BUMDes
                </Button>
              </Link>
              {!session && (
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full bg-surface/10 text-surface border-surface hover:bg-surface/20">
                    Daftarkan BUMDes
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Abstract shape for decoration */}
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-10">
          <svg width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M45.7,-76.4C58.9,-69.3,69.2,-55.4,76.5,-40.8C83.8,-26.2,88,-11,85.5,3.3C82.9,17.6,73.6,31.1,63.6,43.2C53.6,55.4,42.8,66.3,29.4,72.7C16,79.2,0.1,81.3,-15,79.1C-30.1,76.9,-44.3,70.5,-55.9,60.6C-67.6,50.8,-76.6,37.6,-81.4,23.3C-86.2,9.1,-86.7,-6.2,-81.7,-19.9C-76.8,-33.6,-66.4,-45.8,-53.8,-53.5C-41.2,-61.1,-26.5,-64.3,-12.3,-68.8C1.9,-73.2,16.2,-79.1,32.5,-83.4C45.7,-76.4,45.7,-76.4,45.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-surface">
        <div className="w-full px-4 sm:px-8 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-main mb-4">Mengapa Menggunakan geraibumdes.com?</h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Ekosistem digital yang dirancang khusus agar usaha antar-daerah saling memenuhi.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm bg-surface-bg/50">
              <CardContent className="pt-8 text-center">
                <div className="mx-auto bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">BUMDes Terverifikasi</h3>
                <p className="text-text-muted leading-relaxed">
                  Hanya BUMDes resmi dan terverifikasi yang dapat menjadi penyedia produk di platform ini, menjaga keamanan transaksi B2B.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm bg-surface-bg/50">
              <CardContent className="pt-8 text-center">
                <div className="mx-auto bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-earth" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Harga Grosir B2B</h3>
                <p className="text-text-muted leading-relaxed">
                  Fasilitas penetapan minimal order dan harga grosir bertingkat yang memudahkan BUMDes membeli pasokan untuk dijual kembali.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-surface-bg/50">
              <CardContent className="pt-8 text-center">
                <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-primary-dark" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Saling Menguatkan</h3>
                <p className="text-text-muted leading-relaxed">
                  BUMDes yang kekurangan stok dapat dipasok oleh BUMDes dari desa lain. Jaringan ekonomi desa yang mandiri dan terstruktur.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Skenario Flow */}
      <section id="cara-kerja" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-main mb-4">Cara Kerja Ekosistem</h2>
            <p className="text-lg text-text-muted max-w-3xl mx-auto leading-relaxed">
              BUMDes di suatu daerah yang memiliki keunggulan pasokan dapat menawarkan produknya. BUMDes dari daerah lain yang membutuhkan dapat memesan produk tersebut untuk disalurkan ke masyarakat lokal. Keduanya saling terhubung secara terstruktur.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-12 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center z-10 bg-surface p-6 rounded-xl shadow-sm border border-border w-full md:w-64">
              <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <Store className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-lg mb-2">BUMDes Penyedia</h4>
              <p className="text-sm text-text-muted">Menawarkan komoditas unggulan desanya dengan harga grosir.</p>
            </div>

            <ArrowRightCircle className="hidden md:block h-10 w-10 text-border" />
            <div className="md:hidden h-8 w-[2px] bg-border my-2"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center z-10 bg-secondary/10 p-6 rounded-xl shadow-sm border border-secondary/20 w-full md:w-64">
              <div className="bg-secondary/20 text-secondary-dark p-4 rounded-full mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-secondary-dark">geraibumdes.com</h4>
              <p className="text-sm text-text-muted">Platform yang menjembatani transaksi B2B antar-desa secara aman.</p>
            </div>

            <ArrowRightCircle className="hidden md:block h-10 w-10 text-border" />
            <div className="md:hidden h-8 w-[2px] bg-border my-2"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center z-10 bg-surface p-6 rounded-xl shadow-sm border border-border w-full md:w-64">
              <div className="bg-earth/10 text-earth p-4 rounded-full mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-lg mb-2">BUMDes Pembeli</h4>
              <p className="text-sm text-text-muted">Menerima pasokan komoditas untuk disalurkan ke masyarakat lokal.</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Verified Stores (Marquee) */}
      <section className="py-16 bg-surface border-y border-border overflow-hidden relative">
        <div className="w-full px-4 sm:px-8 lg:px-24 mb-8 relative z-10 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-text-main mb-2">BUMDes Terverifikasi</h2>
            <p className="text-text-muted">Jejaring penyedia pasokan resmi di ekosistem geraibumdes.com.</p>
          </div>
          <Link href="/bumdes" className="hidden sm:flex items-center text-primary font-semibold hover:text-primary-dark whitespace-nowrap ml-4">
            Lihat Semua BUMDes <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        {stores.length > 0 ? (
          <div className="w-full overflow-hidden">
            <div className="animate-marquee flex gap-6 px-4 py-4">
              {marqueeStores.map((store, index) => (
                <div key={`${store._id}-${index}`} className="w-72 flex-shrink-0">
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full text-center py-16 px-4 sm:px-8 lg:px-24 bg-surface rounded-xl border border-border">
            <Store className="h-16 w-16 text-border mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text-main mb-2">Belum Ada Toko BUMDes</h3>
            <p className="text-text-muted">Saat ini belum ada BUMDes yang berstatus verifikasi aktif.</p>
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden px-4">
          <Link href="/bumdes">
            <Button variant="outline" className="w-full">Lihat Semua BUMDes</Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-surface-bg">
        <div className="w-full px-4 sm:px-8 lg:px-24">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-text-main mb-2">Produk Unggulan BUMDes</h2>
              <p className="text-text-muted">Temukan pasokan komoditas terbaik dari berbagai desa.</p>
            </div>
          </div>
          
          {availableProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {availableProducts.map((product) => (
                  <ProductCard key={product._id.toString()} product={product} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link href="/produk">
                  <Button size="lg" className="px-8 bg-primary hover:bg-primary-dark text-surface font-bold">
                    Lihat Semua Produk
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-surface rounded-xl border border-border">
              <PackageOpen className="h-16 w-16 text-border mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-main mb-2">Belum Ada Produk</h3>
              <p className="text-text-muted">BUMDes terdaftar sedang mempersiapkan katalog produk mereka.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Akhir */}
      <section className="py-20 bg-primary-dark text-surface text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">Siap Mengembangkan Usaha BUMDes Anda?</h2>
          <p className="text-lg text-surface/80 mb-10 leading-relaxed">
            Bergabunglah dengan ekosistem B2B antar-BUMDes. Perluas jangkauan pasar untuk komoditas unggulan desa Anda dan temukan pasokan dengan harga grosir terbaik.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold px-8">
                Daftarkan BUMDes Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
