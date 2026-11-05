"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
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
      setError("Silakan unggah foto bukti pembayaran terlebih dahulu.");
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
        <ImageUploader
          label="Foto Bukti Pembayaran / Struk Transfer"
          value={url}
          onChange={(uploadedUrl) => {
            setUrl(uploadedUrl);
            if (uploadedUrl) setError("");
          }}
          folder="payments"
          aspectRatio="square"
          maxDimension={1200}
          helperText="Unggah foto/screenshot bukti transfer atau QRIS. File disimpan otomatis di MinIO."
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full text-sm h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-md"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <UploadCloud className="h-5 w-5 mr-2" />
        )}
        Saya Sudah Transfer
      </Button>
    </form>
  );
}
