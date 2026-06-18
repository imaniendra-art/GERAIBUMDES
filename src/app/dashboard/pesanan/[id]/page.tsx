import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, User, MapPin, Receipt, Package, Truck, CheckCircle, Clock, PackageCheck, Printer } from "lucide-react";
import { SetShippingForm, VerifyPaymentForm, UpdateStatusForm, ShipManualForm } from "./OrderActionForms";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/utils/orderStatus";
import { PrintButton } from "@/components/ui/PrintButton";

export default async function PenjualPesananDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();

  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();

  const profile = await BumdesProfile.findOne({ userId: session.userId });
  if (!profile) redirect("/dashboard");

  const store = await Store.findOne({ bumdesId: profile._id });
  if (!store) redirect("/dashboard");

  let order;
  try {
    order = await Order.findOne({ _id: resolvedParams.id, sellerStoreId: store._id }).lean();
  } catch {
    notFound();
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8 print:py-0 print:bg-white">
      <div className="mb-8 flex justify-between items-center print:hidden">
        <Link href="/dashboard/pesanan">
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali
          </span>
        </Link>
        {["WAITING_PAYMENT", "PAYMENT_REVIEW", "PAID", "PROCESSING", "READY_TO_PICKUP", "SHIPPED_MANUAL", "COMPLETED"].includes(order.status) && (
          <PrintButton label={order.status === "COMPLETED" ? "Cetak Kwitansi" : "Cetak Invoice"} href={`/cetak/${order._id}`} />
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center">
            Order <span className="ml-2 text-lg font-normal text-text-muted">#{order.orderNumber}</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-primary/10 text-primary-dark px-3 py-1.5 rounded-md text-xs font-bold uppercase border border-primary/20">
            {orderStatusLabel(order.status)}
          </span>
          <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase border ${
            order.paymentStatus === 'PAID' ? 'bg-success/10 text-success-dark border-success/20' : 
            order.paymentStatus === 'WAITING_REVIEW' ? 'bg-warning/10 text-warning-dark border-warning/20' :
            order.paymentStatus === 'REJECTED' ? 'bg-danger/10 text-danger border-danger/20' :
            'bg-border/30 text-text-muted border-border'
          }`}>
            {paymentStatusLabel(order.paymentStatus)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Rincian Produk & Pengiriman */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <div className="bg-surface-bg border-b border-border p-4 flex items-center text-text-main font-bold">
              <Package className="h-5 w-5 mr-2 text-text-muted" /> Rincian Produk
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-main">{item.productNameSnapshot}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                        <span>{item.quantity} {item.unit} x {formatCurrency(item.price)}</span>
                        {item.appliedPriceType === "WHOLESALE" && (
                          <span className="bg-secondary/10 text-secondary-dark text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border border-secondary/20">Grosir</span>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-text-main">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-surface-bg border-t border-border p-4 space-y-2">
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Subtotal Produk</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted pb-2 border-b border-border">
                  <span>Ongkos Kirim Manual</span>
                  <span>{order.status === "WAITING_SELLER_CONFIRMATION" ? "Belum Diatur" : formatCurrency(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 text-earth">
                  <span>Total Tagihan</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-text-main mb-4 flex items-center"><MapPin className="h-5 w-5 mr-2 text-text-muted"/> Alamat Pengiriman</h3>
              <div className="bg-surface-bg p-4 rounded-md border border-border">
                <p className="font-semibold text-text-main mb-1">{order.buyerName}</p>
                <p className="text-text-muted text-sm mb-2">{order.buyerPhone}</p>
                <p className="text-text-main text-sm leading-relaxed">{order.buyerAddress}</p>
              </div>
              
              <div className="mt-4">
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Catatan dari Pembeli:</p>
                <p className="text-sm text-text-main bg-surface-bg p-3 rounded-md border border-border min-h-[40px] whitespace-pre-wrap">
                  {order.buyerNote || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Kolom Kanan: Aksi & Status Pembayaran */}
        <div className="space-y-6">
          
          <Card className="border-primary">
            <div className="bg-primary/5 border-b border-primary/20 p-4 font-bold text-primary-dark">
              Tindakan Penjual
            </div>
            <CardContent className="p-5 space-y-4">
              
              {order.status === "WAITING_SELLER_CONFIRMATION" && (
                <>
                  <div className="text-sm text-text-muted mb-4">
                    Pesanan baru masuk. Silakan cek stok produk dan tentukan ongkos kirim manual yang harus dibayar pembeli.
                  </div>
                  <SetShippingForm orderId={order._id.toString()} currentSubtotal={order.subtotal} />
                </>
              )}

              {order.status === "WAITING_PAYMENT" && (
                <div className="text-center py-4">
                  <Clock className="h-10 w-10 text-warning mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-text-main">Menunggu Pembayaran</p>
                  <p className="text-xs text-text-muted mt-1">Silakan hubungi pembeli ({order.buyerPhone}) untuk memberikan nomor rekening Anda.</p>
                </div>
              )}

              {order.status === "PAYMENT_REVIEW" && (
                <div>
                  <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-md mb-4 text-center">
                    <p className="text-xs font-bold text-secondary-dark uppercase mb-2">Bukti Pembayaran Diunggah</p>
                    {order.paymentProofUrl ? (
                      <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all font-medium">
                        Lihat Bukti Bayar ↗
                      </a>
                    ) : (
                      <span className="text-sm text-text-muted">Tidak ada URL</span>
                    )}
                  </div>
                  <VerifyPaymentForm orderId={order._id.toString()} />
                </div>
              )}

              {order.status === "PROCESSING" && (
                <div>
                  <div className="bg-success/10 text-success-dark text-xs p-3 rounded mb-4 text-center border border-success/20">
                    Pembayaran Lunas. Silakan siapkan pesanan.
                  </div>
                  <ShipManualForm orderId={order._id.toString()} />
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-surface px-2 text-text-muted">Atau ambil di tempat</span>
                    </div>
                  </div>
                  <div>
                    <UpdateStatusForm 
                      orderId={order._id.toString()} 
                      nextAction="READY_TO_PICKUP" 
                      label="Tandai Siap Diambil" 
                      iconName="PackageCheck" 
                    />
                  </div>
                </div>
              )}

              {(order.status === "SHIPPED_MANUAL" || order.status === "READY_TO_PICKUP") && (
                <div className="text-center py-4 bg-primary/5 border border-primary/20 rounded-md">
                  <PackageCheck className="h-8 w-8 text-primary mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-text-main">Menunggu Konfirmasi Pembeli</p>
                  <p className="text-xs text-text-muted mt-1 px-4">Pesanan telah {order.status === "SHIPPED_MANUAL" ? "dikirim" : "siap diambil"}. Menunggu pembeli menerima barang dan menandai pesanan selesai.</p>
                </div>
              )}

              {order.status === "COMPLETED" && (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
                  <p className="text-lg font-bold text-text-main">Pesanan Selesai</p>
                  <p className="text-sm text-text-muted mt-1 mb-4">Transaksi telah berhasil.</p>
                  
                  {order.receiptProofUrl && (
                    <div className="bg-success/5 border border-success/20 p-4 rounded-md inline-block text-left mx-auto">
                      <p className="text-xs font-bold text-success-dark uppercase mb-2">Bukti Barang Diterima Pembeli</p>
                      <a href={order.receiptProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-success-dark hover:underline break-all font-medium inline-block">
                        Lihat Dokumentasi Penerimaan ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold text-text-main mb-3">Log Info</h3>
              <div className="space-y-2 text-xs">
                {order.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Dibuat</span>
                    <span className="font-medium text-text-main">{formatDate(order.createdAt)}</span>
                  </div>
                )}
                {order.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Dikonfirmasi</span>
                    <span className="font-medium text-text-main">{formatDate(order.confirmedAt)}</span>
                  </div>
                )}
                {order.paymentProofUploadedAt && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Upload Bayar</span>
                    <span className="font-medium text-text-main">{formatDate(order.paymentProofUploadedAt)}</span>
                  </div>
                )}
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Lunas</span>
                    <span className="font-medium text-success-dark">{formatDate(order.paidAt)}</span>
                  </div>
                )}
                {order.shippedAt && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Dikirim</span>
                    <span className="font-medium text-text-main">{formatDate(order.shippedAt)}</span>
                  </div>
                )}
                {order.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Selesai</span>
                    <span className="font-medium text-text-main">{formatDate(order.completedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Print-only Footer */}
      <div className="hidden print:block mt-12 text-center text-sm text-text-muted border-t border-border pt-4">
        <p>BUMDesMart - Transaksi Sah dan Tercatat</p>
      </div>
    </div>
  );
}
