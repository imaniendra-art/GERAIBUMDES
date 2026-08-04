import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Filter, Download, ShoppingCart, CheckCircle2, Clock, TrendingUp, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { getOrderStatusBadgeVariant, getPaymentStatusBadgeVariant } from "@/lib/utils/status";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/utils/orderStatus";

export default async function LaporanPenjualanPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; status?: string; paymentStatus?: string }>;
}) {
  const resolvedParams = await searchParams;
  const session = await getSession();

  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();

  const profile = await BumdesProfile.findOne({ userId: session.userId });
  if (!profile) redirect("/dashboard");

  const store = await Store.findOne({ bumdesId: profile._id });
  if (!store || store.status !== "ACTIVE") redirect("/dashboard");

  const statusFilter = resolvedParams.status || "ALL";
  const paymentFilter = resolvedParams.paymentStatus || "ALL";
  const startDate = resolvedParams.startDate || "";
  const endDate = resolvedParams.endDate || "";

  const query: any = { sellerStoreId: store._id };

  if (statusFilter !== "ALL") query.status = statusFilter;
  if (paymentFilter !== "ALL") query.paymentStatus = paymentFilter;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const orders = await Order.find(query).sort({ createdAt: -1 });

  // Hitung Metrik
  const allStoreOrders = await Order.find({ sellerStoreId: store._id });
  const totalMasuk = allStoreOrders.length;
  const totalSelesai = allStoreOrders.filter(o => o.status === "COMPLETED").length;
  const totalMenunggu = allStoreOrders.filter(o => o.status === "WAITING_PAYMENT" || o.status === "PAYMENT_REVIEW").length;
  const totalDiproses = allStoreOrders.filter(o => o.status === "PROCESSING").length;
  
  const gmvSelesai = allStoreOrders.filter(o => o.status === "COMPLETED").reduce((sum, o) => sum + o.total, 0);
  const gmvBerjalan = allStoreOrders.filter(o => !["COMPLETED", "CANCELLED", "REJECTED"].includes(o.status)).reduce((sum, o) => sum + o.total, 0);

  // Buat query string untuk export CSV
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (paymentFilter !== "ALL") params.set("paymentStatus", paymentFilter);
  const csvUrl = `/api/reports/penjualan?${params.toString()}`;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="rounded-xl text-sm font-semibold transition-colors duration-200 h-11 px-4 text-text-muted hover:text-text-main hover:bg-surface-bg">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Laporan Penjualan</h1>
          <p className="text-text-muted mt-1.5 font-medium">Pantau performa penjualan dan transaksi BUMDes Anda.</p>
        </div>
        <a href={csvUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2 border-primary text-primary bg-white hover:bg-primary/5 hover:border-primary transition-colors duration-200 shadow-sm rounded-xl h-11 font-semibold">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </a>
      </div>

      {/* Ringkasan Metrik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 mb-10">
        <Card className="col-span-1 lg:col-span-1 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-200">
          <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-surface-bg p-2.5 rounded-xl border border-border shadow-sm">
                <ShoppingCart className="h-5 w-5 text-text-muted" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-text-main leading-none mb-1.5">{totalMasuk}</p>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Total Pesanan</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-1 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-200">
          <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-success/10 p-2.5 rounded-xl border border-success/20 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-success-dark" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-text-main leading-none mb-1.5">{totalSelesai}</p>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Pesanan Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-1 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-200">
          <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-warning/10 p-2.5 rounded-xl border border-warning/20 shadow-sm">
                <Clock className="h-5 w-5 text-warning-dark" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-text-main leading-none mb-1.5">{totalDiproses + totalMenunggu}</p>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Berjalan</p>
            </div>
          </CardContent>
        </Card>
        
        {/* GMV Hero Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 rounded-3xl shadow-sm border-0 bg-gradient-to-br from-success/5 to-success/10 hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
            <TrendingUp className="w-32 h-32 text-success-dark" />
          </div>
          <CardContent className="p-6 sm:p-8 flex flex-col justify-center h-full relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm font-semibold text-success-dark/80 tracking-wide uppercase">Nilai Penjualan Berhasil</p>
              <span className="text-[10px] font-black bg-success-dark/10 text-success-dark px-2 py-0.5 rounded-full uppercase tracking-wider border border-success-dark/20 shadow-sm">GMV</span>
            </div>
            <p className="text-4xl sm:text-5xl font-black text-success-dark mb-3 tracking-tight drop-shadow-sm">{formatCurrency(gmvSelesai)}</p>
            <div className="flex items-center gap-2">
              <div className="bg-white/60 px-3 py-1.5 rounded-lg border border-success/20 inline-flex items-center">
                <span className="text-xs text-success-dark/70 font-medium mr-1.5">Potensi Berjalan:</span>
                <span className="text-xs font-bold text-success-dark">{formatCurrency(gmvBerjalan)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 sm:p-6 mb-8 hover:shadow-md transition-shadow duration-200">
        <form className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Mulai Tanggal</label>
            <input type="date" name="startDate" defaultValue={startDate} className="w-full h-11 bg-surface-bg border border-border text-text-main rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Sampai Tanggal</label>
            <input type="date" name="endDate" defaultValue={endDate} className="w-full h-11 bg-surface-bg border border-border text-text-main rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Status Pesanan</label>
            <select name="status" defaultValue={statusFilter} className="w-full h-11 bg-surface-bg border border-border text-text-main rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 cursor-pointer">
              <option value="ALL">Semua Status</option>
              <option value="WAITING_SELLER_CONFIRMATION">Menunggu Konfirmasi Seller</option>
              <option value="WAITING_PAYMENT">Menunggu Pembayaran</option>
              <option value="PAYMENT_REVIEW">Review Pembayaran</option>
              <option value="PROCESSING">Diproses</option>
              <option value="SHIPPED_MANUAL">Dikirim</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Status Bayar</label>
            <select name="paymentStatus" defaultValue={paymentFilter} className="w-full h-11 bg-surface-bg border border-border text-text-main rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 cursor-pointer">
              <option value="ALL">Semua Status</option>
              <option value="UNPAID">Belum Dibayar</option>
              <option value="WAITING_REVIEW">Menunggu Review</option>
              <option value="PAID">Lunas</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
          <div>
            <Button type="submit" className="w-full h-11 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200"><Filter className="h-4 w-4 mr-2" /> Terapkan Filter</Button>
          </div>
        </form>
      </div>

      {/* Tabel */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden mb-8 transition-shadow duration-300 hover:shadow-md">
        <div className="overflow-x-auto p-1 sm:p-2">
          <table className="w-full text-sm text-left whitespace-nowrap text-text-main">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg/80 border-b border-border font-semibold h-12">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">No. Pesanan & Tgl</th>
                <th className="px-6 py-4">Pembeli</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4 text-right">Total Tagihan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center rounded-tr-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 min-h-[340px]">
                      <div className="w-24 h-24 bg-surface-bg rounded-full flex items-center justify-center mb-6 border border-border shadow-sm hover:scale-105 transition-transform duration-300">
                        <ShoppingBag className="h-10 w-10 text-text-muted" />
                      </div>
                      <h3 className="text-xl font-bold text-text-main mb-2 tracking-tight">Belum ada transaksi</h3>
                      <p className="text-text-muted text-center max-w-md mb-8">
                        Laporan penjualan akan muncul otomatis setelah toko menerima pesanan pertama.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Link href="/dashboard/produk/tambah" className="w-full sm:w-auto">
                          <Button className="w-full sm:w-auto shadow-sm rounded-xl hover:-translate-y-0.5 transition-transform duration-200">
                            <Plus className="h-[18px] w-[18px] mr-1.5" /> Tambah Produk
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full sm:w-auto rounded-xl hover:-translate-y-0.5 transition-transform duration-200">
                          Panduan Penjualan
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const totalItems = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0;
                  return (
                    <tr key={order._id.toString()} className="bg-surface border-b border-border/50 hover:bg-surface-bg/50 transition-colors duration-200 group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-text-main group-hover:text-primary transition-colors">{order.orderNumber}</div>
                        <div className="text-xs text-text-muted mt-0.5">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-main">{order.buyerName}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{totalItems} brg</td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-earth text-base">{formatCurrency(order.total)}</div>
                        <div className="text-xs text-text-muted mt-1">Ongkir: {formatCurrency(order.shippingCost)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="mb-2">
                          <Badge variant={getOrderStatusBadgeVariant(order.status)} className="rounded-lg px-2.5 py-1">
                            {orderStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} className="rounded-lg px-2 py-0.5 text-[10px]">
                            {paymentStatusLabel(order.paymentStatus)}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/dashboard/pesanan/${order._id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                            Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
