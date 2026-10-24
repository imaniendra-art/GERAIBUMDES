import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/formatters";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Package, 
  Store as StoreIcon,
  Search, 
  Filter, 
  Calendar, 
  FileText
} from "lucide-react";

export default async function DashboardPembelianPage() {
  const session = await getSession();

  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();

  const orders = await Order.find({ buyerId: session.userId })
    .populate({ path: "sellerStoreId", model: Store, select: "name slug logoUrl" })
    .sort({ createdAt: -1 });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Pembelian Saya</h1>
          <p className="text-text-muted text-sm mt-1">Kelola seluruh transaksi pembelian produk dari BUMDes lain.</p>
        </div>
        <Link href="/dashboard/pembelian/laporan">
          <Button className="flex items-center h-10 px-5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all">
            <FileText className="h-4 w-4 mr-2" />
            Laporan Pembelian
          </Button>
        </Link>
      </div>

      {/* Toolbar Pencarian & Filter */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">Cari Invoice</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Cari no invoice..."
              className="w-full h-10 pl-10 pr-4 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-48 space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">Status</label>
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <select className="w-full h-10 pl-10 pr-4 appearance-none bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer">
              <option value="">Semua Status</option>
              <option value="UNPAID">Belum Bayar</option>
              <option value="WAITING_CONFIRMATION">Menunggu Konfirmasi</option>
              <option value="PROCESSING">Diproses</option>
              <option value="SHIPPED">Dikirim</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
        </div>

        <div className="w-full lg:w-48 space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">Tanggal</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <select className="w-full h-10 pl-10 pr-4 appearance-none bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer">
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
            </select>
          </div>
        </div>

        <Button className="w-full lg:w-auto h-10 px-5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all">
          Terapkan
        </Button>
      </div>

      {/* Order List */}
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center">
          <div className="bg-primary/5 p-5 rounded-full mb-4">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-main mb-2">Belum ada riwayat pembelian</h2>
          <p className="text-text-muted text-sm mb-6 max-w-md">Produk yang Anda beli dari BUMDes lain melalui marketplace akan muncul di sini.</p>
          <Link href="/">
            <Button className="h-10 px-6 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all">
              <StoreIcon className="h-4 w-4 mr-2" />
              Jelajahi Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const getStatusBadge = (status: string) => {
              const s = status.toUpperCase();
              if (s === "PENDING" || s === "WAITING_CONFIRMATION" || s === "WAITING_SELLER_CONFIRMATION") return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
              if (s === "PROCESSING" || s === "ACCEPTED") return "bg-blue-500/10 text-blue-700 border-blue-500/20";
              if (s === "SHIPPED" || s === "SHIPPED_MANUAL" || s === "READY_TO_PICKUP") return "bg-cyan-500/10 text-cyan-700 border-cyan-500/20";
              if (s === "COMPLETED" || s === "DELIVERED") return "bg-green-500/10 text-green-700 border-green-500/20";
              if (s === "CANCELLED" || s === "REJECTED") return "bg-red-500/10 text-red-700 border-red-500/20";
              return "bg-surface-bg text-text-muted border-border";
            };

            const getPaymentBadge = (status: string) => {
              const s = status.toUpperCase();
              if (s === "UNPAID") return "bg-orange-500/10 text-orange-700 border-orange-500/20";
              if (s === "WAITING_REVIEW" || s === "PENDING") return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
              if (s === "PAID") return "bg-green-500/10 text-green-700 border-green-500/20";
              if (s === "REJECTED" || s === "FAILED") return "bg-red-500/10 text-red-700 border-red-500/20";
              return "bg-surface-bg text-text-muted border-border";
            };

            const totalItems = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0);

            return (
              <Card 
                key={order._id.toString()} 
                className="overflow-hidden rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="bg-surface-bg/50 border-b border-border px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span className="font-bold text-text-main">{order.orderNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase border tracking-wider ${getPaymentBadge(order.paymentStatus)}`}>
                      {order.paymentStatus === "UNPAID" ? "Belum Bayar" : 
                       order.paymentStatus === "WAITING_REVIEW" ? "Menunggu Review" :
                       order.paymentStatus === "PAID" ? "Lunas" :
                       order.paymentStatus === "REJECTED" ? "Ditolak" : order.paymentStatus}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase border tracking-wider ${getStatusBadge(order.status)}`}>
                      {order.status === "PENDING" || order.status === "WAITING_SELLER_CONFIRMATION" ? "Menunggu Konfirmasi" : 
                       order.status === "ACCEPTED" || order.status === "PROCESSING" ? "Diproses" :
                       order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 bg-surface-bg rounded-lg border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                        {order.sellerStoreId?.logoUrl ? (
                          <img src={order.sellerStoreId.logoUrl} alt={order.sellerStoreId.name} className="w-full h-full object-cover" />
                        ) : (
                          <StoreIcon className="h-4 w-4 text-text-muted" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Penjual</p>
                        <p className="font-semibold text-text-main text-sm">
                          {order.sellerStoreId?.name || "Toko BUMDes"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {order.items.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-l-2 border-primary/20 pl-2.5">
                          <span className="text-text-main font-medium line-clamp-1 pr-4">{item.productNameSnapshot}</span>
                          <span className="text-text-muted font-mono whitespace-nowrap">{item.quantity} x {formatCurrency(item.price)}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-xs text-text-muted italic pl-2.5">... dan {order.items.length - 2} produk lainnya</div>
                      )}
                    </div>
                    
                    <div className="bg-surface-bg p-3 rounded-xl border border-border flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Jumlah</p>
                        <p className="text-xs font-medium text-text-main">{totalItems} Item</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Belanja</p>
                        <p className="text-base font-bold text-primary">Rp {order.total.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
                    <Link href={`/dashboard/pembelian/${order._id}`} className="block">
                      <Button variant="outline" className="w-full sm:w-auto h-10 px-5 rounded-xl font-semibold border-border hover:bg-surface-bg hover:border-primary/30 transition-all text-xs">
                        Lihat Detail
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
