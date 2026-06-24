"use client";

import { useState } from "react";
import Link from "next/link";
import { resetUserPassword, deleteUserAccount } from "./actions";
import { Button } from "@/components/ui/Button";
import { RefreshCw, Key, Trash2, Loader2 } from "lucide-react";

export function AccountActions({ userId, userName }: { userId: string, userName: string }) {
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleReset = async () => {
    if (!confirm(`Anda yakin ingin mereset password akun ${userName} menjadi 12345678?`)) {
      return;
    }

    setIsResetting(true);
    setMessage(null);

    const result = await resetUserPassword(userId);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Berhasil' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Gagal' });
    }

    setIsResetting(false);

    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleDelete = async () => {
    if (!confirm(`Peringatan: Anda yakin ingin MENGHAPUS PERMANEN akun ${userName}? Aksi ini tidak dapat dibatalkan.`)) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    const result = await deleteUserAccount(userId);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Berhasil dihapus' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Gagal menghapus' });
    }

    setIsDeleting(false);

    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Link href={`/admin/akun/edit/${userId}`}>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isResetting || isDeleting}
            className="text-xs py-1 h-8"
          >
            Edit
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset} 
          disabled={isResetting || isDeleting}
          className="text-xs py-1 h-8"
        >
          {isResetting ? <RefreshCw className="h-3 w-3 mr-2 animate-spin" /> : <Key className="h-3 w-3 mr-2" />}
          Reset Pass (12345678)
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDelete} 
          disabled={isResetting || isDeleting}
          className="text-xs py-1 h-8 text-danger border-danger hover:bg-danger/10"
        >
          {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </Button>
      </div>
      {message && (
        <span className={`text-[10px] font-medium ${message.type === 'success' ? 'text-success' : 'text-danger'}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}
