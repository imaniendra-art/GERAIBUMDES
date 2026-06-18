"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Loader2, CheckCircle } from "lucide-react";

export function CompleteOrderForm({ orderId, status }: { orderId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const isPickup = status === "READY_TO_PICKUP";
  const title = isPickup ? "Pesanan Telah Diambil?" : "Pesanan Telah Tiba?";
  const desc = isPickup
    ? "Jika Anda sudah datang ke BUMDes dan mengambil pesanan Anda dengan baik, silakan unggah foto bukti penerimaan dan selesaikan transaksi ini agar dana dapat diteruskan."
    : "Jika Anda sudah menerima pesanan dengan baik dan sesuai, silakan unggah foto bukti penerimaan dan selesaikan transaksi ini agar dana dapat diteruskan ke BUMDes.";
  const confirmMsg = isPickup
    ? "Apakah Anda yakin sudah mengambil pesanan di toko dan ingin menandai pesanan ini selesai?"
    : "Apakah Anda yakin pesanan sudah diterima dan ingin menandai pesanan ini selesai?";

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Mohon unggah / masukkan URL foto bukti penerimaan barang.");
      return;
    }
    setError("");

    if (!confirm(confirmMsg)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/buyer-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_COMPLETED", receiptProofUrl: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyelesaikan pesanan");
      
      alert("Pesanan berhasil diselesaikan. Terima kasih!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleComplete} className="bg-gradient-to-br from-success/10 to-success/5 border border-success/30 p-6 rounded-xl text-center mt-8 shadow-sm">
      <div className="bg-success/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-success-dark" />
      </div>
      <h4 className="font-extrabold text-lg text-text-main mb-2">{title}</h4>
      <p className="text-sm text-text-muted mb-4 px-4">
        {desc}
      </p>

      {error && <div className="text-sm text-danger mb-4 bg-danger/10 p-2 rounded">{error}</div>}

      <div className="text-left mb-6 px-4">
        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase text-center">URL Foto Bukti Barang Diterima (Wajib)</label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-surface border border-border text-text-main rounded-md px-4 py-2 text-sm focus:ring-success focus:border-success"
        />
        <p className="text-[10px] text-text-muted mt-1 text-center">Masukkan tautan foto barang (Google Drive / Link Foto) untuk perlindungan keamanan bersama.</p>
      </div>

      <Button 
        type="submit"
        disabled={loading} 
        className="w-full sm:w-auto bg-success hover:bg-success-dark text-white font-bold h-auto py-3.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all text-base"
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
        Tandai Pesanan Selesai
      </Button>
    </form>
  );
}
