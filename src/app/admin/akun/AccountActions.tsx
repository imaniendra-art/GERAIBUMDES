"use client";

import { useState } from "react";
import Link from "next/link";
import { resetUserPassword, deleteUserAccount } from "./actions";
import { Button } from "@/components/ui/Button";
import {
  Key,
  Trash2,
  Loader2,
  Edit,
  X,
  Copy,
  Check,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface AccountActionsProps {
  userId: string;
  userName: string;
  userEmail?: string;
  userRole?: string;
}

export function AccountActions({
  userId,
  userName,
  userEmail,
  userRole,
}: AccountActionsProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Reset form states
  const [resetType, setResetType] = useState<"default" | "custom">("default");
  const [customPassword, setCustomPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{
    success: boolean;
    password?: string;
    message?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Delete states
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleOpenReset = () => {
    setResetType("default");
    setCustomPassword("");
    setResetResult(null);
    setCopied(false);
    setIsResetModalOpen(true);
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetResult(null);

    const passwordToSend = resetType === "custom" ? customPassword.trim() : "12345678";

    if (resetType === "custom" && passwordToSend.length < 6) {
      setResetResult({
        success: false,
        message: "Password kustom minimal harus 6 karakter.",
      });
      setIsResetting(false);
      return;
    }

    const result = await resetUserPassword(userId, passwordToSend);
    setIsResetting(false);

    if (result.success) {
      setResetResult({
        success: true,
        password: result.password,
        message: result.message,
      });
    } else {
      setResetResult({
        success: false,
        message: result.error || "Gagal mereset password.",
      });
    }
  };

  const handleCopyPassword = () => {
    if (resetResult?.password) {
      navigator.clipboard.writeText(resetResult.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExecuteDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    const result = await deleteUserAccount(userId);
    setIsDeleting(false);

    if (result.success) {
      setIsDeleteModalOpen(false);
    } else {
      setDeleteError(result.error || "Gagal menghapus akun.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Link href={`/admin/akun/edit/${userId}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-border hover:bg-surface-bg text-text-muted hover:text-primary transition-colors"
            title="Edit Detail Akun"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenReset}
          className="h-8 w-8 p-0 border-border hover:bg-primary/10 text-text-muted hover:text-primary hover:border-primary/50 transition-colors"
          title="Reset Password Akun"
        >
          <Key className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDeleteError("");
            setIsDeleteModalOpen(true);
          }}
          className="h-8 w-8 p-0 text-danger border-border hover:bg-danger/10 hover:border-danger/40 transition-colors"
          title="Hapus Akun Pengguna"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ============================================================ */}
      {/* MODAL RESET PASSWORD                                         */}
      {/* ============================================================ */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-bg/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">
                    Reset Password
                  </h3>
                  <p className="text-xs text-text-muted line-clamp-1">
                    {userName} {userEmail ? `(${userEmail})` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-surface-bg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            {resetResult?.success ? (
              /* Success Screen with Copy Password */
              <div className="p-6 space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Password Akun Berhasil Direset!
                  </p>
                  <div className="flex items-center justify-between bg-surface p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700">
                    <span className="font-mono text-sm font-bold text-text-main">
                      {resetResult.password}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Salin Password
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    Berikan password ini ke pengelola/admin yang bersangkutan
                    agar mereka dapat login kembali.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="w-full text-xs"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            ) : (
              /* Form Options */
              <form onSubmit={handleExecuteReset} className="p-6 space-y-4">
                {resetResult?.success === false && (
                  <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{resetResult.message}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-main block">
                    Pilih Metode Reset:
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-surface-bg/60 transition-colors">
                    <input
                      type="radio"
                      name="resetType"
                      checked={resetType === "default"}
                      onChange={() => setResetType("default")}
                      className="mt-0.5 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-bold text-text-main block">
                        Gunakan Password Default Standar
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Password akan diubah menjadi: <strong className="font-mono text-text-main">12345678</strong>
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-surface-bg/60 transition-colors">
                    <input
                      type="radio"
                      name="resetType"
                      checked={resetType === "custom"}
                      onChange={() => setResetType("custom")}
                      className="mt-0.5 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-text-main block">
                        Tentukan Password Baru Kustom
                      </span>
                      <span className="text-[11px] text-text-muted block mb-2">
                        Ketikkan password baru yang diminta pengguna.
                      </span>

                      {resetType === "custom" && (
                        <div className="relative">
                          <input
                            type="text"
                            required
                            minLength={6}
                            value={customPassword}
                            onChange={(e) => setCustomPassword(e.target.value)}
                            placeholder="Ketik password baru (min. 6 karakter)..."
                            className="w-full text-xs px-3 py-2 pl-8 border rounded-lg bg-surface-bg text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                          <Lock className="h-3.5 w-3.5 text-text-muted absolute left-2.5 top-2.5" />
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResetModalOpen(false)}
                    disabled={isResetting}
                    className="flex-1 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 text-xs font-semibold"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Mereset...
                      </>
                    ) : (
                      "Reset Sekarang"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL HAPUS AKUN                                             */}
      {/* ============================================================ */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="p-3 bg-danger/10 text-danger rounded-2xl w-fit">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-text-main">
                  Hapus Akun Pengguna?
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Anda akan menghapus akun{" "}
                  <strong className="text-text-main">{userName}</strong>
                  {userEmail ? ` (${userEmail})` : ""}.
                </p>
                <div className="mt-3 p-3 bg-danger/5 border border-danger/20 rounded-xl text-xs text-danger space-y-1">
                  <p className="font-semibold">Perhatian:</p>
                  <p>
                    Aksi ini bersifat permanen. Jika akun ini terhubung dengan
                    BUMDes, profil dan toko terkait beserta produknya juga akan
                    terhapus.
                  </p>
                </div>
              </div>

              {deleteError && (
                <p className="text-xs text-danger font-medium">{deleteError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleExecuteDelete}
                  disabled={isDeleting}
                  className="flex-1 text-xs font-semibold"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus Akun"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AccountActions;
