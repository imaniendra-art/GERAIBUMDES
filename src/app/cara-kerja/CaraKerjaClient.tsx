"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Truck,
  CreditCard,
  Building2,
  Package,
  Sparkles,
  ChevronDown,
  Users,
  Search,
  Receipt,
  HeartHandshake
} from "lucide-react";

type TabType = "bumdes" | "buyer" | "faq";

export default function CaraKerjaClient() {
  const [activeTab, setActiveTab] = useState<TabType>("bumdes");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-surface-bg pb-20">
      {/* Hero Section */}
      <section className="bg-surface border-b border-border py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs md:text-sm tracking-wide uppercase mb-4 md:mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Panduan & Cara Kerja</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight mb-4 md:mb-6 max-w-4xl mx-auto leading-tight">
            Satu Platform Kolaborasi <br className="hidden sm:inline" />
            <span className="text-primary">Ekonomi Desa Indonesia</span>
          </h1>

          <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10">
            Pelajari alur mudah menggunakan GeraiBUMDes—mulai dari mendigitalkan unit usaha desa, menjangkau pasar nasional, hingga bertransaksi aman bagi pembeli dan mitra B2B.
          </p>

          {/* Interactive Tab Switcher */}
          <div className="inline-flex p-1.5 bg-surface-bg border border-border rounded-2xl max-w-full overflow-x-auto shadow-sm">
            <button
              onClick={() => setActiveTab("bumdes")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
                activeTab === "bumdes"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-main hover:bg-surface"
              }`}
            >
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Untuk Mitra BUMDes</span>
            </button>

            <button
              onClick={() => setActiveTab("buyer")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
                activeTab === "buyer"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-main hover:bg-surface"
              }`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Untuk Pembeli & Mitra</span>
            </button>

            <button
              onClick={() => setActiveTab("faq")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
                activeTab === "faq"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-main hover:bg-surface"
              }`}
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Pertanyaan Umum (FAQ)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-16">

        {/* TAB 1: PANDUAN UNTUK BUMDES */}
        {activeTab === "bumdes" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-main mb-3">
                Langkah Mudah Membuka Gerai & Unit Usaha Desa
              </h2>
              <p className="text-sm sm:text-base text-text-muted">
                Ikuti 5 langkah sederhana berikut untuk mentransformasi potensi desa Anda menjadi etalase komersial berdaya saing tinggi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Step 1 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  1
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Registrasi Akun BUMDes</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                  Daftarkan BUMDes dengan mengisi nama desa, data penanggung jawab, serta mengunggah SK Pendirian Desa atau legalitas resmi.
                </p>
                <div className="p-3 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted space-y-1.5">
                  <div className="font-semibold text-text-main flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    Dokumen Pendukung:
                  </div>
                  <div>• SK Kepala Desa / Kemenkumham</div>
                  <div>• Kontak WhatsApp pengurus aktif</div>
                  <div>• Rekening resmi Kas Desa / BUMDes</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  2
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Store className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Lengkapi Profil Gerai</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                  Tambahkan logo desa, deskripsi potensi unggulan, lokasi peta desa, dan jam operasional untuk membangun kepercayaan mitra.
                </p>
                <div className="p-3 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted space-y-1.5">
                  <div className="font-semibold text-text-main flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    Kunci Kredibilitas:
                  </div>
                  <div>• Ceritakan keunikan produk desa</div>
                  <div>• Pasang foto profil toko yang representatif</div>
                  <div>• Pastikan titik alamat desa tepat</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  3
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Unggah Produk & Komoditas</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                  Upload katalog hasil bumi, olahan UMKM, kerajinan, hingga jasa sewa alat desa dengan foto jernih dan harga transparan.
                </p>
                <div className="p-3 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted space-y-1.5">
                  <div className="font-semibold text-text-main flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    Dukungan Fitur:
                  </div>
                  <div>• Harga satuan (eceran) & diskon grosir</div>
                  <div>• Input berat & dimensi untuk ekspedisi</div>
                  <div>• Kelola stok otomatis saat ada pesanan</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  4
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Proses & Kirim Pesanan</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                  Dapatkan notifikasi real-time saat pembeli memesan. Konfirmasi pesanan, cetak label/invoice pengiriman, lalu serahkan ke kurir.
                </p>
                <div className="p-3 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted space-y-1.5">
                  <div className="font-semibold text-text-main flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    Manajemen Pengiriman:
                  </div>
                  <div>• Notifikasi pesanan masuk otomatis</div>
                  <div>• Label pengiriman praktis sekali klik</div>
                  <div>• Input nomor resi untuk pelacakan pembeli</div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group md:col-span-2 lg:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  5
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Penerimaan Dana & Laporan PADes</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4">
                  Dana penjualan yang aman akan langsung diteruskan ke rekening BUMDes Anda setelah pesanan dikonfirmasi selesai. Seluruh transaksi tercatat otomatis untuk mempermudah laporan pertanggungjawaban kas desa.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>Pencairan dana aman ke rekening resmi desa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span>Rekap pembukuan & laporan otomatis</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Action for BUMDes */}
            <div className="mt-10 p-6 sm:p-8 bg-primary/[0.04] border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-bold text-text-main mb-1">Sudah Siap Membawa Potensi Desa ke Pasar Nasional?</h4>
                <p className="text-sm text-text-muted">Pendaftaran gratis tanpa biaya bulanan. Proses verifikasi mudah dan terpandu.</p>
              </div>
              <Link
                href="/register"
                className="px-6 py-3 bg-cta text-white font-bold rounded-xl shadow-sm hover:brightness-95 transition-all text-sm whitespace-nowrap shrink-0"
              >
                Daftarkan BUMDes Sekarang
              </Link>
            </div>
          </div>
        )}

        {/* TAB 2: PANDUAN UNTUK PEMBELI & MITRA */}
        {activeTab === "buyer" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-main mb-3">
                Cara Berbelanja & Bermitra Komoditas Desa
              </h2>
              <p className="text-sm sm:text-base text-text-muted">
                Mudah, aman, dan berdampak nyata bagi penguatan ekonomi desa di seluruh wilayah Indonesia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Step 1 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  1
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Search className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Cari Produk atau Desa</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                  Temukan hasil panen segar, komoditas unggulan, atau kerajinan khas desa melalui kolom pencarian, kategori produk, atau direktori mitra BUMDes.
                </p>
                <div className="p-3 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted space-y-1">
                  <div>• Filter berdasarkan provinsi/kabupaten</div>
                  <div>• Temukan BUMDes terverifikasi terdekat</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  2
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Pilih Retail atau Grosir</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                  Pesan satuan untuk konsumsi harian, atau manfaatkan pemesanan partai besar (grosir B2B) untuk kebutuhan suplai bisnis, instansi, atau koperasi Anda.
                </p>
                <div className="p-3 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted space-y-1">
                  <div>• Harga bersahabat langsung dari produsen desa</div>
                  <div>• Transparansi ketersediaan stok produk</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  3
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Checkout & Pembayaran Aman</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                  Pilih kurir pengiriman yang diinginkan dan lakukan pembayaran aman via Transfer Bank, QRIS, atau Virtual Account resmi.
                </p>
                <div className="p-3 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted space-y-1">
                  <div>• Sistem escrow: dana ditahan aman sampai barang tiba</div>
                  <div>• Konfirmasi pembayaran otomatis seketika</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  4
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Lacak Perjalanan Paket</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                  Pantau perkembangan pesanan Anda secara transparan dari proses pengemasan oleh BUMDes hingga sampai di alamat tujuan.
                </p>
                <div className="p-3 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted space-y-1">
                  <div>• Nomor resi tercatat otomatis di akun Anda</div>
                  <div>• Notifikasi status pengiriman berkala</div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col group md:col-span-2 lg:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:scale-105 transition-transform">
                  5
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <HeartHandshake className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-text-main">Konfirmasi Terima & Dukung Desa</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4">
                  Saat paket tiba, konfirmasi penerimaan di aplikasi dan berikan ulasan bintang lima. Dukungan Anda sangat berarti bagi para pengelola BUMDes dan petani/pengrajin di desa.
                </p>
                <div className="p-3.5 bg-surface-bg rounded-xl border border-border/80 text-xs text-text-muted flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cta shrink-0" />
                  <span>Setiap rupiah yang Anda belanjakan turut menyumbang pertumbuhan Pendapatan Asli Desa (PADes).</span>
                </div>
              </div>

            </div>

            {/* Quick Action for Buyer */}
            <div className="mt-10 p-6 sm:p-8 bg-primary/[0.04] border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-bold text-text-main mb-1">Ingin Mencari Komoditas Asli Berkualitas?</h4>
                <p className="text-sm text-text-muted">Temukan ribuan komoditas pangan, olahan pangan, kerajinan, dan layanan desa terpercaya.</p>
              </div>
              <Link
                href="/produk"
                className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:brightness-95 transition-all text-sm whitespace-nowrap shrink-0"
              >
                Mulai Belanja Produk Desa
              </Link>
            </div>
          </div>
        )}

        {/* TAB 3: PERTANYAAN UMUM (FAQ) */}
        {activeTab === "faq" && (
          <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-main mb-3">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-sm sm:text-base text-text-muted">
                Jawaban atas pertanyaan umum seputar operasional, legalitas, dan keamanan bertransaksi di GeraiBUMDes.
              </p>
            </div>

            {/* FAQ List */}
            {[
              {
                q: "Apakah pendaftaran BUMDes di GeraiBUMDes dipungut biaya?",
                a: "Sama sekali tidak. Pendaftaran akun BUMDes, pembuatan etalase toko digital, dan katalog produk di GeraiBUMDes 100% gratis tanpa biaya langganan bulanan."
              },
              {
                q: "Apakah BUMDes yang masih berproses sertifikasi Kemenkumham tetap bisa bergabung?",
                a: "Tentu bisa. Anda dapat mendaftarkan BUMDes dengan melampirkan Peraturan Desa (Perdes) pendirian BUMDes atau SK Kepala Desa yang sah sembari proses pendaftaran badan hukum di Kemenkumham berjalan."
              },
              {
                q: "Ke mana dana hasil penjualan produk BUMDes akan dicairkan?",
                a: "Dana penjualan akan langsung disalurkan ke rekening bank resmi atas nama BUMDes atau Rekening Kas Desa yang telah didaftarkan dan diverifikasi oleh tim admin."
              },
              {
                q: "Bagaimana jika ada permintaan pesanan partai besar (B2B) antar-desa?",
                a: "GeraiBUMDes memang dirancang khusus untuk memfasilitasi transaksi B2B antar-desa, instansi pemerintah, dan sektor swasta. Anda dapat langsung melihat kontak resmi atau memanfaatkan fitur pesanan kuantitas besar yang tersedia pada halaman produk."
              },
              {
                q: "Apakah masyarakat umum atau pembeli perorangan bisa berbelanja?",
                a: "Bisa! Platform ini terbuka luas untuk siapapun yang ingin membeli produk asli karya anak desa secara langsung dari tangan pertama petani dan pengrajin desa."
              },
              {
                q: "Bagaimana jika barang yang diterima tidak sesuai atau rusak?",
                a: "Pembeli dilindungi sistem escrow platform. Dana pembayaran baru diteruskan ke penjual setelah barang diterima dan dikonfirmasi baik. Jika terjadi kendala, pembeli dapat mengajukan komplain dengan bukti yang jelas untuk diselesaikan secara adil."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-surface border border-border rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-text-main hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted transition-transform shrink-0 ${
                      openFaq === index ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-text-muted leading-relaxed border-t border-border/50 bg-surface-bg/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Global Bottom CTA Card */}
        <div className="mt-16 sm:mt-24 bg-gradient-to-br from-primary to-primary-dark text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mari Bangkitkan Ekonomi Mandiri Desa
            </h3>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Bergabunglah bersama ribuan BUMDes dan mitra bisnis di seluruh pelosok Indonesia dalam satu jaringan perdagangan yang saling menguatkan.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3.5 bg-cta text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all text-sm sm:text-base"
              >
                Daftarkan BUMDes Anda
              </Link>
              <Link
                href="/produk"
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-primary font-bold rounded-xl shadow-sm hover:bg-surface-bg transition-all text-sm sm:text-base"
              >
                Jelajahi Produk Desa
              </Link>
            </div>
            <div className="pt-4 text-xs text-white/75">
              Ingin mengenal visi misi kami lebih dekat?{" "}
              <Link href="/tentang-kami" className="underline hover:text-white font-semibold">
                Baca Tentang Kami
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
