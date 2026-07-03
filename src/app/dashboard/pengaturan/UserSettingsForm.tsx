"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export function UserSettingsForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phoneNumber: initialData.phoneNumber || "",
    password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: "Profil pengguna berhasil diperbarui!" });
        setFormData(prev => ({ ...prev, password: "" })); // Clear password field after success
      } else {
        setMessage({ type: 'error', text: data.error || "Gagal memperbarui profil" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Terjadi kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardContent className="p-6 sm:p-8">
        {message && (
          <div className={`mb-6 px-4 py-3 rounded relative ${message.type === 'success' ? 'bg-success/10 border border-success/20 text-success-dark' : 'bg-danger/10 border border-danger/20 text-danger'}`}>
            <span className="block sm:inline text-sm font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-main mb-1">
              Nama Direktur / Admin Operator
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
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
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-main mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
            />
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-text-main mb-4">Ganti Kata Sandi</h3>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-main mb-1">
                Kata Sandi Baru (Opsional)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin mengubah sandi"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
              />
              <p className="text-xs text-text-muted mt-1">Minimal 8 karakter. Biarkan kosong jika tidak ingin mengubah kata sandi saat ini.</p>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
