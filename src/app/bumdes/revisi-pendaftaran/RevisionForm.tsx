"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { LocationSelector } from "@/components/ui/LocationSelector";
import { AlertTriangle, Clock } from "lucide-react";
import { submitRevision } from "./actions";

export default function RevisionForm({ 
  initialData, 
  rejectionReason, 
  rejectionDate 
}: { 
  initialData: any, 
  rejectionReason: string,
  rejectionDate: string
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessTypes, setBusinessTypes] = useState<{_id: string, name: string}[]>([]);
  
  useEffect(() => {
    fetch("/api/business-types")
      .then(res => res.json())
      .then(data => setBusinessTypes(data))
      .catch(err => console.error("Gagal memuat jenis usaha:", err));
  }, []);

  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (loc: any) => {
    setFormData((prev: any) => ({
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
      const result = await submitRevision(formData);

      if (!result.success) {
        setError(result.error || "Gagal mengajukan ulang pendaftaran. Silakan periksa isian Anda.");
      } else {
        router.push("/bumdes/revisi-pendaftaran/success");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-surface-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        
        {/* Banner Penolakan */}
        <Card className="border-danger/50 shadow-md mb-8 overflow-hidden">
          <div className="bg-danger/10 border-b border-danger/20 p-4 sm:p-6 flex items-start">
            <AlertTriangle className="h-6 w-6 text-danger mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-danger">❌ Pendaftaran Belum Disetujui</h2>
              <p className="mt-1 text-sm text-danger/90">
                Pendaftaran BUMDes Anda belum dapat disetujui. Silakan lakukan perbaikan data berdasarkan catatan Admin kemudian ajukan kembali untuk diverifikasi.
              </p>
            </div>
          </div>
          <CardContent className="p-4 sm:p-6 bg-white">
            <h3 className="text-sm font-bold text-text-main mb-2">Catatan Admin (Alasan Penolakan):</h3>
            <div className="bg-surface-hover p-4 rounded-xl border border-border">
              <p className="text-text-main font-medium">{rejectionReason}</p>
            </div>
          </CardContent>
        </Card>

        <h2 className="mt-2 text-center text-3xl font-extrabold text-text-main">
          Revisi Form Pendaftaran
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Perbaiki data di bawah ini sesuai dengan catatan Admin.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <Card>
          <CardContent className="py-8 px-4 sm:px-10">
            {error && (
              <div className="mb-6 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg relative text-sm font-medium" role="alert">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="border-b border-border pb-6 mb-6">
                <h3 className="text-lg font-bold text-text-main mb-4">Informasi Akun Pengelola</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text-main">Nama Lengkap Pengelola</label>
                    <input name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text-main">Alamat Email (Tidak dapat diubah)</label>
                    <input name="email" type="email" readOnly disabled value={formData.email} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface-hover text-text-muted cursor-not-allowed sm:text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text-main">Nomor HP / WhatsApp</label>
                    <input name="phoneNumber" type="tel" required value={formData.phoneNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-text-main mb-4">Informasi BUMDes</h3>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-main">Nama BUMDes</label>
                    <input name="bumdesName" type="text" required value={formData.bumdesName} onChange={handleChange} placeholder="Contoh: BUMDes Makmur Jaya" className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface" />
                  </div>
                  
                  <div className="bg-surface-hover p-4 rounded-xl border border-border">
                    <h4 className="text-sm font-bold text-text-main mb-3">Wilayah Administrasi</h4>
                    <LocationSelector 
                      onLocationChange={handleLocationChange} 
                      layout="vertical"
                      initialProvinceCode={formData.provinceCode}
                      initialRegencyCode={formData.regencyCode}
                      initialDistrictCode={formData.districtCode}
                      initialVillageCode={formData.villageCode}
                    />
                  </div>
                  
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
                    <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-surface resize-y" />
                  </div>
                </div>
              </div>

              {/* Riwayat Penolakan */}
              <div className="mt-8 border-t border-border pt-6 flex items-center justify-center text-xs text-text-muted font-medium bg-surface-bg p-3 rounded-xl">
                <Clock className="w-4 h-4 mr-2 text-text-muted" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-center">
                  <span>Status Saat Ini: <strong className="text-danger">🔴 Ditolak pada {rejectionDate}</strong></span>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full text-base h-12 shadow-md hover:shadow-lg" disabled={loading}>
                  {loading ? "Memproses..." : "Ajukan Ulang Verifikasi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
