import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, Store as StoreIcon, CreditCard, Clock, MapPin, AlertCircle, FileText, CheckCircle, Printer } from "lucide-react";
import UploadPaymentForm from "./UploadPaymentForm";
import { CompleteOrderForm } from "./BuyerActionClient";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/utils/orderStatus";
import { PrintButton } from "@/components/ui/PrintButton";

export default async function PesananDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await dbConnect();

  let order;
  try {
    order = await Order.findOne({ _id: resolvedParams.id, buyerId: session.userId })
      .populate({ path: "sellerStoreId", model: Store, select: "name slug bankAccount" })
      .lean();
  } catch {
    notFound();
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
      <div className="w-full">
        <div className="mb-8 flex justify-between items-center print:hidden">
          <Link href="/pesanan">
            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main">
              <ChevronLeft className="h-4 w-4 mr-2" /> Kembali
            </span>
          </Link>
          {order.status === "COMPLETED" && (
            <PrintButton label="Cetak Kwitansi" href={`/cetak/${order._id}`} />
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main flex items-center">
              Detail Pesanan <span className="ml-3 text-lg font-normal text-text-muted">#{order.orderNumber}</span>
            </h1>
            <p className="text-sm text-text-muted mt-1">Dibuat pada {formatDate(order.createdAt)}</p>
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

        {/* Timeline Status Sederhana */}
        <div className="bg-surface p-4 sm:p-6 rounded-lg border border-border mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className={`flex items-center gap-3 ${["WAITING_SELLER_CONFIRMATION", "CANCELLED"].includes(order.status) ? "opacity-100" : "opacity-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === "WAITING_SELLER_CONFIRMATION" ? "bg-primary text-white" : "bg-primary/20 text-primary-dark"}`}>1</div>
              <div className="text-sm font-semibold">Tunggu Ongkir</div>
            </div>
            <div className={`flex items-center gap-3 ${["WAITING_PAYMENT", "PAYMENT_REVIEW"].includes(order.status) ? "opacity-100" : "opacity-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${["WAITING_PAYMENT", "PAYMENT_REVIEW"].includes(order.status) ? "bg-primary text-white" : "bg-primary/20 text-primary-dark"}`}>2</div>
              <div className="text-sm font-semibold">Pembayaran</div>
            </div>
            <div className={`flex items-center gap-3 ${order.status === "PROCESSING" ? "opacity-100" : "opacity-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === "PROCESSING" ? "bg-primary text-white" : "bg-primary/20 text-primary-dark"}`}>3</div>
              <div className="text-sm font-semibold">Diproses</div>
            </div>
            <div className={`flex items-center gap-3 ${["READY_TO_PICKUP", "SHIPPED_MANUAL"].includes(order.status) ? "opacity-100" : "opacity-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${["READY_TO_PICKUP", "SHIPPED_MANUAL"].includes(order.status) ? "bg-primary text-white" : "bg-primary/20 text-primary-dark"}`}>4</div>
              <div className="text-sm font-semibold">Dikirim/Siap</div>
            </div>
            <div className={`flex items-center gap-3 ${order.status === "COMPLETED" ? "opacity-100" : "opacity-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === "COMPLETED" ? "bg-success text-white" : "bg-success/20 text-success-dark"}`}><CheckCircle className="w-5 h-5" /></div>
              <div className="text-sm font-semibold text-success-dark">Selesai</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Informasi Penjual & Item */}
            <Card className="border-border">
              <div className="bg-surface-bg border-b border-border p-4 flex justify-between items-center">
                <div className="flex items-center text-text-main font-bold">
                  <StoreIcon className="h-5 w-5 mr-2 text-primary" />
                  {order.sellerStoreId?.name || "Toko BUMDes"}
                </div>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-main mb-1">{item.productNameSnapshot}</h3>
                        <div className="flex items-center gap-2 mb-2 text-sm text-text-muted">
                          <span>{item.quantity} {item.unit} x {formatCurrency(item.price)}</span>
                          {item.appliedPriceType === "WHOLESALE" && (
                            <span className="bg-secondary/10 text-secondary-dark text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border border-secondary/20">Grosir</span>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right font-bold text-text-main pt-1 sm:pt-0">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Rincian Harga */}
                <div className="bg-surface-bg border-t border-border p-4 sm:p-6 space-y-3">
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Subtotal Produk</span>
                    <span className="font-medium text-text-main">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-muted pb-3 border-b border-border">
                    <span>Ongkos Kirim Manual</span>
                    <span className="font-medium text-text-main">
                      {order.status === "WAITING_SELLER_CONFIRMATION" 
                        ? <span className="text-warning text-xs font-semibold px-2 py-1 bg-warning/10 rounded">Menunggu Konfirmasi</span>
                        : formatCurrency(order.shippingCost)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-1">
                    <span className="text-text-main">Total Pesanan</span>
                    <span className="text-earth">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Catatan Nota */}
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-bold text-text-main mb-4 flex items-center"><FileText className="h-5 w-5 mr-2 text-text-muted"/> Catatan Pesanan</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase mb-1">Catatan Pembeli</p>
                    <p className="text-sm text-text-main bg-surface-bg p-3 rounded-md border border-border min-h-[40px] whitespace-pre-wrap">
                      {order.buyerNote || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase mb-1">Catatan Penjual / Pengiriman</p>
                    <p className="text-sm text-text-main bg-surface-bg p-3 rounded-md border border-border min-h-[40px] whitespace-pre-wrap">
                      {order.manualShippingNote || order.sellerNote || "Belum ada catatan dari penjual."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="space-y-6">
            
            {/* Detail Pengiriman */}
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-bold text-text-main mb-4 flex items-center"><MapPin className="h-5 w-5 mr-2 text-text-muted"/> Info Pengiriman</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-text-muted font-medium">Nama Penerima</p>
                    <p className="font-semibold text-text-main">{order.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-text-muted font-medium">Nomor HP</p>
                    <p className="font-semibold text-text-main">{order.buyerPhone}</p>
                  </div>
                  <div>
                    <p className="text-text-muted font-medium">Alamat</p>
                    <p className="text-text-main whitespace-pre-wrap leading-relaxed">{order.buyerAddress}</p>
                  </div>
                  
                  {(order.status === "SHIPPED_MANUAL" || order.status === "COMPLETED") && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <p className="font-bold text-text-main">Detail Ekspedisi / Kurir</p>
                      
                      {order.shippingProvider && (
                        <div>
                          <p className="text-xs text-text-muted">Kurir / Kendaraan</p>
                          <p className="font-medium text-text-main">{order.shippingProvider}</p>
                        </div>
                      )}
                      
                      {order.trackingNumber && (
                        <div>
                          <p className="text-xs text-text-muted">No. Resi / Plat Kendaraan</p>
                          <p className="font-medium text-text-main">{order.trackingNumber}</p>
                        </div>
                      )}

                      {order.shippingContact && (
                        <div>
                          <p className="text-xs text-text-muted">Kontak Pengirim</p>
                          <p className="font-medium text-text-main">{order.shippingContact}</p>
                        </div>
                      )}

                      {order.shippingProofUrl && (
                        <div>
                          <p className="text-xs text-text-muted mb-1">Bukti Pengiriman</p>
                          <a href={order.shippingProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all font-medium inline-block">
                            Lihat Foto Pengiriman ↗
                          </a>
                        </div>
                      )}

                      {order.receiptProofUrl && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-text-muted mb-1">Bukti Barang Diterima Pembeli</p>
                          <a href={order.receiptProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-success-dark hover:underline break-all font-medium inline-block">
                            Lihat Dokumentasi Penerimaan ↗
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>

            {/* Pembayaran */}
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-bold text-text-main mb-4 flex items-center"><CreditCard className="h-5 w-5 mr-2 text-text-muted"/> Pembayaran</h3>
                
                {order.status === "WAITING_SELLER_CONFIRMATION" && (
                  <div className="bg-warning/10 border border-warning/20 p-4 rounded-md text-sm text-text-main mb-4 flex items-start">
                    <Clock className="h-5 w-5 text-warning mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Menunggu Penjual</p>
                      <p>Penjual akan meninjau stok dan menginformasikan nominal ongkos kirim sebelum Anda dapat membayar.</p>
                    </div>
                  </div>
                )}

                {order.status === "WAITING_PAYMENT" && order.paymentStatus === "UNPAID" && (
                  <>
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-md text-sm text-text-main mb-6">
                      <p className="font-bold mb-3 text-primary-dark">Instruksi Pembayaran Manual</p>
                      <p className="mb-4">Silakan transfer persis sejumlah <strong className="text-lg text-earth">{formatCurrency(order.total)}</strong> ke rekening BUMDes berikut:</p>
                      
                      {order.sellerStoreId?.bankAccount?.bankAccountNumber ? (
                        <div className="bg-surface p-4 border border-border rounded-md mb-4 shadow-sm">
                          <p className="text-xs text-text-muted uppercase mb-1">Bank</p>
                          <p className="font-bold text-lg mb-3">{order.sellerStoreId.bankAccount.bankName}</p>
                          
                          <p className="text-xs text-text-muted uppercase mb-1">Nomor Rekening</p>
                          <p className="font-mono text-xl mb-3 font-bold tracking-wider text-primary-dark">{order.sellerStoreId.bankAccount.bankAccountNumber}</p>
                          
                          <p className="text-xs text-text-muted uppercase mb-1">Atas Nama</p>
                          <p className="font-medium mb-3">{order.sellerStoreId.bankAccount.bankAccountHolderName}</p>

                          {order.sellerStoreId.bankAccount.paymentNote && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-xs text-text-muted uppercase mb-1">Catatan Penjual</p>
                              <p className="text-sm italic">{order.sellerStoreId.bankAccount.paymentNote}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-warning/10 border border-warning/20 p-3 rounded-md text-sm text-warning-dark mb-4">
                          <p className="font-bold mb-1">Rekening belum diatur</p>
                          <p>Rekening pembayaran belum diatur oleh toko. Silakan hubungi penjual via WhatsApp atau tunggu konfirmasi pembayaran manual.</p>
                        </div>
                      )}
                      
                      <p className="text-sm">Setelah transfer, unggah foto bukti pembayaran pada form di bawah ini agar penjual dapat memverifikasinya.</p>
                    </div>

                    <UploadPaymentForm orderId={order._id.toString()} />
                  </>
                )}

                {order.paymentStatus === "WAITING_REVIEW" && (
                  <div className="bg-warning/10 border border-warning/20 p-4 rounded-md text-sm text-text-main flex items-start">
                    <AlertCircle className="h-5 w-5 text-warning mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Sedang Diverifikasi</p>
                      <p>Bukti pembayaran Anda sedang ditinjau oleh pihak penjual/admin.</p>
                    </div>
                  </div>
                )}

                {order.paymentStatus === "REJECTED" && (
                  <div className="bg-danger/10 border border-danger/20 p-4 rounded-md text-sm text-danger flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Pembayaran Ditolak</p>
                      <p>Bukti pembayaran Anda tidak valid. Silakan unggah kembali bukti pembayaran yang benar atau hubungi penjual.</p>
                      <div className="mt-4">
                        <UploadPaymentForm orderId={order._id.toString()} />
                      </div>
                    </div>
                  </div>
                )}

                {order.paymentStatus === "PAID" && (
                  <div className="bg-success/10 border border-success/20 p-4 rounded-md text-sm text-success-dark flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center mb-2">
                      <CreditCard className="h-5 w-5 text-success-dark" />
                    </div>
                    <p className="font-bold">Pembayaran Berhasil</p>
                    <p className="text-xs mt-1">Lunas pada {order.paidAt ? new Date(order.paidAt).toLocaleDateString("id-ID") : "-"}</p>
                  </div>
                )}

              </CardContent>
            </Card>

            {(order.status === "SHIPPED_MANUAL" || order.status === "READY_TO_PICKUP") && (
              <CompleteOrderForm orderId={order._id.toString()} status={order.status} />
            )}

          </div>
        </div>

        {/* Print-only Footer */}
        <div className="hidden print:block mt-12 text-center text-sm text-text-muted border-t border-border pt-4">
          <p>Terima kasih telah berbelanja di {order.sellerStoreId?.name || "BUMDesMart"}.</p>
          <p>Invoice ini sah dan diterbitkan secara elektronik oleh geraibumdes.com.</p>
        </div>

      </div>
    </div>
  );
}
