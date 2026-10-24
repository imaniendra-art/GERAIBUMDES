import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Package, ChevronRight, ChevronLeft, Search, Filter, AlertTriangle, ShoppingBag } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Pesanan Masuk</h1>
          <p className="text-text-muted mt-1.5 font-medium">Kelola seluruh pesanan yang masuk ke toko BUMDes Anda.</p>
        </div>
      </div>

      {!store.bankAccount?.bankAccountNumber && (
        <div className="bg-warning/10 border border-warning/20 px-6 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between mb-8 shadow-sm h-auto sm:h-[72px] transition-all duration-200">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-warning/20 p-2.5 rounded-xl mr-4 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-warning-dark" />
            </div>
            <div>
              <h4 className="font-bold text-base text-text-main leading-tight">Data Rekening Belum Lengkap</h4>
              <p className="text-sm text-text-muted mt-0.5">Lengkapi data rekening BUMDes agar pembeli dapat melakukan pembayaran.</p>
            </div>
          </div>
          <Link href="/dashboard/toko/edit" className="flex-shrink-0 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-warning/30 text-warning-dark hover:bg-warning/10 shadow-sm rounded-xl">Lengkapi Sekarang</Button>
          </Link>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface p-2 sm:p-3 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Cari no pesanan..."
            className="w-full bg-surface-bg border border-border text-text-main rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary transition-colors"
          />
          <Search className="absolute left-4 top-3 h-[18px] w-[18px] text-text-muted" />
        </div>
        
        <form className="flex w-full sm:w-auto gap-3">
          <div className="flex items-center w-full sm:w-auto relative">
            <select 
              name="status" 
              defaultValue={statusFilter}
              className="appearance-none bg-surface-bg border border-border text-text-main rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-primary focus:border-primary w-full sm:w-auto transition-colors font-medium cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="WAITING_SELLER_CONFIRMATION">Konfirmasi Ongkir</option>
              <option value="WAITING_PAYMENT">Menunggu Pembayaran</option>
              <option value="PAYMENT_REVIEW">Review Pembayaran</option>
              <option value="PROCESSING">Diproses</option>
              <option value="COMPLETED">Selesai</option>
            </select>
            <Filter className="absolute left-3.5 top-3 h-[18px] w-[18px] text-text-muted pointer-events-none" />
            <div className="absolute right-3.5 top-3.5 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <Button type="submit" variant="outline" className="shadow-sm rounded-xl px-5">Terapkan</Button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface rounded-2xl shadow-sm border border-border flex flex-col items-center justify-center py-12 px-4 min-h-[280px]">
          <div className="w-24 h-24 bg-surface-bg rounded-3xl flex items-center justify-center mb-6 border border-border shadow-sm hover:scale-105 transition-transform duration-300">
            <ShoppingBag className="h-12 w-12 text-text-muted" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">Belum ada pesanan masuk</h3>
          <p className="text-text-muted text-center max-w-md">
            Pesanan akan muncul di sini setelah pembeli melakukan transaksi melalui GeraiBUMDes.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View: Kartu Bento Pesanan */}
        <div className="block md:hidden space-y-3 mb-8">
          {orders.map((order) => (
            <div key={order._id.toString()} className="bg-surface rounded-2xl p-4 border border-border shadow-sm space-y-3">
              <div className="flex justify-between items-start gap-2 border-b border-border/60 pb-2.5">
                <div>
                  <span className="font-bold text-sm text-text-main block">#{order.orderNumber}</span>
                  <span className="text-[11px] text-text-muted">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={getOrderStatusBadgeVariant(order.status)} className="rounded-lg px-2 py-0.5 text-[10px]">
                    {orderStatusLabel(order.status)}
                  </Badge>
                  <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} className="rounded-lg px-2 py-0.5 text-[9px]">
                    {order.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Pembeli</p>
                <p className="font-bold text-sm text-text-main">{order.buyerName}</p>
                <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{order.buyerAddress}</p>
              </div>

              {order.status === 'WAITING_SELLER_CONFIRMATION' && (
                <div className="text-[11px] text-warning-dark font-bold bg-warning/10 p-2.5 rounded-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warning-dark shrink-0"></span>
                  Perlu Konfirmasi Ongkir & Stok
                </div>
              )}

              {order.status === 'PAYMENT_REVIEW' && (
                <div className="text-[11px] text-primary-dark font-bold bg-primary/10 p-2.5 rounded-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-dark shrink-0"></span>
                  Bukti Transfer Menunggu Konfirmasi
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-border/60">
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block">Total Tagihan</span>
                  <span className="text-base font-extrabold text-primary">{formatCurrency(order.total)}</span>
                </div>
                <Link href={`/dashboard/pesanan/${order._id}`}>
                  <Button size="sm" className="rounded-xl h-9 px-4 font-bold text-xs shadow-sm">
                    Detail
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Tabel Tradisional */}
        <div className="hidden md:block bg-surface rounded-2xl shadow-sm border border-border overflow-hidden transition-shadow duration-300 hover:shadow-md mb-8">
          <div className="overflow-x-auto p-1 sm:p-2">
            <table className="w-full text-sm text-left text-text-main">
              <thead className="text-xs text-text-muted uppercase bg-surface-bg/80 border-b border-border font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Order ID & Tanggal</th>
                  <th className="px-6 py-4">Pembeli</th>
                  <th className="px-6 py-4">Total Tagihan</th>
                  <th className="px-6 py-4">Status Pesanan</th>
                  <th className="px-6 py-4 text-right rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id.toString()} className="bg-surface border-b border-border/50 hover:bg-surface-bg/50 transition-colors duration-200 group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-main mb-1 group-hover:text-primary transition-colors">{order.orderNumber}</div>
                      <div className="text-xs text-text-muted">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-main">{order.buyerName}</div>
                      <div className="text-xs text-text-muted line-clamp-1 max-w-[180px] leading-relaxed mt-0.5">{order.buyerAddress}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-earth text-base">{formatCurrency(order.total)}</div>
                      <div className="text-xs text-text-muted mt-1">
                        <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} className="rounded-lg px-2 py-0.5 text-[10px]">
                          {order.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getOrderStatusBadgeVariant(order.status)} className="rounded-lg px-2.5 py-1">
                        {orderStatusLabel(order.status)}
                      </Badge>
                      {order.status === 'WAITING_SELLER_CONFIRMATION' && (
                        <div className="text-[10px] text-warning-dark mt-1.5 font-bold animate-pulse flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning-dark mr-1.5"></span>
                          Butuh Input Ongkir
                        </div>
                      )}
                      {order.status === 'PAYMENT_REVIEW' && (
                        <div className="text-[10px] text-primary-dark mt-1.5 font-bold animate-pulse flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-dark mr-1.5"></span>
                          Cek Bukti Bayar
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/pesanan/${order._id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                          Detail
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
