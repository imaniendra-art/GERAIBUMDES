import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Search, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { getOrderStatusBadgeVariant, getPaymentStatusBadgeVariant } from "@/lib/utils/status";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/utils/orderStatus";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminPesananPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  await dbConnect();

  const statusFilter = resolvedSearchParams.status || "ALL";
  const query: any = {};
  
  if (statusFilter !== "ALL") {
    query.status = statusFilter;
  }
  if (resolvedSearchParams.q) {
    query.orderNumber = { $regex: resolvedSearchParams.q, $options: "i" };
  }

  const orders = await Order.find(query)
    .populate({ path: "sellerStoreId", model: Store, select: "name" })
    .sort({ createdAt: -1 });

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Semua Pesanan</h1>
          <p className="text-text-muted text-sm mt-1">Pantau seluruh transaksi antar-BUMDes.</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                name="q"
                defaultValue={resolvedSearchParams.q}
                placeholder="Cari no pesanan..."
                className="w-full bg-surface border border-border text-text-main rounded-md pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            </div>
            
            <div className="flex w-full sm:w-auto gap-2">
              <div className="flex items-center w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2 text-text-muted hidden sm:block" />
                <select 
                  name="status" 
                  defaultValue={statusFilter}
                  className="bg-surface border border-border text-text-main rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary w-full sm:w-auto"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="WAITING_SELLER_CONFIRMATION">Belum Ongkir</option>
                  <option value="WAITING_PAYMENT">Menunggu Pembayaran</option>
                  <option value="PAYMENT_REVIEW">Review Pembayaran</option>
                  <option value="PROCESSING">Diproses</option>
                  <option value="COMPLETED">Selesai</option>
                </select>
              </div>
              <Button type="submit" variant="outline" className="w-full sm:w-auto">Filter</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {orders.length === 0 ? (
        <EmptyState 
          title="Tidak Ada Pesanan" 
          description="Belum ada transaksi yang sesuai." 
          icon="package" 
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead className="bg-surface-bg text-text-muted uppercase text-xs border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order ID & Waktu</th>
                  <th className="px-6 py-4 font-semibold">Toko Penjual</th>
                  <th className="px-6 py-4 font-semibold">Pembeli</th>
                  <th className="px-6 py-4 font-semibold">Total Tagihan</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order._id.toString()} className="hover:bg-surface-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-main mb-1">{order.orderNumber}</div>
                      <div className="text-xs text-text-muted">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-main">{order.sellerStoreId?.name || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-main">{order.buyerName}</div>
                      <div className="text-[10px] text-text-muted">{order.buyerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-earth">{formatCurrency(order.total)}</div>
                      <div className="mt-1">
                        <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                          {paymentStatusLabel(order.paymentStatus)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                        {orderStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/pesanan/${order._id}`}>
                        <Button variant="outline" size="sm">Detail</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
