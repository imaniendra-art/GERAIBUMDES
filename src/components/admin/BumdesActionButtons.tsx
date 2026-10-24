"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2, AlertTriangle, Info, PauseCircle, PlayCircle, KeyRound, Check } from "lucide-react";
import { deleteBumdesProfile, suspendBumdes, unsuspendBumdes, resetBumdesPassword } from "@/app/admin/bumdes/actions";

interface BumdesActionButtonsProps {
  bumdesId: string;
  bumdesName: string;
  status?: string;
  suspensionReason?: string;
}

export function BumdesActionButtons({
  bumdesId,
  bumdesName,
  status = "VERIFIED",
  suspensionReason = "",
}: BumdesActionButtonsProps) {
  const router = useRouter();
  
  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Suspend modal states
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendReasonInput, setSuspendReasonInput] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspendError, setSuspendError] = useState("");

  // Unsuspend modal states
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false);
  const [isUnsuspending, setIsUnsuspending] = useState(false);
  const [unsuspendError, setUnsuspendError] = useState("");

  // Reset password modal states
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("12345678");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordFeedback, setResetPasswordFeedback] = useState<{ success?: boolean; message?: string }>({});

  // Handlers for Delete
  const openDeleteModal = async () => {
    setIsDeleteModalOpen(true);
    setIsDeleting(true);
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
      setIsDeleting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    
    const result = await deleteBumdesProfile(bumdesId);
    
    if (result.success) {
      setIsDeleteModalOpen(false);
      router.refresh();
    } else {
      setDeleteError(result.error || "Gagal menghapus BUMDes");
      setIsDeleting(false);
    }
  };

  // Handlers for Suspend
  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendReasonInput.trim()) {
      setSuspendError("Alasan penangguhan wajib diisi.");
      return;
    }

    setIsSuspending(true);
    setSuspendError("");

    const result = await suspendBumdes(bumdesId, suspendReasonInput);
    if (result.success) {
      setIsSuspendModalOpen(false);
      setSuspendReasonInput("");
      router.refresh();
    } else {
      setSuspendError(result.error || "Gagal menangguhkan BUMDes.");
      setIsSuspending(false);
    }
  };

  // Handlers for Unsuspend
  const handleUnsuspend = async () => {
    setIsUnsuspending(true);
    setUnsuspendError("");

    const result = await unsuspendBumdes(bumdesId);
    if (result.success) {
      setIsUnsuspendModalOpen(false);
      router.refresh();
    } else {
      setUnsuspendError(result.error || "Gagal mengaktifkan kembali BUMDes.");
      setIsUnsuspending(false);
    }
  };

  // Handlers for Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setResetPasswordFeedback({ success: false, message: "Password minimal 6 karakter." });
      return;
    }

    setIsResettingPassword(true);
    setResetPasswordFeedback({});

    const result = await resetBumdesPassword(bumdesId, newPasswordInput);
    setIsResettingPassword(false);
    if (result.success) {
      setResetPasswordFeedback({ success: true, message: result.message });
      setTimeout(() => {
        setIsResetPasswordModalOpen(false);
        setResetPasswordFeedback({});
      }, 2500);
    } else {
      setResetPasswordFeedback({ success: false, message: result.error || "Gagal mereset password." });
    }
  };

  return (
    <>
      <div className="flex gap-1.5 justify-end items-center">
        {/* Detail Button */}
        <Link href={`/admin/bumdes/${bumdesId}`}>
          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs font-medium">
            Detail
          </Button>
        </Link>

        {/* Edit Button */}
        <Link href={`/admin/bumdes/edit/${bumdesId}`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 border-primary/20 text-primary hover:bg-primary/10" 
            title="Edit Data BUMDes"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </Link>

        {/* Reset Password Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 border-slate-300 text-slate-700 hover:bg-slate-100"
          onClick={() => {
            setIsResetPasswordModalOpen(true);
            setResetPasswordFeedback({});
            setNewPasswordInput("12345678");
          }}
          title="Reset Password Akun Pengelola"
        >
          <KeyRound className="h-3.5 w-3.5" />
        </Button>

        {/* Suspend / Unsuspend Button */}
        {status === "VERIFIED" && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => {
              setIsSuspendModalOpen(true);
              setSuspendError("");
            }}
            title="Tangguhkan (Suspend) BUMDes"
          >
            <PauseCircle className="h-3.5 w-3.5" />
          </Button>
        )}

        {status === "SUSPENDED" && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => {
              setIsUnsuspendModalOpen(true);
              setUnsuspendError("");
            }}
            title="Aktifkan Kembali (Unsuspend) BUMDes"
          >
            <PlayCircle className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Delete Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0 border-danger/20 text-danger hover:bg-danger/10"
          onClick={openDeleteModal}
          title="Hapus BUMDes"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* --- MODAL SUSPEND --- */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden text-left border border-border">
            <form onSubmit={handleSuspend}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 text-amber-600">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <PauseCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">Tangguhkan (Suspend) BUMDes</h3>
                    <p className="text-xs text-text-muted">{bumdesName}</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-md mb-4 leading-relaxed">
                  Menangguhkan BUMDes akan <strong>menonaktifkan toko sementara</strong> dan menyembunyikan semua produknya dari marketplace. Akun pengelola tidak akan dapat mengakses dashboard penjualan sampai Anda mengaktifkannya kembali.
                </div>

                <div className="space-y-2 mb-4">
                  <label className="block text-xs font-semibold text-text-main">
                    Alasan Penangguhan <span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={suspendReasonInput}
                    onChange={(e) => setSuspendReasonInput(e.target.value)}
                    placeholder="Contoh: Laporan ketidaksesuaian produk, kendala operasional desa, atau evaluasi kepatuhan..."
                    className="w-full text-sm border border-border rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-primary bg-surface"
                  />
                  {suspendError && <p className="text-xs text-danger">{suspendError}</p>}
                </div>
              </div>

              <div className="bg-surface-bg px-6 py-3.5 flex justify-end gap-2 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSuspendModalOpen(false)} 
                  disabled={isSuspending}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-medium" 
                  disabled={isSuspending}
                >
                  {isSuspending ? "Memproses..." : "Tangguhkan BUMDes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL UNSUSPEND --- */}
      {isUnsuspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden text-left border border-border">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3 text-emerald-600">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Aktifkan Kembali BUMDes</h3>
                  <p className="text-xs text-text-muted">{bumdesName}</p>
                </div>
              </div>

              {suspensionReason && (
                <div className="bg-surface-bg border border-border p-3 rounded-md text-xs mb-4">
                  <span className="text-text-muted block mb-1 font-semibold">Alasan penangguhan sebelumnya:</span>
                  <p className="italic text-text-main">{suspensionReason}</p>
                </div>
              )}

              <p className="text-sm text-text-main leading-relaxed mb-4">
                Apakah Anda yakin ingin memulihkan status <strong>{bumdesName}</strong>? Toko dan produk-produknya akan otomatis kembali aktif di marketplace.
              </p>

              {unsuspendError && <p className="text-xs text-danger mb-3">{unsuspendError}</p>}
            </div>

            <div className="bg-surface-bg px-6 py-3.5 flex justify-end gap-2 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsUnsuspendModalOpen(false)} 
                disabled={isUnsuspending}
              >
                Batal
              </Button>
              <Button 
                type="button" 
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium" 
                onClick={handleUnsuspend}
                disabled={isUnsuspending}
              >
                {isUnsuspending ? "Mengaktifkan..." : "Ya, Aktifkan Kembali"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL RESET PASSWORD --- */}
      {isResetPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden text-left border border-border">
            <form onSubmit={handleResetPassword}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <KeyRound className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">Reset Password Pengelola</h3>
                    <p className="text-xs text-text-muted">{bumdesName}</p>
                  </div>
                </div>

                <p className="text-xs text-text-muted mb-4">
                  Ganti kata sandi akun pengelola BUMDes jika mereka lupa atau memerlukan akses darurat. Berikan kata sandi baru ini kepada pengurus desa yang sah.
                </p>

                <div className="space-y-2 mb-4">
                  <label className="block text-xs font-semibold text-text-main">
                    Password Baru
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full text-sm font-mono border border-border rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-primary bg-surface"
                  />
                  <p className="text-[11px] text-text-muted">Default: <code>12345678</code></p>
                </div>

                {resetPasswordFeedback.message && (
                  <div className={`p-3 rounded-md text-xs mb-2 flex items-center gap-2 ${
                    resetPasswordFeedback.success 
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                      : "bg-danger/10 text-danger border border-danger/20"
                  }`}>
                    {resetPasswordFeedback.success && <Check className="h-4 w-4" />}
                    <span>{resetPasswordFeedback.message}</span>
                  </div>
                )}
              </div>

              <div className="bg-surface-bg px-6 py-3.5 flex justify-end gap-2 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsResetPasswordModalOpen(false)} 
                  disabled={isResettingPassword}
                >
                  Tutup
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  className="bg-primary hover:bg-primary-dark text-white font-medium" 
                  disabled={isResettingPassword || resetPasswordFeedback.success}
                >
                  {isResettingPassword ? "Menyimpan..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DELETE --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden text-left border border-border">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 text-text-main">Konfirmasi Hapus BUMDes</h3>
              
              {isDeleting && productCount === null ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-text-muted text-sm">Memeriksa data produk...</span>
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
                    <p className="text-xs leading-relaxed">
                      BUMDes <strong>{bumdesName}</strong> masih memiliki <strong>{productCount}</strong> produk aktif di marketplace. 
                      Untuk melindungi data transaksi, silakan <strong>Tangguhkan (Suspend)</strong> BUMDes ini, atau hapus produknya terlebih dahulu melalui Manajemen Produk.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-warning/10 border border-warning/20 text-warning-dark p-4 rounded-md mb-4 flex items-start">
                  <Info className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs leading-relaxed">
                      Apakah Anda yakin ingin menghapus BUMDes <strong>{bumdesName}</strong>? 
                      Semua data profil dan akun pengelola terkait akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              )}

              {deleteError && productCount !== null && (
                <p className="text-xs text-danger mt-2">{deleteError}</p>
              )}
            </div>
            
            <div className="bg-surface-bg px-6 py-3.5 flex justify-end gap-2 border-t border-border">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)} 
                disabled={isDeleting && productCount !== null}
              >
                Batal
              </Button>
              
              {productCount !== null && productCount > 0 ? (
                <Link href="/admin/produk">
                  <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
                    Lihat Produk
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="sm"
                  className="bg-danger hover:bg-danger-dark text-white"
                  onClick={handleDelete}
                  disabled={isDeleting || productCount === null}
                >
                  {isDeleting && productCount !== null ? "Menghapus..." : "Ya, Hapus BUMDes"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
