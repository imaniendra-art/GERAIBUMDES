import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Package, ChevronRight, ChevronLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { getOrderStatusBadgeVariant, getPaymentStatusBadgeVariant } from "@/lib/utils/status";
import { orderStatusLabel } from "@/lib/utils/orderStatus";

export default async function PenjualPesananPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();

  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();

  const profile = await BumdesProfile.findOne({ userId: session.userId });
  if (!profile) {
    redirect("/dashboard");
  }

  const store = await Store.findOne({ bumdesId: profile._id });
  if (!store || store.status !== "ACTIVE") {
    redirect("/dashboard");
  }

  const statusFilter = resolvedSearchParams.status || "ALL";
  const query: any = { sellerStoreId: store._id };
  if (statusFilter !== "ALL") {
    query.status = statusFilter;
  }

  const orders = await Order.find(query).sort({ createdAt: -1 });

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
          </span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-main">Pesanan Masuk</h1>
      </div>

      {!store.bankAccount?.bankAccountNumber && (
        <div className="bg-error/10 border-2 border-error text-error-dark p-5 rounded-lg flex items-start mb-8 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-[pulse_2s_ease-in-out_infinite]">
          <div className="bg-error/20 rounded-full p-2 mr-4 flex-shrink-0 mt-0.5">
            <span className="h-4 w-4 block bg-error rounded-full animate-ping" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">⚠️ Data Rekening Belum Lengkap!</h4>
            <p className="text-sm font-medium">Lengkapi data rekening toko agar pembeli dapat melakukan pembayaran manual dengan lancar.</p>
            <Link href="/dashboard/toko/edit" className="text-sm font-extrabold bg-white text-black border-2 border-black px-4 py-2 rounded mt-3 inline-block hover:bg-gray-100 transition-colors shadow-sm">
              Lengkapi Rekening Sekarang
            </Link>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari no pesanan..."
                className="w-full bg-surface border border-border text-text-main rounded-md pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            </div>
            
            <form className="flex w-full sm:w-auto gap-2">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-text-muted hidden sm:block" />
                <select 
                  name="status" 
                  defaultValue={statusFilter}
                  className="bg-surface border border-border text-text-main rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary w-full sm:w-auto"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="WAITING_SELLER_CONFIRMATION">Perlu Konfirmasi Ongkir</option>
                  <option value="WAITING_PAYMENT">Menunggu Pembayaran</option>
                  <option value="PAYMENT_REVIEW">Review Pembayaran</option>
                  <option value="PROCESSING">Diproses</option>
                  <option value="COMPLETED">Selesai</option>
                </select>
              </div>
              <Button type="submit" variant="outline" size="sm">Filter</Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {orders.length === 0 ? (
        <EmptyState 
          title="Tidak Ada Pesanan" 
          description="Belum ada pesanan yang sesuai dengan filter saat ini." 
          icon="package" 
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-bg text-text-muted uppercase text-xs border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order ID & Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Pembeli</th>
                  <th className="px-6 py-4 font-semibold">Total Tagihan</th>
                  <th className="px-6 py-4 font-semibold">Status Pesanan</th>
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
                      <div className="font-medium text-text-main">{order.buyerName}</div>
                      <div className="text-xs text-text-muted line-clamp-1 max-w-[150px]">{order.buyerAddress}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-earth">{formatCurrency(order.total)}</div>
                      <div className="text-xs text-text-muted mt-1">
                        <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                          {order.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                        {orderStatusLabel(order.status)}
                      </Badge>
                      {order.status === 'WAITING_SELLER_CONFIRMATION' && (
                        <div className="text-[10px] text-warning mt-1 font-medium animate-pulse">! Butuh Input Ongkir</div>
                      )}
                      {order.status === 'PAYMENT_REVIEW' && (
                        <div className="text-[10px] text-primary-dark mt-1 font-medium animate-pulse">! Cek Bukti Bayar</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/pesanan/${order._id}`}>
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
