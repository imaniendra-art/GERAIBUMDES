"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Loader2, UploadCloud } from "lucide-react";

export default function UploadPaymentForm({ orderId }: { orderId: string }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!url.trim()) {
      setError("Masukkan URL bukti pembayaran.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProofUrl: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah bukti pembayaran.");
      }

      alert("Bukti pembayaran berhasil diunggah. Menunggu konfirmasi penjual.");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-danger">{error}</div>}
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">URL Bukti Pembayaran (Google Drive / Link Gambar)</label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-surface border border-border text-text-main rounded-md px-4 py-2 text-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full text-sm">
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />} 
        Unggah Bukti Bayar
      </Button>
    </form>
  );
}
