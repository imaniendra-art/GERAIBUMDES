import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { getOrderStatusBadgeVariant, getPaymentStatusBadgeVariant } from "@/lib/utils/status";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/utils/orderStatus";

export default async function DashboardLaporanPembelianPage({
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

  const statusFilter = resolvedParams.status || "ALL";
  const paymentFilter = resolvedParams.paymentStatus || "ALL";
  const startDate = resolvedParams.startDate || "";
  const endDate = resolvedParams.endDate || "";

  const query: any = { buyerId: session.userId };

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

  const orders = await Order.find(query)
    .populate({ path: "sellerStoreId", model: Store, select: "name slug" })
    .sort({ createdAt: -1 });

  // Hitung Metrik Semua Pembelian (tanpa filter)
  const allPurchases = await Order.find({ buyerId: session.userId });
  const totalDibuat = allPurchases.length;
  const totalSelesai = allPurchases.filter(o => o.status === "COMPLETED").length;
  
  const belanjaSelesai = allPurchases.filter(o => o.status === "COMPLETED").reduce((sum, o) => sum + o.total, 0);
  const belanjaBerjalan = allPurchases.filter(o => !["COMPLETED", "CANCELLED", "REJECTED"].includes(o.status)).reduce((sum, o) => sum + o.total, 0);

  // Buat query string untuk export CSV
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (paymentFilter !== "ALL") params.set("paymentStatus", paymentFilter);
  const csvUrl = `/api/reports/pembelian?${params.toString()}`;

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/pembelian">
          <Button variant="ghost" className="rounded-xl text-sm font-semibold transition-colors duration-200 h-10 px-4 text-text-muted hover:text-text-main hover:bg-surface border border-border shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Pembelian Saya
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Laporan Pembelian B2B</h1>
          <p className="text-text-muted mt-1 text-sm font-medium">Ringkasan aktivitas dan pengeluaran belanja antar-BUMDes Anda.</p>
        </div>
        <a href={csvUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2 border-primary text-primary bg-surface hover:bg-primary/5 hover:border-primary transition-colors duration-200 shadow-sm rounded-xl h-10 font-semibold">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </a>
      </div>

      {/* Ringkasan Metrik */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="col-span-2 lg:col-span-1 rounded-2xl border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Dibuat</p>
            <p className="text-2xl font-bold text-text-main mt-1">{totalDibuat}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1 rounded-2xl border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Pesanan Selesai</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{totalSelesai}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-4 bg-primary/5 border-primary/20 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Total Belanja Selesai</p>
            <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(belanjaSelesai)}</p>
            <p className="text-xs text-text-muted mt-1 font-medium">Belanja Berjalan: {formatCurrency(belanjaBerjalan)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="rounded-2xl border-border shadow-sm bg-surface">
        <CardContent className="p-5">
          <form className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Mulai Tanggal</label>
              <input 
                type="date" 
                name="startDate" 
                defaultValue={startDate} 
                className="w-full bg-surface-bg border border-border text-text-main rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Sampai Tanggal</label>
              <input 
                type="date" 
                name="endDate" 
                defaultValue={endDate} 
                className="w-full bg-surface-bg border border-border text-text-main rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Status Pesanan</label>
              <select 
                name="status" 
                defaultValue={statusFilter} 
                className="w-full bg-surface-bg border border-border text-text-main rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="WAITING_SELLER_CONFIRMATION">Menunggu Ongkir</option>
                <option value="WAITING_PAYMENT">Menunggu Pembayaran</option>
                <option value="PAYMENT_REVIEW">Review Pembayaran</option>
                <option value="PROCESSING">Diproses</option>
                <option value="SHIPPED_MANUAL">Dikirim</option>
                <option value="COMPLETED">Selesai</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Status Bayar</label>
              <select 
                name="paymentStatus" 
                defaultValue={paymentFilter} 
                className="w-full bg-surface-bg border border-border text-text-main rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="UNPAID">Belum Dibayar</option>
                <option value="WAITING_REVIEW">Menunggu Review</option>
                <option value="PAID">Lunas</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
            <div>
              <Button type="submit" className="w-full h-10 rounded-xl font-semibold shadow-sm">
                <Filter className="h-4 w-4 mr-2" /> Terapkan Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabel */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-surface-bg text-text-muted uppercase text-[11px] font-bold tracking-wider border-b border-border">
              <tr>
                <th className="px-5 py-3.5">No. Pesanan & Tgl</th>
                <th className="px-5 py-3.5">Toko BUMDes Penjual</th>
                <th className="px-5 py-3.5 text-right">Total Tagihan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyState 
                      title="Tidak ada laporan" 
                      description="Tidak ada data pembelian yang sesuai filter." 
                      icon="folder" 
                      className="border-0 rounded-none bg-transparent py-16"
                    />
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  return (
                    <tr key={order._id.toString()} className="hover:bg-surface-bg/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-text-main">{order.orderNumber}</div>
                        <div className="text-xs text-text-muted mt-0.5">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-text-main">{order.sellerStoreId?.name || "Toko BUMDes"}</div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="font-bold text-primary">{formatCurrency(order.total)}</div>
                        <div className="text-xs text-text-muted mt-0.5">Ongkir: {formatCurrency(order.shippingCost)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="mb-1">
                          <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                            {orderStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                            {paymentStatusLabel(order.paymentStatus)}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link href={`/dashboard/pembelian/${order._id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl border-border hover:bg-surface-bg hover:border-primary/30 text-xs font-semibold">
                            Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
