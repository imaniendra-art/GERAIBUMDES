"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2, AlertTriangle, Info } from "lucide-react";
import { deleteBumdesProfile } from "@/app/admin/bumdes/actions";

export function BumdesActionButtons({ bumdesId, bumdesName }: { bumdesId: string, bumdesName: string }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const openDeleteModal = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    setProductCount(null);
    setDeleteError("");
    
    try {
      const res = await fetch(`/api/admin/bumdes/${bumdesId}/products-count`);
      const data = await res.json();
      setProductCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch product count", error);
      setDeleteError("Gagal memeriksa status produk BUMDes. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setDeleteError("");
    
    const result = await deleteBumdesProfile(bumdesId);
    
    if (result.success) {
      setIsModalOpen(false);
      router.refresh();
    } else {
      setDeleteError(result.error || "Gagal menghapus BUMDes");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Link href={`/admin/bumdes/${bumdesId}`}>
          <Button variant="outline" size="sm" className="h-8">Detail</Button>
        </Link>
        <Link href={`/admin/bumdes/edit/${bumdesId}`}>
          <Button variant="outline" size="sm" className="h-8 px-2 border-primary/20 text-primary hover:bg-primary/10" title="Edit BUMDes">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 border-danger/20 text-danger hover:bg-danger/10"
          onClick={openDeleteModal}
          title="Hapus BUMDes"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 text-text-main">Konfirmasi Hapus BUMDes</h3>
              
              {isLoading && productCount === null ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-text-muted">Memeriksa data produk...</span>
                </div>
              ) : deleteError && productCount === null ? (
                <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-md mb-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{deleteError}</p>
                </div>
              ) : productCount !== null && productCount > 0 ? (
                <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-md mb-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold mb-1">Tidak Dapat Menghapus BUMDes!</p>
                    <p className="text-sm">
                      BUMDes <strong>{bumdesName}</strong> masih memiliki <strong>{productCount}</strong> produk aktif di marketplace. 
                      Silakan minta pengelola BUMDes untuk menghapus produknya terlebih dahulu, atau Anda dapat menghapusnya melalui Manajemen Produk.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-warning/10 border border-warning/20 text-warning-dark p-4 rounded-md mb-4 flex items-start">
                  <Info className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">
                      Apakah Anda yakin ingin menghapus BUMDes <strong>{bumdesName}</strong>? 
                      Semua data profil dan akun pengelola terkait akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              )}

              {deleteError && productCount !== null && (
                <p className="text-sm text-danger mt-2">{deleteError}</p>
              )}
            </div>
            
            <div className="bg-surface-bg px-6 py-4 flex justify-end gap-3 border-t border-border">
              <Button variant="outline" onClick={closeDeleteModal} disabled={isLoading && productCount !== null}>
                Batal
              </Button>
              
              {productCount !== null && productCount > 0 ? (
                <Link href="/admin/produk">
                  <Button className="bg-primary hover:bg-primary-dark text-white">
                    Kelola Produk
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="bg-danger hover:bg-danger-dark text-white"
                  onClick={handleDelete}
                  disabled={isLoading || productCount === null}
                >
                  {isLoading && productCount !== null ? "Menghapus..." : "Ya, Hapus BUMDes"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
