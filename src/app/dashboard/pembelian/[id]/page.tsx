import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  ArrowLeft, 
  Store as StoreIcon, 
  CreditCard, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle, 
  Package, 
  Truck, 
  Info, 
  Phone, 
  Receipt 
} from "lucide-react";
import UploadPaymentForm from "@/app/pesanan/[id]/UploadPaymentForm";
import { CompleteOrderForm } from "@/app/pesanan/[id]/BuyerActionClient";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { PrintButton } from "@/components/ui/PrintButton";

const getBuyerStatusLabel = (status: string) => {
  switch (status) {
    case "WAITING_SELLER_CONFIRMATION": return "Menunggu Respon Penjual";
    case "WAITING_PAYMENT": return "Menunggu Pembayaran";
    case "PAYMENT_REVIEW": return "Pembayaran Sedang Dicek";
    case "PROCESSING": return "Pesanan Diproses";
    case "READY_TO_PICKUP":
    case "SHIPPED_MANUAL": return "Pesanan Sedang Dikirim";
    case "COMPLETED": return "Pesanan Selesai";
    case "CANCELLED": return "Pesanan Dibatalkan";
    default: return status;
  }
};

const getTimelineStep = (status: string) => {
  if (status === "CANCELLED") return -1;
  if (status === "WAITING_SELLER_CONFIRMATION") return 1;
  if (status === "WAITING_PAYMENT" || status === "PAYMENT_REVIEW") return 2;
  if (status === "PROCESSING") return 3;
  if (status === "READY_TO_PICKUP" || status === "SHIPPED_MANUAL") return 4;
  if (status === "COMPLETED") return 5;
  return 0;
};

const formatWhatsAppUrl = (phone?: string) => {
  if (!phone) return "#";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = "62" + cleaned.substring(1);
  return `https://wa.me/${cleaned}`;
};

