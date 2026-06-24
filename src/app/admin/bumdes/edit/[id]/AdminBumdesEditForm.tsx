"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updateBumdesProfile } from "../../actions";

export default function AdminBumdesEditForm({ bumdesId, profile }: { bumdesId: string, profile: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    console.log("PAYLOAD SEBELUM DIKIRIM:", payload);

    try {
      const result = await updateBumdesProfile(bumdesId, formData);
      
      if (!result.success) {
        throw new Error(result.error || "Gagal menyimpan perubahan");
      }

      alert("Profil BUMDes berhasil diperbarui!");
      router.refresh();
      router.push("/admin/bumdes");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      alert("Gagal: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error-dark p-3 rounded text-sm mb-4">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-main mb-1">
          Nama BUMDes
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={profile.name || ""}
          required
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
        />
      </div>

      <div>
        <label htmlFor="directorName" className="block text-sm font-medium text-text-main mb-1">
          Nama Direktur/Ketua
        </label>
        <input
          id="directorName"
          name="directorName"
          type="text"
          defaultValue={profile.directorName || ""}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
        />
      </div>

      <div>
        <label htmlFor="contactNumber" className="block text-sm font-medium text-text-main mb-1">
          Nomor Telepon/WhatsApp
        </label>
        <input
          id="contactNumber"
          name="contactNumber"
          type="text"
          defaultValue={profile.contactNumber || ""}
          required
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-main mb-1">
          Deskripsi Singkat
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={profile.description || ""}
          required
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
        />
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-dark min-w-32">
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
