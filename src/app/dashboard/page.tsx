import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, Settings, Users, LogOut, Clock, AlertTriangle, UserCog, TrendingUp, CheckCircle, PlusCircle, BookOpen, Truck, BarChart3, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/formatters";
import { BumdesSidebarNav } from "@/components/admin/BumdesSidebarNav";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";

// Role-based views
export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "SUPER_ADMIN" || session.role === "PLATFORM_ADMIN") {
    redirect("/admin");
  }

  await dbConnect();

  if (session.role === "CUSTOMER") {
    return (
      <div className="min-h-screen bg-surface-bg p-4 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard Pembeli</h1>
          <form action="/api/auth/logout" method="POST" className="hidden sm:block">
            <Button type="submit" variant="outline" className="text-danger hover:bg-danger/10 border-danger/20">Keluar</Button>
          </form>
        </div>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2">Selamat datang, {session.name || session.email}!</h2>
            <p className="text-text-muted mb-6">Kelola pesanan dan aktivitas belanja Anda di GeraiBumdes.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Link href="/pesanan" className="w-full">
                <Button className="w-full flex items-center justify-center h-12 text-sm sm:text-base">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Lihat Pesanan Saya
                </Button>
              </Link>
              <Link href="/produk" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center h-12 text-sm sm:text-base">
                  <Package className="mr-2 h-5 w-5" /> Mulai Belanja
                </Button>
              </Link>
            </div>

            <div className="md:hidden mt-6 border-t border-border pt-6">
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="w-full flex items-center justify-center bg-danger/10 text-danger p-4 rounded-lg border border-danger/20 shadow-sm hover:bg-danger/20 transition-colors">
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="text-sm font-bold">Keluar (Logout)</span>
                </button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.role === "BUMDES_ADMIN") {
    const profile = await BumdesProfile.findOne({ userId: session.userId });

    if (!profile) {
      return (
        <div className="p-8 text-danger flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-xl font-bold mb-4">Profil BUMDes tidak ditemukan.</h2>
          <p className="mb-6 text-text-main">Hal ini mungkin terjadi jika database baru saja diperbarui. Silakan keluar dan masuk kembali.</p>
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="outline">Keluar dari Akun</Button>
          </form>
        </div>
      );
    }

    if (profile.verificationStatus === "PENDING_VERIFICATION") {
      return (
        <div className="min-h-screen bg-surface-bg p-8 flex justify-center items-center">
          <Card className="max-w-lg text-center">
            <CardContent className="p-8">
              <Clock className="h-16 w-16 text-warning mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Menunggu Verifikasi Admin</h2>
              <p className="text-text-muted mb-6">
                Data pendaftaran BUMDes Anda ({profile.name}) sedang ditinjau oleh tim kami. Anda akan dapat menggunakan fitur BUMDes setelah diverifikasi.
              </p>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="outline">Keluar</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (profile.verificationStatus === "REJECTED") {
      redirect("/bumdes/revisi-pendaftaran");
    }

    if (profile.verificationStatus === "SUSPENDED") {
      return (
        <div className="min-h-screen bg-surface-bg p-8 flex justify-center items-center">
          <Card className="max-w-lg text-center border-amber-300 shadow-md">
            <CardContent className="p-8">
              <AlertTriangle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-text-main">Akun BUMDes Ditangguhkan</h2>
              <p className="text-text-muted mb-4 text-sm leading-relaxed">
                Aktivitas dan produk BUMDes <strong>{profile.name}</strong> saat ini sedang ditangguhkan sementara oleh Admin Platform.
              </p>
              {profile.suspensionReason && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-md text-xs mb-6 text-left">
                  <span className="font-semibold block mb-1">Catatan / Alasan Penangguhan:</span>
                  <p className="italic">{profile.suspensionReason}</p>
                </div>
              )}
              <p className="text-xs text-text-muted mb-6">
                Silakan hubungi administrator platform GeraiBUMDes apabila Anda memerlukan informasi pemulihan status akun.
              </p>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="outline">Keluar dari Akun</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }

    // VERIFIED STATUS
    const StoreModel = (await import("@/models/Store")).default;
    const ProductModel = (await import("@/models/Product")).default;
    const OrderModel = (await import("@/models/Order")).default;
    
    const store = await StoreModel.findOne({ bumdesId: profile._id });
    
    let totalProducts = 0;
    let activeProducts = 0;
    let waitingProducts = 0;
    let inactiveProducts = 0;
    let rejectedProducts = 0;
    
    let totalOrders = 0;
    let newOrders = 0;
    let waitingPaymentOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let totalSales = 0;
    let completedOrdersCount = 0;

    if (store) {
      const products = await ProductModel.find({ storeId: store._id });
      totalProducts = products.length;
      activeProducts = products.filter(p => p.status === "ACTIVE").length;
      waitingProducts = products.filter(p => p.status === "WAITING_APPROVAL").length;
      inactiveProducts = products.filter(p => ["INACTIVE", "REJECTED", "DRAFT"].includes(p.status)).length;
      rejectedProducts = products.filter(p => p.status === "REJECTED").length;
      
      const orders = await OrderModel.find({ sellerStoreId: store._id });
      totalOrders = orders.length;
      newOrders = orders.filter(o => o.status === "WAITING_SELLER_CONFIRMATION").length;
      waitingPaymentOrders = orders.filter(o => o.status === "WAITING_PAYMENT" || o.status === "PAYMENT_REVIEW").length;
      processingOrders = orders.filter(o => o.status === "PROCESSING").length;
      shippedOrders = orders.filter(o => o.status === "SHIPPED_MANUAL" || o.status === "READY_TO_PICKUP").length;
      
      const completedOrders = orders.filter(o => o.status === "COMPLETED");
      totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
      completedOrdersCount = completedOrders.length;
    }

    // Onboarding Status Computation
    const isProfileComplete = !!(profile.name && store?.logoUrl && store?.description && store?.address && store?.phoneNumber);
    const isBankAccountComplete = !!store?.bankAccount?.bankAccountNumber;
    const hasFirstProduct = totalProducts > 0;
    const isFirstProductApproved = activeProducts > 0;
    
    const onboardingSteps = [
      true, // Akun verified
      isProfileComplete,
      isBankAccountComplete,
      hasFirstProduct,
      isFirstProductApproved
    ];
    
    const completedStepsCount = onboardingSteps.filter(Boolean).length;
    const progressPercentage = (completedStepsCount / onboardingSteps.length) * 100;

    return (
      <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight mb-1">Ringkasan BUMDes</h1>
              <p className="text-lg text-text-main font-medium">Selamat datang kembali, {profile.name} 👋</p>
              <p className="text-text-muted mt-1">Pantau penjualan, produk, dan aktivitas tokomu hari ini.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              {totalProducts === 0 ? (
                <>
                  <Link href="/dashboard/toko/edit" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">Lengkapi Profil</Button>
                  </Link>
                  <Link href="/dashboard/produk/tambah" className="w-full sm:w-auto">
                    <Button className="w-full shadow-sm">Tambahkan Produk Pertama</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard/laporan/penjualan" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">Lihat Laporan</Button>
                  </Link>
                  <Link href="/dashboard/produk/tambah" className="w-full sm:w-auto">
                    <Button className="w-full shadow-sm">Tambah Produk</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Dashboard Menu */}
          <div className="md:hidden grid grid-cols-2 gap-3 mb-8">
            <Link href="/dashboard/pesanan" className="flex flex-col items-center justify-center bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md hover:bg-surface-bg transition-all duration-200 relative">
              <ShoppingBag className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center text-text-main">
                Pesanan Masuk
              </span>
              {newOrders > 0 && (
                <span className="absolute top-2 right-2 bg-danger text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                  {newOrders}
                </span>
              )}
            </Link>

            <Link href="/dashboard/produk" className="flex flex-col items-center justify-center bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md hover:bg-surface-bg transition-all duration-200">
              <Package className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center text-text-main">Produk Saya</span>
            </Link>

            <Link href="/dashboard/laporan/penjualan" className="flex flex-col items-center justify-center bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md hover:bg-surface-bg transition-all duration-200">
              <BarChart3 className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center text-text-main">Laporan Penjualan</span>
            </Link>

            <Link href="/dashboard/pembelian" className="flex flex-col items-center justify-center bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md hover:bg-surface-bg transition-all duration-200">
              <ShoppingCart className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center text-text-main">Pembelian B2B</span>
            </Link>

            <Link href="/dashboard/toko/edit" className="flex flex-col items-center justify-center bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md hover:bg-surface-bg transition-all duration-200">
              <Settings className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center text-text-main">Profil BUMDes</span>
            </Link>

            <Link href="/dashboard/pengaturan" className="flex flex-col items-center justify-center bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md hover:bg-surface-bg transition-all duration-200">
              <UserCog className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center text-text-main">Pengaturan Akun</span>
            </Link>

            <div className="col-span-2 mt-1">
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="w-full flex items-center justify-center bg-danger/10 text-danger p-3.5 rounded-xl border border-danger/20 shadow-sm hover:bg-danger/20 transition-all duration-200">
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="text-sm font-bold">Keluar (Logout)</span>
                </button>
              </form>
            </div>
          </div>

          {store && !store.bankAccount?.bankAccountNumber && (
            <div className="bg-warning/10 border border-warning/20 px-6 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between mb-8 shadow-sm h-auto sm:h-[72px] transition-all duration-200">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="bg-warning/20 p-2.5 rounded-xl mr-4 flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-warning-dark" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-text-main leading-tight flex items-center gap-2">
                    Data Rekening Belum Lengkap
                    <span className="bg-warning/20 text-warning-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                      Langkah {completedStepsCount + 1} dari 5
                    </span>
                  </h4>
                  <p className="text-sm text-text-muted mt-0.5">Lengkapi profil perbankan Anda untuk menerima pembayaran.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <span className="bg-warning/20 text-warning-dark text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider inline-block sm:hidden text-center w-max mb-1">
                  Langkah {completedStepsCount + 1} dari 5
                </span>
                <Link href="/dashboard/toko/edit" className="flex-shrink-0 w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-warning/30 text-warning-dark hover:bg-warning/10 shadow-sm">Lengkapi Sekarang</Button>
                </Link>
              </div>
            </div>
          )}
          {/* Onboarding Flow */}
          <WelcomeCard show={totalProducts === 0} />
          
          {totalProducts === 0 && (
            <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 mb-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-1">Progress Persiapan Toko</h3>
                  <p className="text-sm text-text-muted">
                    {completedStepsCount === onboardingSteps.length 
                      ? "Selamat, toko Anda sudah siap menerima pesanan."
                      : `Tersisa ${onboardingSteps.length - completedStepsCount} langkah lagi sebelum toko Anda siap menerima pesanan.`
                    }
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                  <div className="text-2xl font-black text-primary mb-1">{Math.round(progressPercentage)}%</div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-widest">Langkah {completedStepsCount} dari 5</div>
                </div>
              </div>
              
              <div className="w-full bg-surface-bg rounded-full h-3 mb-8 overflow-hidden border border-border">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 bg-success/20 text-success-dark`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold text-text-main`}>Akun diverifikasi</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${isProfileComplete ? "bg-success/20 text-success-dark" : "bg-surface-bg border border-border text-text-muted"}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isProfileComplete ? "text-text-main" : "text-text-muted"}`}>Profil lengkap</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${isBankAccountComplete ? "bg-success/20 text-success-dark" : "bg-surface-bg border border-border text-text-muted"}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isBankAccountComplete ? "text-text-main" : "text-text-muted"}`}>Data rekening</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${hasFirstProduct ? "bg-success/20 text-success-dark" : "bg-surface-bg border border-border text-text-muted"}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${hasFirstProduct ? "text-text-main" : "text-text-muted"}`}>Produk pertama</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${isFirstProductApproved ? "bg-success/20 text-success-dark" : "bg-surface-bg border border-border text-text-muted"}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isFirstProductApproved ? "text-text-main" : "text-text-muted"}`}>Produk disetujui</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {totalProducts === 0 && (
            <div className="bg-surface border border-dashed border-border rounded-3xl p-16 text-center shadow-sm mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-main mb-3 tracking-tight">Belum ada produk</h3>
              <p className="text-text-muted mb-8 max-w-md mx-auto text-base">
                Produk pertama adalah langkah awal agar BUMDes Anda mulai dikenal oleh pembeli. Lengkapi profil, unggah produk terbaik, lalu tunggu proses persetujuan Admin.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/dashboard/produk/tambah">
                  <Button className="w-full sm:w-auto shadow-sm">Tambahkan Produk Pertama</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">Pelajari Panduan</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Stats */}
          {/* Featured Business Card */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-success/5 to-success/10 border border-success/10 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden min-h-[160px] flex items-center">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 w-full relative z-10">
                <div className="flex-1">
                  <p className="text-sm font-bold text-success-dark tracking-wide uppercase mb-2">Total Penjualan</p>
                  <p className="text-5xl sm:text-6xl font-black text-text-main tracking-tight mb-2">{formatCurrency(totalSales)}</p>
                  <p className="text-sm text-text-muted font-medium">
                    Dari <span className="font-bold text-text-main">{completedOrdersCount}</span> transaksi selesai
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-4">
                  <span className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-success-dark border border-success/20 shadow-sm">
                    Hari Ini
                  </span>
                  <div className="h-16 w-16 bg-white/60 rounded-2xl flex items-center justify-center border border-success/20 shadow-sm">
                    <TrendingUp className="w-8 h-8 text-success-dark" />
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-success/10 rounded-full blur-3xl group-hover:bg-success/20 transition-all duration-500"></div>
            </div>
          </div>

          {/* Ringkasan Produk */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-main">Ringkasan Produk</h2>
              {(waitingProducts > 0 || rejectedProducts > 0) && (
                <Link href="/dashboard/produk" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center">
                  Lihat Produk Saya &rarr;
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <Card className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-border bg-surface">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-surface-bg border border-border p-2 rounded-xl">
                        <Package className="w-5 h-5 text-text-muted" />
                      </div>
                      <p className="text-xs sm:text-sm text-text-main font-bold leading-tight">Total Produk</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black text-text-main">{totalProducts}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-success/20 bg-success/5">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-success/20 p-2 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-success-dark" />
                      </div>
                      <p className="text-xs sm:text-sm text-success-dark font-bold leading-tight">Produk Aktif</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black text-success-dark">{activeProducts}</p>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${waitingProducts > 0 ? "border-warning/30 bg-warning/10" : "border-border bg-surface"}`}>
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={waitingProducts > 0 ? "bg-warning/20 p-2 rounded-xl" : "bg-surface-bg border border-border p-2 rounded-xl"}>
                        <Clock className={`w-5 h-5 ${waitingProducts > 0 ? "text-warning-dark" : "text-text-muted"}`} />
                      </div>
                      <p className={`text-xs sm:text-sm font-bold leading-tight ${waitingProducts > 0 ? "text-warning-dark" : "text-text-main"}`}>Menunggu Verifikasi</p>
                    </div>
                  </div>
                  <p className={`text-3xl font-black ${waitingProducts > 0 ? "text-warning-dark" : "text-text-main"}`}>{waitingProducts}</p>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${rejectedProducts > 0 ? "border-danger/30 bg-danger/10" : "border-border bg-surface"}`}>
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={rejectedProducts > 0 ? "bg-danger/20 p-2 rounded-xl" : "bg-surface-bg border border-border p-2 rounded-xl"}>
                        <AlertTriangle className={`w-5 h-5 ${rejectedProducts > 0 ? "text-danger-dark" : "text-text-muted"}`} />
                      </div>
                      <p className={`text-xs sm:text-sm font-bold leading-tight ${rejectedProducts > 0 ? "text-danger-dark" : "text-text-main"}`}>Produk Ditolak</p>
                    </div>
                  </div>
                  <p className={`text-3xl font-black ${rejectedProducts > 0 ? "text-danger-dark" : "text-text-main"}`}>{rejectedProducts}</p>
                </CardContent>
              </Card>
            </div>
            
            {totalProducts === 0 && (
              <p className="text-sm text-text-muted mt-3 italic">
                Mulailah menambahkan produk pertama agar toko Anda dapat ditemukan pembeli.
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-text-main mb-4">Ringkasan Operasional: Hari Ini</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
              <Card className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-primary/20 bg-primary/5">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/20 p-2 rounded-xl">
                        <Package className="w-5 h-5 text-primary-dark" />
                      </div>
                      <p className="text-xs sm:text-sm text-primary-dark font-bold leading-tight">Menunggu Respon</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black text-primary-dark">{newOrders}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-warning/20 bg-warning/5">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-warning/20 p-2 rounded-xl">
                        <Clock className="w-5 h-5 text-warning-dark" />
                      </div>
                      <p className="text-xs sm:text-sm text-warning-dark font-bold leading-tight">Menunggu Pembayaran</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black text-warning-dark">{waitingPaymentOrders}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-info/20 bg-info/5">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-info/20 p-2 rounded-xl">
                        <Settings className="w-5 h-5 text-info-dark" />
                      </div>
                      <p className="text-xs sm:text-sm text-info-dark font-bold leading-tight">Sedang Diproses</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black text-info-dark">{processingOrders}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-earth/20 bg-earth/5">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-earth/20 p-2 rounded-xl">
                        <Truck className="w-5 h-5 text-earth" />
                      </div>
                      <p className="text-xs sm:text-sm text-earth font-bold leading-tight">Siap Dikirim</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black text-earth">{shippedOrders}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-success/20 bg-success/5">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-success/20 p-2 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-success-dark" />
                      </div>
                      <p className="text-xs sm:text-sm text-success-dark font-bold leading-tight">Selesai</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black text-success-dark">{completedOrdersCount}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Empty State or Activity */}
          {totalProducts > 0 && totalOrders === 0 ? (
            <div className="bg-surface border border-dashed border-border rounded-3xl p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-surface-bg rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border shadow-sm hover:scale-105 transition-transform duration-300">
                <ShoppingBag className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-main mb-3 tracking-tight">Belum ada pesanan masuk</h3>
              <p className="text-text-muted mb-8 max-w-md mx-auto text-base">
                Toko Anda belum menerima pesanan. Tambahkan lebih banyak produk berkualitas dan lengkapi deskripsinya untuk menarik pembeli pertama.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/dashboard/produk/tambah">
                  <Button className="w-full sm:w-auto shadow-sm">Tambah Produk Baru</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">Pelajari Panduan Penjualan</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main">Kelola Pesanan Masuk</h3>
                    <p className="text-sm text-text-muted">Anda memiliki {totalOrders} total pesanan.</p>
                  </div>
                </div>
                <Link href="/dashboard/pesanan" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto rounded-xl">Lihat Semua Pesanan</Button>
                </Link>
              </div>
            </div>
          )}
      </div>
    );
  }

  return <div>Unknown Role</div>;
}
