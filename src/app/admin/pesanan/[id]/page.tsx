import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, MapPin, Package, FileText, CreditCard } from "lucide-react";

export default async function AdminPesananDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  await dbConnect();

  let order;
  try {
    order = await Order.findById(resolvedParams.id).populate({ path: "sellerStoreId", model: Store, select: "name slug" }).lean();
  } catch {
    notFound();
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
      <div className="mb-8">
        <Link href="/admin/pesanan">
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali
          </span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center">
            Detail Order <span className="ml-2 text-lg font-normal text-text-muted">#{order.orderNumber}</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">{new Date(order.createdAt).toLocaleString("id-ID")}</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-primary/10 text-primary-dark px-3 py-1.5 rounded-md text-xs font-bold uppercase border border-primary/20">
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Rincian Produk */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <div className="bg-surface-bg border-b border-border p-4 flex items-center text-text-main font-bold justify-between">
              <div className="flex items-center"><Package className="h-5 w-5 mr-2 text-text-muted" /> Rincian Produk</div>
              <div className="text-sm font-normal text-text-muted">Penjual: <span className="font-semibold text-text-main">{order.sellerStoreId?.name || "-"}</span></div>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-main">{item.productNameSnapshot}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                        <span>{item.quantity} {item.unit} x Rp {item.price.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <div className="font-bold text-text-main">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-surface-bg border-t border-border p-4 space-y-2">
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Subtotal Produk</span>
                  <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted pb-2 border-b border-border">
                  <span>Ongkos Kirim Manual</span>
                  <span>Rp {order.shippingCost.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 text-earth">
                  <span>Total Tagihan</span>
                  <span>Rp {order.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-text-main mb-4 flex items-center"><MapPin className="h-5 w-5 mr-2 text-text-muted"/> Pembeli & Pengiriman</h3>
              <div className="bg-surface-bg p-4 rounded-md border border-border">
                <p className="font-semibold text-text-main mb-1">{order.buyerName}</p>
                <p className="text-text-muted text-sm mb-2">{order.buyerPhone}</p>
                <p className="text-text-main text-sm leading-relaxed">{order.buyerAddress}</p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Kolom Kanan: Pembayaran & Catatan */}
        <div className="space-y-6">
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-text-main mb-4 flex items-center"><CreditCard className="h-5 w-5 mr-2 text-text-muted"/> Pembayaran</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                  <span className="text-text-muted">Status</span>
                  <span className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-success-dark' : order.paymentStatus === 'REJECTED' ? 'text-danger' : 'text-warning'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                  <span className="text-text-muted">Metode</span>
                  <span className="font-medium text-text-main">{order.paymentMethod}</span>
                </div>
              </div>

              {order.paymentProofUrl && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-text-muted uppercase mb-2">Bukti Pembayaran</p>
                  <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block text-center bg-primary/10 text-primary-dark font-medium py-2 rounded border border-primary/20 hover:bg-primary/20 transition-colors">
                    Lihat URL Bukti Bayar
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-text-main mb-4 flex items-center"><FileText className="h-5 w-5 mr-2 text-text-muted"/> Catatan</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase mb-1">Catatan Pembeli</p>
                  <p className="text-sm text-text-main bg-surface-bg p-3 rounded-md border border-border min-h-[40px] whitespace-pre-wrap">
                    {order.buyerNote || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase mb-1">Catatan Penjual</p>
                  <p className="text-sm text-text-main bg-surface-bg p-3 rounded-md border border-border min-h-[40px] whitespace-pre-wrap">
                    {order.sellerNote || "-"}
                  </p>
                </div>
                
                {(order.manualShippingNote || order.shippingProvider || order.trackingNumber || order.shippingContact) && (
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase mb-1">Info Pengiriman Manual</p>
                    <div className="bg-surface-bg p-3 rounded-md border border-border text-sm space-y-2">
                      {order.shippingProvider && <p><span className="text-text-muted">Kurir:</span> {order.shippingProvider}</p>}
                      {order.trackingNumber && <p><span className="text-text-muted">Resi:</span> {order.trackingNumber}</p>}
                      {order.shippingContact && <p><span className="text-text-muted">Kontak:</span> {order.shippingContact}</p>}
                      {order.manualShippingNote && <p className="pt-1 mt-1 border-t border-border/50"><span className="text-text-muted block mb-1">Catatan:</span> {order.manualShippingNote}</p>}
                    </div>
                  </div>
                )}
                
                {order.shippingProofUrl && (
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase mb-1">Bukti Pengiriman</p>
                    <a href={order.shippingProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">Lihat Dokumen Pengiriman ↗</a>
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
