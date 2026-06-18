import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Package, ChevronRight, ChevronLeft, Store as StoreIcon } from "lucide-react";

export default async function PesananSayaPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await dbConnect();

  const orders = await Order.find({ buyerId: session.userId })
    .populate({ path: "sellerStoreId", model: Store, select: "name slug" })
    .sort({ createdAt: -1 });

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
      <div className="w-full">
        <div className="mb-6">
          <Link href="/dashboard">
            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main">
              <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
            </span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Pesanan Saya</h1>
          <Link href="/pesanan/laporan">
            <button className="bg-surface border border-border hover:bg-surface-bg text-text-main font-semibold py-2 px-4 rounded-md transition-colors flex items-center">
              Lihat Laporan Pembelian
            </button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-xl border border-border">
            <Package className="h-16 w-16 text-border mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-main mb-2">Belum Ada Pesanan</h2>
            <p className="text-text-muted mb-6">Mulai eksplorasi kebutuhan BUMDes Anda di marketplace.</p>
            <Link href="/produk" className="bg-primary hover:bg-primary-dark text-surface font-semibold py-2 px-4 rounded-md">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id.toString()} className="overflow-hidden hover:shadow-md transition-shadow border-border">
                <div className="bg-surface-bg border-b border-border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="font-bold text-text-main">{order.orderNumber}</span>
                    <span className="text-text-muted">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-primary/10 text-primary-dark px-2.5 py-1 rounded-md text-xs font-bold uppercase border border-primary/20">
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${
                      order.paymentStatus === 'PAID' ? 'bg-success/10 text-success-dark border-success/20' : 
                      order.paymentStatus === 'WAITING_REVIEW' ? 'bg-warning/10 text-warning-dark border-warning/20' :
                      order.paymentStatus === 'REJECTED' ? 'bg-danger/10 text-danger border-danger/20' :
                      'bg-border/30 text-text-muted border-border'
                    }`}>
                      {order.paymentStatus === "UNPAID" ? "BELUM BAYAR" : 
                       order.paymentStatus === "WAITING_REVIEW" ? "MENUNGGU REVIEW" :
                       order.paymentStatus === "PAID" ? "LUNAS" :
                       order.paymentStatus === "REJECTED" ? "DITOLAK" : order.paymentStatus}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                  <div className="flex-1 w-full">
                    <div className="flex items-center text-sm font-medium text-text-muted mb-3">
                      <StoreIcon className="h-4 w-4 mr-2" />
                      {order.sellerStoreId?.name || "Toko BUMDes"}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {order.items.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-text-main font-medium line-clamp-1 pr-4">{item.quantity} x {item.productNameSnapshot}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-sm text-text-muted italic">... dan {order.items.length - 2} produk lainnya</div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-xs text-text-muted">Total Belanja</p>
                      <p className="text-lg font-bold text-earth">Rp {order.total.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0">
                    <Link href={`/pesanan/${order._id}`} className="block">
                      <button className="w-full sm:w-auto bg-surface border border-border hover:bg-surface-bg text-text-main font-semibold py-2 px-6 rounded-md transition-colors flex items-center justify-center">
                        Lihat Detail <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
