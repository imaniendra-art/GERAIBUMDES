import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, Settings, Users, LogOut, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/formatters";

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
            <p className="text-text-muted mb-6">Kelola pesanan dan aktivitas belanja Anda di BUMDesMart.</p>
            
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
      return (
        <div className="min-h-screen bg-surface-bg p-8 flex justify-center items-center">
          <Card className="max-w-lg text-center border-danger">
            <CardContent className="p-8">
              <AlertTriangle className="h-16 w-16 text-danger mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-danger">Pendaftaran Ditolak</h2>
              <p className="text-text-muted mb-2">
                Mohon maaf, pendaftaran BUMDes Anda ditolak.
              </p>
              {profile.rejectionReason && (
                <p className="text-sm font-medium bg-danger/10 text-danger p-3 rounded mb-6">
                  Alasan: {profile.rejectionReason}
                </p>
              )}
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="outline">Keluar</Button>
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
    
    let totalOrders = 0;
    let waitingPaymentOrders = 0;
    let newOrders = 0;
    let totalSales = 0;
    let completedOrdersCount = 0;

    if (store) {
      const products = await ProductModel.find({ storeId: store._id });
      totalProducts = products.length;
      activeProducts = products.filter(p => p.status === "ACTIVE").length;
      waitingProducts = products.filter(p => p.status === "WAITING_APPROVAL").length;
      inactiveProducts = products.filter(p => ["INACTIVE", "REJECTED", "DRAFT"].includes(p.status)).length;
      
      const orders = await OrderModel.find({ sellerStoreId: store._id });
      totalOrders = orders.length;
      newOrders = orders.filter(o => o.status === "WAITING_SELLER_CONFIRMATION").length;
      waitingPaymentOrders = orders.filter(o => o.status === "WAITING_PAYMENT" || o.status === "PAYMENT_REVIEW").length;
      
      const completedOrders = orders.filter(o => o.status === "COMPLETED");
      totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
      completedOrdersCount = completedOrders.length;
    }

    return (
      <div className="flex min-h-screen bg-surface-bg">
        {/* Sidebar */}
        <aside className="w-64 bg-primary-dark text-surface hidden md:flex flex-col">
          <div className="p-4 border-b border-surface/10">
            <h2 className="text-lg font-bold">Dashboard BUMDes</h2>
            <p className="text-xs text-surface/70 mt-1">{profile.name}</p>
          </div>
          <nav className="p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center bg-surface/20 text-surface px-3 py-2.5 rounded-md text-sm font-semibold mb-1">
              <LayoutDashboard className="h-5 w-5 mr-3" /> MENU UTAMA
            </Link>
            <Link href="/dashboard/toko/edit" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
              <Settings className="h-5 w-5 mr-3" /> Profil BUMDes
            </Link>
            <Link href="/dashboard/produk" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
              <Package className="h-5 w-5 mr-3" /> Produk Saya
            </Link>
            <Link href="/dashboard/pesanan" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
              <ShoppingBag className="h-5 w-5 mr-3" /> Pesanan Masuk
            </Link>
            <Link href="/dashboard/laporan/penjualan" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
              <Package className="h-5 w-5 mr-3" /> Laporan Penjualan
            </Link>
            <div className="my-2 border-t border-surface/10" />
            <Link href="/pesanan" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
              <Users className="h-5 w-5 mr-3" /> Pembelian Saya
            </Link>
            <Link href="/" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mt-4 text-surface/80">
              <LayoutDashboard className="h-5 w-5 mr-3" /> Kembali ke Marketplace
            </Link>
          </nav>
          <div className="p-4 border-t border-surface/10">
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="flex items-center hover:text-danger px-3 py-2 text-sm font-medium transition-colors w-full">
                <LogOut className="h-5 w-5 mr-3" /> Keluar
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold text-text-main">Ringkasan BUMDes</h1>
            <div className="flex gap-2">
              <Link href="/dashboard/laporan/penjualan" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">Lihat Laporan</Button>
              </Link>
              <Link href="/dashboard/produk/tambah" className="w-full sm:w-auto">
                <Button className="w-full">Tambah Produk</Button>
              </Link>
            </div>
          </div>

          {/* Mobile Dashboard Menu */}
          <div className="md:hidden grid grid-cols-2 gap-3 mb-8">
            <Link href="/dashboard/toko/edit" className="flex flex-col items-center justify-center bg-surface p-4 rounded-lg border border-border shadow-sm hover:bg-surface-bg transition-colors">
              <Settings className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center">Profil BUMDes</span>
            </Link>
            <Link href="/dashboard/produk" className="flex flex-col items-center justify-center bg-surface p-4 rounded-lg border border-border shadow-sm hover:bg-surface-bg transition-colors">
              <Package className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center">Produk Saya</span>
            </Link>
            <Link href="/dashboard/pesanan" className="flex flex-col items-center justify-center bg-surface p-4 rounded-lg border border-border shadow-sm hover:bg-surface-bg transition-colors">
              <ShoppingBag className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center text-primary-dark">
                Pesanan Masuk {newOrders > 0 && `(${newOrders})`}
              </span>
            </Link>
            <Link href="/pesanan" className="flex flex-col items-center justify-center bg-surface p-4 rounded-lg border border-border shadow-sm hover:bg-surface-bg transition-colors">
              <Users className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-bold text-center">Pembelian Saya</span>
            </Link>
            <div className="col-span-2 mt-2">
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="w-full flex items-center justify-center bg-danger/10 text-danger p-4 rounded-lg border border-danger/20 shadow-sm hover:bg-danger/20 transition-colors">
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="text-sm font-bold">Keluar (Logout)</span>
                </button>
              </form>
            </div>
          </div>

          {store && !store.bankAccount?.bankAccountNumber && (
            <div className="bg-error/10 border-2 border-error text-error-dark p-5 rounded-lg flex items-start mb-8 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-[pulse_2s_ease-in-out_infinite]">
              <div className="bg-error/20 rounded-full p-2 mr-4 flex-shrink-0 mt-0.5">
                <span className="h-4 w-4 block bg-error rounded-full animate-ping" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">⚠️ Data Rekening Belum Lengkap!</h4>
                <p className="text-sm font-medium">Lengkapi data rekening BUMDes agar pembeli dapat melakukan pembayaran manual dengan lancar.</p>
                <Link href="/dashboard/toko/edit" className="text-sm font-extrabold bg-white text-black border-2 border-black px-4 py-2 rounded mt-3 inline-block hover:bg-gray-100 transition-colors shadow-sm">
                  Lengkapi Rekening Sekarang
                </Link>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-text-muted font-medium">Pesanan Baru</p>
                <p className="text-3xl font-bold text-text-main mt-2">{newOrders}</p>
                <p className="text-xs text-text-muted mt-2">Menunggu ongkir</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-text-muted font-medium">Menunggu Pembayaran / Review</p>
                <p className="text-3xl font-bold text-warning mt-2">{waitingPaymentOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-text-muted font-medium">Produk Aktif</p>
                <p className="text-3xl font-bold text-success mt-2">{activeProducts}</p>
                <p className="text-xs text-text-muted mt-2">Dari total {totalProducts} produk</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-text-muted font-medium">Menunggu Verifikasi</p>
                <p className="text-3xl font-bold text-warning mt-2">{waitingProducts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-text-muted font-medium">Draf / Nonaktif / Ditolak</p>
                <p className="text-3xl font-bold text-text-muted mt-2">{inactiveProducts}</p>
              </CardContent>
            </Card>
            <Card className="col-span-1 sm:col-span-2 bg-success/10 border-success/20">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-success-dark">Total Penjualan Selesai</p>
                <p className="text-3xl font-bold text-success-dark mt-2">{formatCurrency(totalSales)}</p>
                <p className="text-xs text-success/80 mt-2">Dari {completedOrdersCount} pesanan selesai</p>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-text-muted font-medium">Total Pesanan</p>
                  <p className="text-3xl font-bold text-success mt-2">{totalOrders}</p>
                </div>
                <Link href="/dashboard/pesanan" className="mt-4 block">
                  <Button variant="outline" size="sm" className="w-full">Lihat Pesanan Masuk</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return <div>Unknown Role</div>;
}
