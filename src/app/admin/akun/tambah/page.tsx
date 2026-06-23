"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { addAdminAccount } from "../actions";

export default function TambahAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await addAdminAccount(formData);

    if (result.success) {
      router.push("/admin/akun?tab=admin");
    } else {
      setError(result.error || "Gagal menambahkan admin.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Tambah Admin Baru</h1>
          <p className="text-text-muted mt-1">Buat akun untuk tim pengelola sistem GeraiBumdes.</p>
        </div>
        <Link href="/admin/akun?tab=admin">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-8">
          {error && (
            <div className="mb-6 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded relative">
              <span className="block sm:inline text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-main mb-1">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
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
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
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
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-main mb-1">
                Kata Sandi Sementara
              </label>
              <input
                id="password"
                name="password"
                type="text"
                required
                defaultValue="12345678"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
              />
              <p className="text-xs text-text-muted mt-1">Default sandi adalah 12345678. Admin bisa mengubahnya nanti.</p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-main mb-1">
                Peran (Role)
              </label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
              >
                <option value="PLATFORM_ADMIN">PLATFORM_ADMIN (Admin Biasa)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Penuh Hak Akses)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border">
              <Button type="submit" className="w-full bg-primary hover:bg-primary-dark" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Akun Admin"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
