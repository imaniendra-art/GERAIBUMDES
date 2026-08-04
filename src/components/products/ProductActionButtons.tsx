"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, Edit, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProductActionButtonsProps {
  productId: string;
  productName: string;
  editUrl: string;
  viewUrl?: string;
  status?: string;
}

export function ProductActionButtons({ productId, productName, editUrl, viewUrl, status }: ProductActionButtonsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          router.refresh();
        } else {
          const data = await res.json();
          alert(data.error || "Gagal menghapus produk");
        }
      } catch (error) {
        alert("Terjadi kesalahan sistem");
      } finally {
        setLoading(false);
      }
    }
  };

  const getEditTooltip = () => {
    if (status === "ACTIVE") return "Perubahan produk akan menunggu persetujuan Admin.";
    if (status === "WAITING_APPROVAL" || status === "REJECTED") return "Anda masih dapat mengubah produk sebelum diverifikasi Admin.";
    return "Ubah produk";
  };

  return (
    <div className="flex justify-end gap-2">
      {viewUrl && (
        <Link href={viewUrl}>
          <Button variant="outline" size="sm" title="Tinjau">
            <Eye className="h-4 w-4 mr-1 sm:mr-0" /> <span className="hidden sm:inline-block ml-1">Tinjau</span>
          </Button>
        </Link>
      )}
      <Link href={editUrl}>
        <Button variant="outline" size="sm" title={getEditTooltip()}>
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading} title="Hapus produk">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
