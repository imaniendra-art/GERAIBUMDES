import { Card, CardContent } from "@/components/ui/Card";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import Product from "@/models/Product";
import Order from "@/models/Order";
import AdminLog from "@/models/AdminLog";
import User from "@/models/User";
import Link from "next/link";
import { Users, Store as StoreIcon, Package, CheckCircle, ShoppingBag, Banknote, FileText, LogOut, Activity, AlertCircle, ArrowRight, Clock, ShieldCheck, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboardPage() {
  await dbConnect();
  
  const totalBumdes = await BumdesProfile.countDocuments();
  const pendingBumdes = await BumdesProfile.countDocuments({ verificationStatus: "PENDING_VERIFICATION" });
  const verifiedBumdes = await BumdesProfile.countDocuments({ verificationStatus: "VERIFIED" });
  
  const totalStores = await Store.countDocuments();
  const activeStores = await Store.countDocuments({ status: "ACTIVE" });
  
  const totalProducts = await Product.countDocuments();
  const pendingProducts = await Product.countDocuments({ status: "WAITING_APPROVAL" });
  const activeProducts = await Product.countDocuments({ status: "ACTIVE" });
  
  const totalOrders = await Order.countDocuments();
  const completedOrders = await Order.countDocuments({ status: "COMPLETED" });
  
  const orders = await Order.find({ status: "COMPLETED" });
  const totalGmv = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const recentLogs = await AdminLog.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({ path: "adminId", model: User, select: "name email" })
    .lean();

  const getLogIcon = (action: string) => {
    if (action.includes("BUMDES")) return <StoreIcon className="h-4 w-4" />;
    if (action.includes("PRODUK")) return <Package className="h-4 w-4" />;
    if (action.includes("PESANAN")) return <ShoppingCart className="h-4 w-4" />;
    if (action.includes("ADMIN") || action.includes("LOGIN")) return <ShieldCheck className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getLogColor = (action: string) => {
    if (action.includes("VERIFY") || action.includes("APPROVE") || action === "LOGIN") return "bg-success/10 text-success-dark border-success/20";
    if (action.includes("REJECT") || action.includes("DELETE")) return "bg-danger/10 text-danger border-danger/20";
    return "bg-primary/10 text-primary-dark border-primary/20";
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Command Center</h1>
          <p className="text-text-muted mt-1 text-sm sm:text-base">Pusat kendali operasional platform GeraiBUMDes.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/laporan/transaksi" className="hidden sm:block">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Laporan Transaksi
            </Button>
          </Link>
          <Link href="/admin/akun?tab=admin" className="hidden sm:block">
            <Button variant="outline" className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5">
              <Users className="h-4 w-4" /> Kelola Administrator
            </Button>
          </Link>
          <form action="/api/auth/logout" method="POST" className="w-full sm:w-auto">
            <Button type="submit" variant="outline" className="w-full sm:w-auto text-danger border-danger/30 hover:bg-danger/5">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Admin Menu */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        <Link href="/admin/bumdes" className="flex flex-col items-center justify-center bg-surface p-4 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors relative">
          <StoreIcon className="h-6 w-6 text-primary mb-2" />
          <span className="text-xs font-bold text-center">BUMDes</span>
          {pendingBumdes > 0 && (
            <span className="absolute top-2 right-2 bg-danger text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
              {pendingBumdes}
            </span>
          )}
        </Link>
        <Link href="/admin/produk" className="flex flex-col items-center justify-center bg-surface p-4 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors relative">
          <Package className="h-6 w-6 text-primary mb-2" />
          <span className="text-xs font-bold text-center">Produk</span>
          {pendingProducts > 0 && (
            <span className="absolute top-2 right-2 bg-danger text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
              {pendingProducts}
            </span>
          )}
        </Link>
        <Link href="/admin/pesanan" className="flex flex-col items-center justify-center bg-surface p-4 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
          <ShoppingBag className="h-6 w-6 text-primary mb-2" />
          <span className="text-xs font-bold text-center">Pesanan</span>
        </Link>
        <Link href="/admin/akun?tab=admin" className="flex flex-col items-center justify-center bg-surface p-4 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
          <Users className="h-6 w-6 text-primary mb-2" />
          <span className="text-xs font-bold text-center">Admin</span>
        </Link>
      </div>
      
      {/* SECTION: PRIORITAS HARI INI */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning-dark" /> Prioritas Hari Ini
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${pendingBumdes > 0 ? "border-l-warning" : "border-l-success"}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full mt-1 ${pendingBumdes > 0 ? "bg-warning/10 text-warning-dark" : "bg-success/10 text-success-dark"}`}>
                  <StoreIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{pendingBumdes} BUMDes Menunggu Verifikasi</h3>
                  <p className="text-sm text-text-muted mt-1">
                    {pendingBumdes > 0 
                      ? "Harap segera periksa dan verifikasi pendaftaran baru." 
                      : "Semua pendaftaran BUMDes sudah diperiksa."}
                  </p>
                </div>
              </div>
              {pendingBumdes > 0 && (
                <Link href="/admin/bumdes?status=PENDING_VERIFICATION">
                  <Button className="bg-warning hover:bg-warning-dark text-white shadow-sm flex items-center gap-2">
                    Review <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${pendingProducts > 0 ? "border-l-warning" : "border-l-success"}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full mt-1 ${pendingProducts > 0 ? "bg-warning/10 text-warning-dark" : "bg-success/10 text-success-dark"}`}>
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{pendingProducts} Produk Menunggu Verifikasi</h3>
                  <p className="text-sm text-text-muted mt-1">
                    {pendingProducts > 0 
                      ? "Produk ini tidak akan tampil sebelum disetujui." 
                      : "Semua produk baru sudah diproses."}
                  </p>
                </div>
              </div>
              {pendingProducts > 0 && (
                <Link href="/admin/produk?status=WAITING_APPROVAL">
                  <Button className="bg-warning hover:bg-warning-dark text-white shadow-sm flex items-center gap-2">
                    Review <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION: RINGKASAN PLATFORM */}
      <section>
        <h2 className="text-lg font-bold mb-4">Ringkasan Platform</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-text-muted mb-1 flex items-center gap-2">
                <StoreIcon className="h-4 w-4" /> Total BUMDes
              </p>
              <h3 className="text-3xl font-bold">{totalBumdes}</h3>
              <p className="text-xs text-success-dark mt-2 font-medium">{verifiedBumdes} Aktif Beroperasi</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-text-muted mb-1 flex items-center gap-2">
                <Package className="h-4 w-4" /> Total Produk
              </p>
              <h3 className="text-3xl font-bold">{totalProducts}</h3>
              <p className="text-xs text-success-dark mt-2 font-medium">{activeProducts} Sedang Dijual</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-text-muted mb-1 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Total Pesanan
              </p>
              <h3 className="text-3xl font-bold">{totalOrders}</h3>
              <p className="text-xs text-success-dark mt-2 font-medium">{completedOrders} Selesai</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-text-muted mb-1 flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Toko
              </p>
              <h3 className="text-3xl font-bold">{totalStores}</h3>
              <p className="text-xs text-success-dark mt-2 font-medium">{activeStores} Toko Aktif</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION: TIMELINE AKTIVITAS */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Timeline Aktivitas Platform
            </h2>
            <Link href="/admin/laporan/aktivitas" className="text-sm text-primary hover:underline font-medium">
              Lihat Semua
            </Link>
          </div>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {recentLogs.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {recentLogs.map((log: any, index: number) => (
                    <div key={log._id.toString()} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-surface-bg z-10 text-text-muted group-hover:text-primary transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
                        {getLogIcon(log.action)}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-surface shadow-sm group-hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getLogColor(log.action)}`}>
                            {log.action}
                          </span>
                          <time className="text-xs text-text-muted flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </time>
                        </div>
                        <p className="font-semibold text-sm mt-2">{log.target || "System"}</p>
                        <p className="text-xs text-text-muted mt-1">{log.details}</p>
                        <p className="text-[10px] text-text-muted mt-2 border-t border-border/50 pt-2 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Oleh: {log.adminId?.name || log.adminId?.email || "Admin"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 bg-surface-bg rounded-full flex items-center justify-center mb-4">
                    <Activity className="h-8 w-8 text-text-muted" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Belum Ada Aktivitas</h3>
                  <p className="text-sm text-text-muted max-w-sm">
                    Timeline aktivitas akan muncul di sini setelah platform mulai digunakan dan admin melakukan aksi.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* SECTION: STATISTIK & INSIGHT */}
        <section className="space-y-8">
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-success" /> Performa Bisnis
            </h2>
            <Card className="bg-earth text-surface overflow-hidden relative shadow-sm border-0">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                <Banknote className="h-48 w-48 -mr-10 -mt-10" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-sm font-medium opacity-90 uppercase tracking-wider mb-2">Total GMV Platform</p>
                <h2 className="text-4xl font-bold">Rp {totalGmv.toLocaleString("id-ID")}</h2>
                <div className="mt-6 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-success" /> 
                    <span>Total nilai dari <strong>{completedOrders}</strong> transaksi selesai.</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h2 className="text-lg font-bold mb-4">Aksi Cepat</h2>
            <Card className="shadow-sm">
              <CardContent className="p-2 space-y-1">
                <Link href="/admin/bumdes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-bg transition-colors">
                  <div className="p-2 bg-primary/10 text-primary-dark rounded-md"><StoreIcon className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Kelola BUMDes</p>
                    <p className="text-xs text-text-muted">Lihat dan verifikasi profil</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted" />
                </Link>
                <Link href="/admin/produk" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-bg transition-colors">
                  <div className="p-2 bg-primary/10 text-primary-dark rounded-md"><Package className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Kelola Produk</p>
                    <p className="text-xs text-text-muted">Review produk baru</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted" />
                </Link>
                <Link href="/admin/laporan/transaksi" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-bg transition-colors">
                  <div className="p-2 bg-primary/10 text-primary-dark rounded-md"><FileText className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Laporan Transaksi</p>
                    <p className="text-xs text-text-muted">Export data penjualan</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
}
