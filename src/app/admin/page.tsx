import { Card, CardContent } from "@/components/ui/Card";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Link from "next/link";
import { Users, Store as StoreIcon, Package, CheckCircle, ShoppingBag, Banknote, FileText, LogOut } from "lucide-react";
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-main">Ringkasan Platform</h1>
        <Link href="/admin/laporan/transaksi" className="hidden sm:block">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Laporan Transaksi
          </Button>
        </Link>
      </div>

      {/* Mobile Admin Menu */}
      <div className="md:hidden grid grid-cols-2 gap-3 mb-8">
        <Link href="/admin/bumdes" className="flex flex-col items-center justify-center bg-surface p-4 rounded-lg border border-border shadow-sm hover:bg-surface-bg transition-colors">
          <StoreIcon className="h-6 w-6 text-primary mb-2" />
          <span className="text-xs font-bold text-center">Verifikasi Toko</span>
        </Link>
        <Link href="/admin/produk" className="flex flex-col items-center justify-center bg-surface p-4 rounded-lg border border-border shadow-sm hover:bg-surface-bg transition-colors">
          <Package className="h-6 w-6 text-primary mb-2" />
          <span className="text-xs font-bold text-center">Verifikasi Produk</span>
        </Link>
        <Link href="/admin/pesanan" className="flex flex-col items-center justify-center bg-surface p-4 rounded-lg border border-border shadow-sm hover:bg-surface-bg transition-colors">
          <ShoppingBag className="h-6 w-6 text-primary mb-2" />
          <span className="text-xs font-bold text-center">Pesanan</span>
        </Link>
        <Link href="/admin/laporan/transaksi" className="flex flex-col items-center justify-center bg-surface p-4 rounded-lg border border-border shadow-sm hover:bg-surface-bg transition-colors">
          <FileText className="h-6 w-6 text-primary mb-2" />
          <span className="text-xs font-bold text-center">Laporan</span>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* BUMDes Stats */}
        <Card className="border-l-4 border-primary">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-6 w-6 text-primary-dark" /></div>
              </div>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-1">Total BUMDes</p>
              <h3 className="text-3xl font-bold text-text-main">{totalBumdes}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs">
              <span className="text-text-muted">Terverifikasi: <strong className="text-text-main">{verifiedBumdes}</strong></span>
              <span className="text-warning-dark font-medium">Pending: {pendingBumdes}</span>
            </div>
          </CardContent>
        </Card>

        {/* Store Stats */}
        <Card className="border-l-4 border-secondary">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-secondary/10 rounded-lg"><StoreIcon className="h-6 w-6 text-secondary-dark" /></div>
              </div>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-1">Total Toko</p>
              <h3 className="text-3xl font-bold text-text-main">{totalStores}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs">
              <span className="text-text-muted">Aktif: <strong className="text-text-main">{activeStores}</strong></span>
              <Link href="/admin/toko" className="text-primary hover:underline">Kelola Toko</Link>
            </div>
          </CardContent>
        </Card>

        {/* Product Stats */}
        <Card className="border-l-4 border-accent">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-accent/20 rounded-lg"><Package className="h-6 w-6 text-accent-dark" /></div>
              </div>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-1">Total Produk</p>
              <h3 className="text-3xl font-bold text-text-main">{totalProducts}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs">
              <span className="text-text-muted">Aktif: <strong className="text-text-main">{activeProducts}</strong></span>
              <span className="text-warning-dark font-medium">Pending: {pendingProducts}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Stats */}
        <Card className="border-l-4 border-success">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-success/10 rounded-lg"><ShoppingBag className="h-6 w-6 text-success-dark" /></div>
              </div>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-1">Total Pesanan</p>
              <h3 className="text-3xl font-bold text-text-main">{totalOrders}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs">
              <span className="text-text-muted">Selesai: <strong className="text-success-dark">{completedOrders}</strong></span>
              <Link href="/admin/pesanan" className="text-primary hover:underline">Lihat Pesanan</Link>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-earth text-surface overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10">
            <Banknote className="h-48 w-48 -mr-10 -mt-10" />
          </div>
          <CardContent className="p-8 relative z-10">
            <p className="text-lg font-medium opacity-90 uppercase tracking-widest mb-2">Total GMV (Nilai Transaksi)</p>
            <h2 className="text-5xl font-bold">Rp {totalGmv.toLocaleString("id-ID")}</h2>
            <p className="mt-4 text-sm opacity-80 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> Dihitung dari {completedOrders} pesanan selesai.
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
