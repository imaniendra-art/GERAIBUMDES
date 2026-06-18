import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { getOrderStatusBadgeVariant, getPaymentStatusBadgeVariant } from "@/lib/utils/status";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/utils/orderStatus";

export default async function AdminLaporanTransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; status?: string; paymentStatus?: string }>;
}) {
  const resolvedParams = await searchParams;
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  await dbConnect();

  const statusFilter = resolvedParams.status || "ALL";
  const paymentFilter = resolvedParams.paymentStatus || "ALL";
  const startDate = resolvedParams.startDate || "";
  const endDate = resolvedParams.endDate || "";

  const query: any = {};

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

  // Hitung Metrik Semua (Tanpa Filter)
  const allOrders = await Order.find({});
  const totalMasuk = allOrders.length;
  const totalSelesai = allOrders.filter(o => o.status === "COMPLETED").length;
  
  const gmvTotal = allOrders.filter(o => o.status === "COMPLETED").reduce((sum, o) => sum + o.total, 0);

  // Buat query string untuk export CSV
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (paymentFilter !== "ALL") params.set("paymentStatus", paymentFilter);
  const csvUrl = `/api/reports/admin?${params.toString()}`;

  return (
    <div className="pb-10 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <Link href="/admin">
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Overview
          </span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-main">Semua Transaksi Platform</h1>
        <a href={csvUrl} target="_blank" rel="noopener noreferrer">
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Seluruh CSV
          </Button>
        </a>
      </div>

      {/* Ringkasan Metrik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="p-4"><p className="text-xs text-text-muted">Total Pesanan</p><p className="text-2xl font-bold">{totalMasuk}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-text-muted">Total Transaksi Selesai</p><p className="text-2xl font-bold text-success">{totalSelesai}</p></CardContent></Card>
        <Card className="col-span-2 bg-primary/10 border-primary/20"><CardContent className="p-4"><p className="text-xs font-semibold text-primary-dark">Gross Merchandise Value (GMV)</p><p className="text-3xl font-bold text-primary-dark">{formatCurrency(gmvTotal)}</p></CardContent></Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Mulai Tanggal</label>
              <input type="date" name="startDate" defaultValue={startDate} className="w-full bg-surface border border-border text-text-main rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Sampai Tanggal</label>
              <input type="date" name="endDate" defaultValue={endDate} className="w-full bg-surface border border-border text-text-main rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Status Pesanan</label>
              <select name="status" defaultValue={statusFilter} className="w-full bg-surface border border-border text-text-main rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary">
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
              <label className="block text-xs font-medium text-text-muted mb-1">Status Bayar</label>
              <select name="paymentStatus" defaultValue={paymentFilter} className="w-full bg-surface border border-border text-text-main rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary">
                <option value="ALL">Semua Status</option>
                <option value="UNPAID">Belum Dibayar</option>
                <option value="WAITING_REVIEW">Menunggu Review</option>
                <option value="PAID">Lunas</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
            <div>
              <Button type="submit" className="w-full"><Filter className="h-4 w-4 mr-2" /> Terapkan Filter</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabel */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm text-left whitespace-nowrap">
            <thead className="bg-surface-bg text-text-muted uppercase text-xs border-b border-border">
              <tr>
                <th className="px-4 py-3">No. Pesanan & Tgl</th>
                <th className="px-4 py-3">Penjual (BUMDes)</th>
                <th className="px-4 py-3">Pembeli</th>
                <th className="px-4 py-3 text-right">Total Tagihan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState 
                      title="Tidak ada laporan" 
                      description="Tidak ada data transaksi yang sesuai filter." 
                      icon="folder" 
                      className="border-0 rounded-none bg-transparent py-12"
                    />
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  return (
                    <tr key={order._id.toString()} className="hover:bg-surface-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-text-main">{order.orderNumber}</div>
                        <div className="text-xs text-text-muted">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-main">{order.sellerStoreId?.name || "Toko BUMDes"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{order.buyerName}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">{order.buyerRole}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-earth">{formatCurrency(order.total)}</div>
                        <div className="text-[10px] text-text-muted">Ongkir: {formatCurrency(order.shippingCost)}</div>
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-center">
                        <Link href={`/admin/pesanan/${order._id}`}>
                          <Button variant="outline" size="sm">Detail</Button>
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
