"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteOrder } from "./actions";
import { useRouter } from "next/navigation";

interface DeleteOrderButtonProps {
  orderId: string;
  orderNumber: string;
  variant?: "icon" | "button";
  redirectTo?: string;
}

export function DeleteOrderButton({
  orderId,
  orderNumber,
  variant = "icon",
  redirectTo,
}: DeleteOrderButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus transaksi #${orderNumber}?\n\nTindakan ini akan menghapus riwayat transaksi dari database dan tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await deleteOrder(orderId);
      if (res.success) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      } else {
        alert(res.error || "Gagal menghapus pesanan.");
      }
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center justify-center rounded-lg text-xs font-semibold px-3 py-2 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30 transition-colors disabled:opacity-50"
        title={`Hapus Transaksi #${orderNumber}`}
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        )}
        Hapus Pesanan
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 inline-flex items-center justify-center"
      title={`Hapus Transaksi #${orderNumber}`}
      aria-label={`Hapus Transaksi #${orderNumber}`}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin text-danger" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}

export default DeleteOrderButton;
