"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, calculateActivePrice } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Store as StoreIcon, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";

interface CheckoutFormProps {
  storeId: string;
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
  };
}

export default function CheckoutForm({ storeId, user }: CheckoutFormProps) {
  const router = useRouter();
  const cartStore = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    address: "",
    buyerNote: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="text-center py-10">Memuat...</div>;
  }

  const storeItems = cartStore.items.filter(item => item.storeId === storeId);
  const storeName = storeItems.length > 0 ? storeItems[0].storeName : "";

  if (storeItems.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-lg border border-border">
        <h2 className="text-xl font-bold mb-2">Item Tidak Ditemukan</h2>
        <p className="text-text-muted mb-6">Keranjang Anda untuk BUMDes ini kosong.</p>
        <Button onClick={() => router.push("/keranjang")}>Kembali ke Keranjang</Button>
      </div>
    );
  }

  const subtotal = storeItems.reduce((acc, item) => {
    const { price } = calculateActivePrice(item);
    return acc + (price * item.quantity);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name || !formData.phone || !formData.address) {
      setError("Mohon lengkapi semua data wajib (Nama, Nomor HP, Alamat).");
      setLoading(false);
      return;
    }

    try {
      // Prepare payload
      const orderPayload = {
        storeId,
        buyerName: formData.name,
        buyerPhone: formData.phone,
        buyerAddress: formData.address,
        buyerNote: formData.buyerNote,
        items: storeItems.map(item => {
          const { price, type } = calculateActivePrice(item);
          return {
            productId: item.productId,
            quantity: item.quantity,
            price,
            appliedPriceType: type,
            unit: item.unit,
            productNameSnapshot: item.name,
            productSlugSnapshot: item.slug
          };
        }),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

      // Success
      cartStore.clearStoreCart(storeId);
      router.push(`/pesanan/${data.orderId}`);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form Kiri */}
      <div className="lg:w-2/3">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-text-main mb-6">Detail Pengiriman & Pembeli</h2>
            
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-md mb-6 text-sm">
                {error}
              </div>
            )}

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Nama Lengkap / Instansi BUMDes <span className="text-danger">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface border border-border text-text-main rounded-md px-4 py-2 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Nomor HP / WhatsApp <span className="text-danger">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-surface border border-border text-text-main rounded-md px-4 py-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Alamat Pengiriman Lengkap <span className="text-danger">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nama jalan, nomor rumah/gedung, RT/RW, kelurahan, kecamatan, kabupaten/kota, provinsi, kode pos"
                  className="w-full bg-surface border border-border text-text-main rounded-md px-4 py-2 focus:ring-primary focus:border-primary"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Catatan untuk Penjual (Opsional)</label>
                <textarea
                  rows={2}
                  value={formData.buyerNote}
                  onChange={(e) => setFormData({ ...formData, buyerNote: e.target.value })}
                  placeholder="Contoh: Mohon dipacking kayu, dikirim secepatnya, dll."
                  className="w-full bg-surface border border-border text-text-main rounded-md px-4 py-2 focus:ring-primary focus:border-primary"
                ></textarea>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Ringkasan Kanan */}
      <div className="lg:w-1/3">
        <Card className="sticky top-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-text-main mb-4">Ringkasan Pesanan</h2>
            
            <div className="flex items-center text-sm font-medium text-text-muted mb-4 pb-4 border-b border-border">
              <StoreIcon className="h-4 w-4 mr-2" />
              {storeName}
            </div>

            <div className="space-y-4 mb-6">
              {storeItems.map((item) => {
                const { price, type } = calculateActivePrice(item);
                const itemSubtotal = price * item.quantity;
                return (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-text-main line-clamp-2">{item.name}</p>
                      <p className="text-text-muted text-xs mt-1">
                        {item.quantity} {item.unit} x {formatCurrency(price)}
                      </p>
                      {type === "WHOLESALE" && (
                        <span className="inline-block mt-1 bg-secondary/10 text-secondary-dark text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Grosir</span>
                      )}
                    </div>
                    <div className="font-semibold text-text-main">
                      {formatCurrency(itemSubtotal)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-muted">Subtotal Produk</span>
                <span className="font-semibold text-text-main">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-muted">Ongkos Kirim</span>
                <span className="text-warning text-xs font-semibold px-2 py-1 bg-warning/10 rounded">Menunggu Konfirmasi</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <div className="bg-primary/5 border border-primary/20 p-3 rounded-md mb-4 text-xs text-primary-dark">
                Pesanan ini akan diteruskan ke pihak penjual. Penjual akan meninjau ketersediaan stok dan memasukkan nominal ongkos kirim manual. Anda dapat melakukan pembayaran setelah ongkos kirim ditetapkan.
              </div>
            </div>

            <Button 
              type="submit" 
              form="checkout-form" 
              className="w-full text-lg h-12"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...
                </>
              ) : (
                "Buat Pesanan"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