export default async function DashboardPembelianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();

  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();

  let order;
  try {
    order = await Order.findOne({ _id: resolvedParams.id, buyerId: session.userId })
      .populate({ path: "sellerStoreId", model: Store, select: "name slug bankAccount phoneNumber whatsappNumber" })
      .lean();
  } catch {
    notFound();
  }

  if (!order) {
    notFound();
  }

  const storeWa = order.sellerStoreId?.whatsappNumber || order.sellerStoreId?.phoneNumber;
  const currentStep = getTimelineStep(order.status);
  const statusLabel = getBuyerStatusLabel(order.status);

  return (
    <div className="w-full space-y-6">
      {/* Navigation Top */}
      <div className="flex justify-between items-center print:hidden">
        <Link href="/dashboard/pembelian">
          <Button variant="ghost" className="rounded-xl text-sm font-semibold transition-colors duration-200 h-10 px-4 text-text-muted hover:text-text-main hover:bg-surface border border-border shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Pembelian Saya
          </Button>
        </Link>
        {order.status === "COMPLETED" && (
          <PrintButton label="Cetak Kwitansi" href={`/cetak/${order._id}`} />
        )}
      </div>

      {/* Header Info */}
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            Detail Pembelian B2B
          </h1>
          <p className="text-sm text-text-muted mt-1.5 font-medium">
            No. Pesanan: <span className="text-text-main font-bold">#{order.orderNumber}</span> • Dibuat pada {formatDate(order.createdAt)}
          </p>
        </div>
        <div>
          <span className="bg-primary/10 text-primary-dark px-4 py-2 rounded-xl text-sm font-bold border border-primary/20 shadow-sm inline-flex items-center">
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Action / Next Step Cards */}
      {order.status === "WAITING_SELLER_CONFIRMATION" && (
        <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
          <div className="bg-primary/10 px-6 py-4 border-b border-primary/20 flex items-center gap-3">
            <Info className="h-6 w-6 text-primary-dark" />
            <h2 className="font-bold text-primary-dark text-lg">Langkah Selanjutnya</h2>
          </div>
          <CardContent className="p-6">
            <p className="text-text-main font-medium mb-6 text-base whitespace-pre-wrap leading-relaxed">
              BUMDes Penjual sedang memeriksa stok dan menghitung ongkos kirim.
              <br /><br />
              Silakan tunggu konfirmasi dari penjual. Apabila diperlukan, Anda dapat menghubungi penjual melalui WhatsApp.
            </p>
            {storeWa && (
              <a href={formatWhatsAppUrl(storeWa)} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl h-11 px-6 shadow-md transition-all font-bold w-full sm:w-auto">
                  <Phone className="h-5 w-5 mr-2" />
                  Hubungi Penjual via WhatsApp
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {order.status === "WAITING_PAYMENT" && (
        <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
          <div className="bg-success/10 px-6 py-4 border-b border-success/20 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-success-dark" />
            <h2 className="font-bold text-success-dark text-lg">Pesanan telah dikonfirmasi penjual</h2>
          </div>
          <CardContent className="p-6">
            <p className="text-text-main font-medium text-base mb-4">
              Silakan hubungi BUMDes Penjual melalui WhatsApp untuk konfirmasi rekening dan pengiriman:
            </p>
            <ul className="list-disc list-inside text-text-main font-medium text-sm mb-6 space-y-1">
              <li>Total tagihan: <strong className="text-primary">{formatCurrency(order.total)}</strong></li>
              <li>Nomor rekening pembayaran</li>
              <li>Instruksi pengiriman barang</li>
            </ul>
            <p className="text-text-main font-medium text-sm mb-6">
              Setelah melakukan transfer, silakan unggah bukti transfer pada form di bawah.
            </p>
            {storeWa && (
              <a href={formatWhatsAppUrl(storeWa)} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl h-11 px-6 shadow-md transition-all font-bold w-full sm:w-auto">
                  <Phone className="h-5 w-5 mr-2" />
                  Hubungi Penjual via WhatsApp
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {order.status === "PAYMENT_REVIEW" && (
        <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
          <div className="bg-info/10 px-6 py-4 border-b border-info/20 flex items-center gap-3">
            <Clock className="h-6 w-6 text-info-dark" />
            <h2 className="font-bold text-info-dark text-lg">Langkah Selanjutnya</h2>
          </div>
          <CardContent className="p-6">
            <p className="text-text-main font-medium text-base">
              Bukti pembayaran Anda sedang dicek oleh pihak BUMDes penjual. Harap tunggu konfirmasi.
            </p>
          </CardContent>
        </Card>
      )}

      {order.status === "PROCESSING" && (
        <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
          <div className="bg-primary/10 px-6 py-4 border-b border-primary/20 flex items-center gap-3">
            <Package className="h-6 w-6 text-primary-dark" />
            <h2 className="font-bold text-primary-dark text-lg">Langkah Selanjutnya</h2>
          </div>
          <CardContent className="p-6">
            <p className="text-text-main font-medium text-base">
              Pembayaran berhasil dikonfirmasi. Penjual sedang menyiapkan pesanan Anda untuk segera dikirim atau disiapkan untuk diambil.
            </p>
          </CardContent>
        </Card>
      )}

      {(order.status === "SHIPPED_MANUAL" || order.status === "READY_TO_PICKUP") && (
        <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
          <div className="bg-earth/10 px-6 py-4 border-b border-earth/20 flex items-center gap-3">
            <Truck className="h-6 w-6 text-earth" />
            <h2 className="font-bold text-earth text-lg">Langkah Selanjutnya</h2>
          </div>
          <CardContent className="p-6">
            <p className="text-text-main font-medium text-base mb-6">
              Pesanan Anda sedang dalam perjalanan atau sudah siap diambil. Pastikan Anda menerima barang dengan baik sebelum menandai pesanan selesai.
            </p>
            <CompleteOrderForm orderId={order._id.toString()} status={order.status} />
          </CardContent>
        </Card>
      )}

      {order.status === "COMPLETED" && (
        <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
          <div className="bg-success/10 px-6 py-4 border-b border-success/20 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-success-dark" />
            <h2 className="font-bold text-success-dark text-lg">Pesanan Selesai</h2>
          </div>
          <CardContent className="p-6">
            <p className="text-text-main font-medium text-base">
              Transaksi telah selesai. Terima kasih telah melakukan transaksi antar-BUMDes!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Simplified Timeline */}
      {order.status !== "CANCELLED" && (
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-0 w-full h-1 bg-border -z-10 rounded-full"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500" 
              style={{ width: `${(Math.max(0, currentStep - 1) / 4) * 100}%` }}
            ></div>
            
            {[
              { step: 1, title: "Dibuat", icon: FileText, desc: "Pesanan masuk" },
              { step: 2, title: "Pembayaran", icon: CreditCard, desc: "Tagihan & bukti" },
              { step: 3, title: "Diproses", icon: Package, desc: "Disiapkan penjual" },
              { step: 4, title: "Dikirim", icon: Truck, desc: "Sedang dikirim" },
              { step: 5, title: "Selesai", icon: CheckCircle, desc: "Barang diterima" },
            ].map((item) => {
              const isCompleted = currentStep > item.step;
              const isCurrent = currentStep === item.step;

              return (
                <div key={item.step} className="flex flex-col items-center flex-1 relative bg-surface">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface shadow-sm transition-colors duration-300 ${
                    isCompleted ? "bg-primary text-white" :
                    isCurrent ? "bg-primary text-white ring-4 ring-primary/20" :
                    "bg-surface-bg text-text-muted"
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className={`text-xs sm:text-sm font-bold ${isCurrent || isCompleted ? "text-text-main" : "text-text-muted"}`}>{item.title}</p>
                    <p className="text-[11px] text-text-muted hidden sm:block mt-1 font-medium">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detail Produk (Invoice Items) */}
          <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
            <div className="bg-surface-bg border-b border-border p-5 flex justify-between items-center">
              <div className="flex items-center text-text-main font-bold text-base sm:text-lg">
                <StoreIcon className="h-5 w-5 mr-3 text-primary" />
                Penjual: {order.sellerStoreId?.name || "Toko BUMDes"}
              </div>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-text-main text-base mb-1">{item.productNameSnapshot}</h3>
                      <div className="flex items-center gap-2 mb-2 text-sm text-text-muted font-medium">
                        <span>{item.quantity} {item.unit} x {formatCurrency(item.price)}</span>
                        {item.appliedPriceType === "WHOLESALE" && (
                          <span className="bg-secondary/10 text-secondary-dark text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-secondary/20">Harga Grosir</span>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right font-bold text-text-main text-lg pt-1 sm:pt-0">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-surface-bg border-t border-border p-5 sm:p-6 space-y-3">
                <div className="flex justify-between text-sm text-text-muted font-medium">
                  <span>Subtotal Produk</span>
                  <span className="text-text-main">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted font-medium pb-4 border-b border-border">
                  <span>Ongkos Kirim</span>
                  <span className="text-text-main">
                    {order.status === "WAITING_SELLER_CONFIRMATION" 
                      ? <span className="text-warning-dark text-xs font-bold px-2 py-1 bg-warning/10 rounded-md">Menunggu Konfirmasi Penjual</span>
                      : formatCurrency(order.shippingCost)
                    }
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-2">
                  <span className="text-text-main">Total Tagihan</span>
                  <span className="text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Catatan Pesanan */}
          <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-bold text-text-main mb-6 text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2.5 text-text-muted"/> Catatan Pesanan
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Catatan Anda (Pembeli)</p>
                  <p className="text-sm font-medium text-text-main bg-surface-bg p-4 rounded-xl border border-border min-h-[48px] whitespace-pre-wrap">
                    {order.buyerNote || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Pesan dari Penjual</p>
                  <p className="text-sm font-medium text-text-main bg-surface-bg p-4 rounded-xl border border-border min-h-[48px] whitespace-pre-wrap">
                    {order.manualShippingNote || order.sellerNote || "Belum ada catatan dari penjual."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Columns */}
        <div className="space-y-6">
          
          {/* Informasi Pembayaran */}
          <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-bold text-text-main mb-6 text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2.5 text-text-muted"/> Informasi Pembayaran
              </h3>
              
              {order.status === "WAITING_SELLER_CONFIRMATION" && (
                <div className="text-sm font-medium text-text-muted text-center p-4 bg-surface-bg rounded-xl border border-border">
                  Instruksi pembayaran akan muncul setelah ongkos kirim dikonfirmasi oleh penjual.
                </div>
              )}

              {order.status === "WAITING_PAYMENT" && order.paymentStatus === "UNPAID" && (
                <div className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl text-sm text-text-main">
                    <p className="mb-4 font-medium leading-relaxed">
                      Transfer sebesar <strong className="text-lg text-primary">{formatCurrency(order.total)}</strong> ke rekening BUMDes:
                    </p>
                    
                    {order.sellerStoreId?.bankAccount?.bankAccountNumber ? (
                      <div className="bg-surface p-4 border border-border rounded-xl shadow-sm">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Bank</p>
                        <p className="font-bold text-base mb-3">{order.sellerStoreId.bankAccount.bankName}</p>
                        
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Nomor Rekening</p>
                        <p className="font-mono text-lg mb-3 font-bold tracking-wider text-primary bg-surface-bg p-2 rounded-lg inline-block border border-border">
                          {order.sellerStoreId.bankAccount.bankAccountNumber}
                        </p>
                        
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Atas Nama</p>
                        <p className="font-bold text-base">{order.sellerStoreId.bankAccount.bankAccountHolderName}</p>

                        {order.sellerStoreId.bankAccount.paymentNote && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Catatan</p>
                            <p className="text-xs font-medium italic text-text-muted">{order.sellerStoreId.bankAccount.paymentNote}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl text-sm text-warning-dark">
                        <p className="font-bold mb-1">Rekening belum diatur</p>
                        <p className="text-xs">Hubungi penjual via WhatsApp untuk meminta nomor rekening BUMDes.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <p className="text-sm font-bold text-text-main mb-3">Sudah transfer? Konfirmasi di sini</p>
                    <UploadPaymentForm orderId={order._id.toString()} />
                  </div>
                </div>
              )}

              {order.paymentStatus === "REJECTED" && (
                <div className="space-y-6">
                  <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl text-sm text-danger-dark font-medium">
                    <p className="font-bold mb-1">Pembayaran Ditolak</p>
                    <p>Bukti yang Anda unggah tidak valid. Silakan unggah kembali bukti pembayaran yang benar.</p>
                  </div>
                  <UploadPaymentForm orderId={order._id.toString()} />
                </div>
              )}

              {(order.paymentStatus === "PAID" || order.paymentStatus === "WAITING_REVIEW") && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-sm font-bold text-text-muted uppercase">Status Pembayaran</span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.paymentStatus === 'PAID' ? 'bg-success/10 text-success-dark' : 'bg-warning/10 text-warning-dark'}`}>
                      {order.paymentStatus === 'PAID' ? 'Lunas' : 'Sedang Dicek'}
                    </span>
                  </div>
                  {order.paymentProofUrl && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Bukti Transfer</p>
                      <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-bold text-primary hover:text-primary-dark transition-colors bg-primary/5 p-3 rounded-lg border border-primary/20">
                        <Receipt className="h-5 w-5 mr-2" />
                        Lihat Bukti Terunggah
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Pengiriman */}
          <Card className="border-border rounded-2xl shadow-sm bg-surface overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-bold text-text-main mb-6 text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2.5 text-text-muted"/> Info Pengiriman
              </h3>
              <div className="space-y-4 text-sm font-medium">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Penerima</p>
                  <p className="font-bold text-base text-text-main">{order.buyerName}</p>
                  <p className="text-text-muted mt-0.5">{order.buyerPhone}</p>
                </div>
                <div className="pt-3">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Alamat Tujuan</p>
                  <p className="text-text-main whitespace-pre-wrap leading-relaxed">{order.buyerAddress}</p>
                </div>
                
                {(order.status === "SHIPPED_MANUAL" || order.status === "COMPLETED") && (
                  <div className="mt-4 pt-5 border-t border-border space-y-4">
                    <h4 className="font-bold text-text-main text-sm">Detail Ekspedisi / Kurir</h4>
                    
                    {order.shippingProvider && (
                      <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Kurir / Armada</p>
                        <p className="font-bold text-text-main">{order.shippingProvider}</p>
                      </div>
                    )}
                    
                    {order.trackingNumber && (
                      <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">No. Resi / Plat</p>
                        <p className="font-bold text-text-main bg-surface-bg px-3 py-1.5 rounded-lg inline-block border border-border">{order.trackingNumber}</p>
                      </div>
                    )}

                    {order.shippingContact && (
                      <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Kontak Kurir</p>
                        <p className="font-bold text-text-main">{order.shippingContact}</p>
                      </div>
                    )}

                    {order.shippingProofUrl && (
                      <div className="pt-2">
                        <a href={order.shippingProofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-bold text-primary hover:underline transition-colors bg-primary/5 p-3 rounded-lg border border-primary/20">
                          <Truck className="h-5 w-5 mr-2" />
                          Lihat Foto Pengiriman
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
