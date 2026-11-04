import { Metadata } from "next";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  Handshake, 
  TrendingUp, 
  Layers, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Wifi, 
  Flame, 
  Truck, 
  Tent, 
  Sparkles, 
  ArrowRight,
  HeartHandshake,
  Compass,
  ShoppingBag,
  Store,
  MapPin,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Tentang Kami - GeraiBUMDes",
  description: "Platform Ekosistem Digital & Hub Kolaborasi Portofolio BUMDes se-Indonesia. Memfasilitasi transaksi warga desa dan sinergi B2B antar-BUMDes.",
};

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-surface-bg text-text-main">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-primary/10 via-surface-bg to-surface-bg border-b border-border/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-main tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Membangun Kekuatan Ekonomi dari <span className="text-primary">Desa</span> untuk <span className="text-primary">Nusantara</span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg md:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            GeraiBUMDes adalah platform resmi penghubung dan etalase portofolio Badan Usaha Milik Desa se-Indonesia. Kami hadir melayani kebutuhan harian warga desa sekaligus membuka gerbang kemitraan B2B antar-desa ke skala nasional.
          </p>

          <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/register">
              <Button size="lg" className="rounded-xl font-bold bg-primary hover:brightness-95 text-white shadow-sm px-6 sm:px-8">
                Daftarkan BUMDes <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/produk">
              <Button variant="outline" size="lg" className="rounded-xl font-bold border-border hover:bg-surface text-text-main px-6 sm:px-8">
                Jelajahi Produk & Layanan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar */}
      <section className="py-8 bg-surface border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-1">6.900+</div>
              <p className="text-xs sm:text-sm text-text-muted">Basis Wilayah Desa Terdata</p>
            </div>
            <div className="p-4 border-l border-border">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-secondary mb-1">Multi-Sektor</div>
              <p className="text-xs sm:text-sm text-text-muted">Aset, Jasa, Retail & Wisata</p>
            </div>
            <div className="p-4 border-l border-border">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-cta mb-1">B2C & B2B</div>
              <p className="text-xs sm:text-sm text-text-muted">Untuk Warga & Antar-BUMDes</p>
            </div>
            <div className="p-4 border-l border-border">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-600 mb-1">100%</div>
              <p className="text-xs sm:text-sm text-text-muted">Transparan & Terverifikasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Latar Belakang: The "Why" */}
      <section className="py-14 md:py-24 bg-surface-bg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main leading-tight">
                BUMDes Hari Ini Adalah Penggerak Ekonomi Desa yang Mandiri
              </h2>
              <p className="text-text-muted leading-relaxed text-sm sm:text-base">
                Selama ini, publik sering memandang BUMDes hanya sebatas pengepul gabah atau distributor hasil panen. Padahal di lapangan, BUMDes telah bertransformasi menjadi pengelola unit bisnis modern yang mengakar kuat di denyut kehidupan warga desa.
              </p>
              <p className="text-text-muted leading-relaxed text-sm sm:text-base">
                BUMDes hari ini mengelola destinasi ekowisata bertaraf nasional, karya seni wastra & kerajinan kriya bernilai ekspor, hilirisasi kopi dan komoditas unggulan desa, infrastruktur internet desa mandiri, pangkalan energi resmi, hingga persewaan armada logistik dan fasilitas warga. Namun, potensi dan portofolio bernilai tinggi ini sering kali terisolasi dan belum terhubung ke jejaring pasar yang lebih luas.
              </p>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-text-main text-sm leading-relaxed">
                <span className="font-bold text-primary">Visi GeraiBUMDes:</span> Menghilangkan sekat isolasi tersebut. Kami menyatukan seluruh potensi unit usaha BUMDes ke dalam satu ekosistem terpadu agar dapat diakses oleh masyarakat desanya sendiri sekaligus membuka pintu kerjasama dengan ribuan desa lain di Indonesia.
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-surface">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4">
                      <Layers className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-base text-text-main mb-2">Showcase Portofolio</h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Etalase digital terverifikasi agar unit usaha desa dikenal oleh Pemda, BUMN, perbankan, dan mitra skala nasional.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-surface">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-base text-text-main mb-2">Bebas Spekulan / Calo</h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Transaksi langsung antara BUMDes dengan pembeli, memutus rantai tengkulak demi kepastian harga yang adil.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-surface">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-4">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-base text-text-main mb-2">Peningkatan PADes</h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Optimalisasi aset desa secara terukur untuk mendongkrak Pendapatan Asli Desa demi pembangunan warga.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-surface">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-4">
                      <Handshake className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-base text-text-main mb-2">Sinergi Antar-Desa</h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Desa yang kelebihan aset atau hasil bumi dapat melengkapi desa yang sedang kekurangan pasokan.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dua Dimensi Ekosistem: B2C untuk Warga & B2B untuk BUMDes */}
      <section className="py-14 md:py-24 bg-surface border-y border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main">
              Melayani Kebutuhan Warga, Menguatkan Kemitraan Antar-Desa
            </h2>
            <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
              GeraiBUMDes merancang ekosistem inklusif: masyarakat desa dapat bertransaksi langsung dengan BUMDes lokal, sementara pengurus BUMDes dapat berjejaring di tingkat nasional.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pilar 1: B2C Warga Desa */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-500/[0.04] to-primary/[0.08] border border-primary/20 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold mb-4">
                  B2C • Untuk Masyarakat & Warga Desa
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-main mb-3">
                  Layanan & Kebutuhan Rumah Tangga dalam Satu Pintu
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-6">
                  Warga desa kini tidak perlu repot mencari layanan harian. Melalui GeraiBUMDes, masyarakat dapat memesan dan menikmati produk langsung dari BUMDes setempat:
                </p>

                <ul className="space-y-3.5 mb-8">
                  <li className="flex items-start gap-3 text-sm text-text-main">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="font-semibold">Wisata & Produk Unggulan:</strong> Tiket destinasi wisata desa, homestay asri, kerajinan kriya, hingga oleh-oleh kopi khas desa.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-main">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Flame className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="font-semibold">Gas LPG & Kebutuhan Pokok:</strong> Pembelian tabung gas LPG 3kg/12kg resmi dan sembako terjangkau langsung dari BUMDes.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-main">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Wifi className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="font-semibold">Internet Desa & PPOB:</strong> Pembelian voucher WiFi RT/RW Net murah dan pembayaran tagihan listrik/air desa.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-main">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Tent className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="font-semibold">Persewaan Fasilitas Warga:</strong> Sewa tenda acara, sound system, gedung serbaguna, dan armada angkutan keluarga.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-main">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <HeartHandshake className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="font-semibold">Sirkulasi Uang Kembali ke Desa:</strong> Setiap transaksi warga menjadi Pendapatan Asli Desa yang kembali membiayai pembangunan fasilitas desanya sendiri.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-primary/20">
                <Link href="/register">
                  <Button variant="outline" className="w-full sm:w-auto rounded-xl font-bold border-primary text-primary hover:bg-primary hover:text-white">
                    Daftar Akun Warga (Gratis)
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pilar 2: B2B Antar-BUMDes */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-blue-500/[0.04] to-indigo-500/[0.08] border border-blue-500/20 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold mb-4">
                  B2B • Untuk BUMDes & Mitra Kerjasama
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-main mb-3">
                  Sinergi Aset & Rantai Pasok Skala Nasional
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-6">
                  Menghilangkan batas geografis antar-desa. GeraiBUMDes membuka ruang kerjasama antar-pengurus BUMDes untuk saling melengkapi kebutuhan usaha:
                </p>

                <ul className="space-y-3.5 mb-8">
                  <li className="flex items-start gap-3 text-sm text-text-main">
                    <div className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="font-semibold">Sewa Armada Logistik & Traktor:</strong> BUMDes dapat menyewakan armada truk atau alat pertanian yang sedang luang ke desa lain.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-main">
                    <div className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="font-semibold">Pasokan Komoditas Grosir:</strong> Membeli bahan pokok atau produk unggulan langsung dari BUMDes produsen dengan harga grosir resmi.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-main">
                    <div className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Globe className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="font-semibold">Profil Usaha Siap Kemitraan:</strong> Portofolio terverifikasi siap dipresentasikan ke Pemda, BUMN (program CSR/supply chain), dan perbankan.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-main">
                    <div className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="font-semibold">Faktur & Transaksi Tertib:</strong> Tata kelola transaksi B2B terekam secara digital, memudahkan audit dan pelaporan keuangan tahunan BUMDes.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-blue-500/20">
                <Link href="/register">
                  <Button className="w-full sm:w-auto rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white">
                    Daftarkan Unit Usaha BUMDes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Spektrum Unit Usaha yang Dinaungi */}
      <section className="py-14 md:py-24 bg-surface-bg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main">
              Ragam Unit Usaha yang Terintegrasi di GeraiBUMDes
            </h2>
            <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
              Platform kami dirancang fleksibel untuk mendukung segala model unit usaha yang dijalankan BUMDes di seluruh pelosok Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Pariwisata & Ekowisata Unggulan */}
            <Card className="border-border shadow-sm hover:shadow-md transition-all bg-surface">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-text-main mb-2">Destinasi Ekowisata & Desa Wisata</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                  Pengelolaan ekowisata alam, agrowisata sawah/kebun, wisata air & bahari, glamping, homestay desa asri, wahana rekreasi, hingga paket jelajah budaya lokal.
                </p>
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
                  Daya Tarik Wisata Nasional
                </div>
              </CardContent>
            </Card>

            {/* 2. Manufaktur, Seni & Kerajinan Kriya */}
            <Card className="border-border shadow-sm hover:shadow-md transition-all bg-surface">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-text-main mb-2">Kriya Seni, Wastra & Kerajinan</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                  Kain tenun tradisional, batik khas nusantara, kerajinan ukir kayu & kriya bernilai seni tinggi yang menembus pasar ekspor, serta cinderamata budaya desa.
                </p>
                <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg inline-block">
                  Ekonomi Kreatif Berdaya Saing
                </div>
              </CardContent>
            </Card>

            {/* 3. Hilirisasi Kopi & Komoditas Unggulan */}
            <Card className="border-border shadow-sm hover:shadow-md transition-all bg-surface">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-text-main mb-2">Hilirisasi Kopi & Komoditas Unggulan</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                  Pengolahan kopi specialty desa (petik merah sangrai), cokelat olahan, minyak atsiri, madu hutan murni, rempah kemasan premium, serta hasil panen dan perikanan segar.
                </p>
                <div className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg inline-block">
                  Nilai Tambah & Pasar Ekspor
                </div>
              </CardContent>
            </Card>

            {/* 4. Konektivitas & Layanan Digital */}
            <Card className="border-border shadow-sm hover:shadow-md transition-all bg-surface">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                  <Wifi className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-text-main mb-2">Infrastruktur & Internet Desa</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                  Penyediaan jaringan internet desa mandiri (RT/RW Net), penjualan voucher WiFi hotspot murah, loket digital PPOB (listrik, PAMDes, pulsa), dan agen perbankan laku pandai.
                </p>
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg inline-block">
                  Konektivitas Digital Warga
                </div>
              </CardContent>
            </Card>

            {/* 5. Distribusi Energi & Retail */}
            <Card className="border-border shadow-sm hover:shadow-md transition-all bg-surface">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-text-main mb-2">Distribusi Energi & Toko Grosir</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                  Pangkalan resmi gas LPG 3kg / 12kg Pertamina, depo air minum isi ulang higienis, toko sembako grosir desa, serta penyediaan pupuk bersubsidi dan pakan ternak.
                </p>
                <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg inline-block">
                  Ketahanan Energi & Pangan
                </div>
              </CardContent>
            </Card>

            {/* 6. Persewaan Aset, Armada Logistik & Fasilitas Warga */}
            <Card className="border-border shadow-sm hover:shadow-md transition-all bg-surface">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-text-main mb-2">Armada Logistik, Aset & Fasilitas Warga</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                  Penyewaan armada truk angkutan barang, mobil pick-up, mesin pertanian modern (traktor & harvester), gedung serbaguna, hingga perlengkapan acara dan tenda warga.
                </p>
                <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg inline-block">
                  Utilisasi Aset Produktif Desa
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. Visi, Misi & Komitmen */}
      <section className="py-14 md:py-20 bg-surface border-t border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="p-8 rounded-3xl bg-primary text-white">
              <div className="text-xs uppercase font-extrabold tracking-widest text-secondary mb-2">Visi Kami</div>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-snug">
                Sentra Ekosistem Kolaborasi & Portofolio BUMDes Terbesar di Indonesia
              </h3>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                Menjadi pilar teknologi terdepan yang mendemokratisasi perdagangan desa, mempertemukan seluruh potensi BUMDes secara adil, dan memastikan kedaulatan ekonomi berakar kokoh di masyarakat desa.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-xs uppercase font-extrabold tracking-widest text-primary">Misi Strategis</div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-main">
                Empat Langkah Konkret untuk Kemandirian Desa
              </h3>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-sm text-text-muted">
                    <strong className="text-text-main">Digitalisasi Aset Desa:</strong> Mendata dan memvalidasi unit usaha BUMDes agar siap beroperasi secara profesional dan akuntabel.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-sm text-text-muted">
                    <strong className="text-text-main">Kemudahan Layanan Warga:</strong> Memberikan akses transaksi praktis bagi masyarakat desa untuk memenuhi kebutuhan harian mereka melalui BUMDes.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-sm text-text-muted">
                    <strong className="text-text-main">Jaringan B2B Antar-Desa:</strong> Membangun koridor perdagangan dan persewaan aset langsung antar-BUMDes se-Nusantara tanpa tengkulak.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <p className="text-sm text-text-muted">
                    <strong className="text-text-main">Pertumbuhan PADes Berkelanjutan:</strong> Mengembalikan margin keuntungan bisnis ke kas desa untuk membiayai kesejahteraan masyarakat setempat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call to Action Banner */}
      <section className="py-14 md:py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            Mari Bersama Memajukan Ekonomi Desa Indonesia
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
            Apakah Anda pengurus BUMDes yang ingin memperluas jangkauan usaha, atau warga desa yang ingin memanfaatkan layanan BUMDes lokal? Bergabunglah sekarang juga.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="rounded-xl font-bold bg-cta hover:brightness-95 text-white shadow-lg px-8">
                Daftar Akun Sekarang <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/bumdes">
              <Button variant="outline" size="lg" className="rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border-white/30 px-8">
                Lihat Direktori BUMDes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
