"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { LocationSelector } from "@/components/ui/LocationSelector";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CUSTOMER" | "BUMDES_ADMIN">("BUMDES_ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessTypes, setBusinessTypes] = useState<{_id: string, name: string}[]>([]);
  
  useEffect(() => {
    fetch("/api/business-types")
      .then(res => res.json())
      .then(data => setBusinessTypes(data))
      .catch(err => console.error("Gagal memuat jenis usaha:", err));
  }, []);

  // Common Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    // BUMDes Specific
    bumdesName: "",
    village: "",
    district: "",
    regency: "",
    province: "",
    villageCode: "",
    districtCode: "",
    regencyCode: "",
    provinceCode: "",
    businessType: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (loc: any) => {
    setFormData(prev => ({
      ...prev,
      province: loc.provinceName,
      regency: loc.regencyName,
      district: loc.districtName,
      village: loc.villageName,
      provinceCode: loc.provinceCode,
      regencyCode: loc.regencyCode,
      districtCode: loc.districtCode,
      villageCode: loc.villageCode,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        type: role,
        ...formData
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mendaftar. Silakan periksa isian Anda.");
      } else {
        // Auto login after register or redirect to login
        router.push("/login?registered=true");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-surface-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-main">
          Daftarkan Akun Anda
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card>
          <CardContent className="py-8 px-4 sm:px-10">
            {/* Role Selection */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${role === "BUMDES_ADMIN" ? "bg-primary text-surface" : "bg-surface text-text-muted border border-border"}`}
                onClick={() => setRole("BUMDES_ADMIN")}
              >
                Pengelola BUMDes
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${role === "CUSTOMER" ? "bg-primary text-surface" : "bg-surface text-text-muted border border-border"}`}
                onClick={() => setRole("CUSTOMER")}
              >
                Masyarakat Umum
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded relative text-sm" role="alert">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="border-b border-border pb-4 mb-4">
                <h3 className="text-lg font-medium text-text-main mb-4">
                  {role === "BUMDES_ADMIN" ? "Informasi Akun Pengelola" : "Informasi Akun Pribadi"}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main">Nama Lengkap</label>
                    <input name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main">Alamat Email</label>
                    <input name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main">Nomor HP / WhatsApp</label>
                    <input name="phoneNumber" type="tel" required value={formData.phoneNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main">Kata Sandi (Min 8 karakter)</label>
                    <input name="password" type="password" required value={formData.password} onChange={handleChange} minLength={8} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                  </div>
                  {role === "CUSTOMER" && (
                    <div>
                      <label className="block text-sm font-medium text-text-main">Alamat Lengkap (Opsional)</label>
                      <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                    </div>
                  )}
                </div>
              </div>

              {role === "BUMDES_ADMIN" && (
                <div>
                  <h3 className="text-lg font-medium text-text-main mb-4">Informasi BUMDes</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-main">Nama BUMDes</label>
                      <input name="bumdesName" type="text" required value={formData.bumdesName} onChange={handleChange} placeholder="Contoh: BUMDes Makmur Jaya" className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                    </div>
                    
                    <LocationSelector 
                      onLocationChange={handleLocationChange} 
                      layout="vertical"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-text-main">Jenis Usaha Utama</label>
                      <select name="businessType" required value={formData.businessType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface">
                        <option value="">Pilih Jenis Usaha</option>
                        {businessTypes.map(bt => (
                          <option key={bt._id} value={bt.name}>{bt.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-main">Deskripsi Singkat BUMDes</label>
                      <textarea name="description" required rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : (role === "BUMDES_ADMIN" ? "Daftarkan BUMDes" : "Daftar Akun")}
                </Button>
                {role === "BUMDES_ADMIN" && (
                  <p className="mt-3 text-xs text-center text-text-muted">
                    Catatan: Akun BUMDes Anda akan ditinjau oleh Admin geraibumdes.com sebelum dapat berjualan.
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
