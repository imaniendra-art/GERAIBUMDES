"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { addBumdesAccount } from "./actions";

export default function TambahBumdesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await addBumdesAccount(formData);

    if (result.success) {
      router.push("/admin/akun?tab=bumdes");
    } else {
      setError(result.error || "Gagal menambahkan BUMDes.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Tambah Akun BUMDes</h1>
          <p className="text-text-muted mt-1">Buat akun untuk pengelola BUMDes. Profil dan lokasi BUMDes dapat dilengkapi kemudian oleh pengelola.</p>
        </div>
        <Link href="/admin/akun?tab=bumdes">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8">
          {error && (
            <div className="mb-6 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded relative">
              <span className="block sm:inline text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-primary">Informasi Dasar Akun</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-main mb-1">
                    Nama Lengkap Pengelola
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
                  <p className="text-xs text-text-muted mt-1">Default sandi adalah 12345678.</p>
                </div>

                <div className="md:col-span-2 mt-2">
                  <label htmlFor="bumdesName" className="block text-sm font-medium text-text-main mb-1">
                    Nama BUMDes
                  </label>
                  <input
                    id="bumdesName"
                    name="bumdesName"
                    type="text"
                    required
                    placeholder="Contoh: BUMDes Makmur Jaya"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
                  />
                  <p className="text-xs text-text-muted mt-1">Hanya nama BUMDes. Lokasi, jenis usaha, dan detail lain akan diisi oleh pengelola setelah login.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary-dark" disabled={loading}>
                {loading ? "Menyimpan..." : "Buat Akun BUMDes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
