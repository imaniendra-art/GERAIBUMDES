"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { editUserAccount } from "../../actions";
import { Loader2 } from "lucide-react";

export default function EditAccountForm({ user }: { user: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await editUserAccount(user._id, formData);
      
      if (!result.success) {
        throw new Error(result.error || "Gagal memperbarui akun");
      }

      alert("Akun berhasil diperbarui!");
      router.refresh();
      router.push("/admin/akun");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error-dark p-3 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-main mb-1">
          Nama Lengkap
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={user.name}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-main mb-1">
          Alamat Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-main mb-1">
          Nomor Telepon
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="text"
          defaultValue={user.phoneNumber}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-text-main mb-1">
          Peran (Role)
        </label>
        <select
          id="role"
          name="role"
          defaultValue={user.role}
          required
          className={inputClass}
        >
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="PLATFORM_ADMIN">Platform Admin</option>
          <option value="BUMDES_ADMIN">Admin BUMDes</option>
          <option value="BUMDES_MEMBER">Anggota BUMDes</option>
          <option value="CUSTOMER">Pelanggan</option>
        </select>
      </div>

      <div className="pt-6 border-t border-border flex justify-end">
        <Button type="submit" disabled={isSaving} className="min-w-32">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
