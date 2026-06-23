"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Store, Building, MapPin, Landmark, Phone, ImageIcon, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { LocationSelector } from "@/components/ui/LocationSelector";

export default function StoreEditForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialData);

  const inputClass = "w-full bg-surface border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm";
  const labelClass = "block text-sm font-medium text-text-main mb-1.5";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("bank_")) {
      const field = name.split("_")[1];
      setFormData((prev: any) => ({
        ...prev,
        bankAccount: { ...prev.bankAccount, [field]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
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
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengaturan");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/dashboard">
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
          </span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-main">Edit Profil BUMDes</h1>
          <p className="text-text-muted">Perbarui informasi dan rekening pembayaran BUMDes Anda.</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error-dark p-3 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Info Dasar & Media */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <Store className="h-5 w-5 mr-2 text-primary" /> Informasi Dasar
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>Nama BUMDes *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Deskripsi BUMDes</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className={inputClass} placeholder="Ceritakan keunggulan produk dan BUMDes Anda..."></textarea>
            </div>
            
            <div className="space-y-4 pt-2">
              <div>
                <label className={labelClass}>URL Logo (Opsional)</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="https://..." />
                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  </div>
                </div>
                {formData.logoUrl && (
                  <div className="mt-3 h-20 w-20 bg-surface-bg border rounded-md overflow-hidden shadow-sm">
                    <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>URL Banner (Opsional)</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input type="text" name="bannerUrl" value={formData.bannerUrl} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="https://..." />
                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  </div>
                </div>
                {formData.bannerUrl && (
                  <div className="mt-3 h-20 w-full bg-surface-bg border rounded-md overflow-hidden shadow-sm">
                    <img src={formData.bannerUrl} alt="Banner preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lokasi & Kontak */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" /> Lokasi & Kontak Operasional
            </h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nomor WhatsApp</label>
                <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className={inputClass} placeholder="08..." />
              </div>
              <div>
                <label className={labelClass}>Telepon (Opsional)</label>
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>Alamat Lengkap Operasional</label>
              <textarea name="address" rows={3} value={formData.address} onChange={handleChange} className={inputClass} placeholder="Jalan, RT/RW..."></textarea>
            </div>

            <LocationSelector
              onLocationChange={handleLocationChange}
              layout="horizontal"
              initialProvinceCode={formData.provinceCode || ""}
              initialRegencyCode={formData.regencyCode || ""}
              initialDistrictCode={formData.districtCode || ""}
              initialVillageCode={formData.villageCode || ""}
            />
            {/* Fallback display for current location if they don't want to change it */}
            <div className="text-xs text-text-muted mt-2">
              Lokasi saat ini: {formData.village}, {formData.district}, {formData.regency}, {formData.province}
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className={labelClass}>Fokus Usaha</label>
                <input type="text" name="businessType" value={formData.businessType} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Jam Operasional (Opsional)</label>
                <input type="text" name="operationalHours" value={formData.operationalHours} onChange={handleChange} className={inputClass} placeholder="Senin - Jumat (08:00 - 16:00)" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rekening Pembayaran */}
        <Card className="border-secondary/30 shadow-sm">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <h3 className="text-lg font-semibold flex items-center mb-1">
              <Landmark className="h-5 w-5 mr-2 text-primary" /> Rekening Pembayaran Manual
            </h3>
            <p className="text-sm text-text-muted">
              Rekening ini akan ditampilkan kepada pembeli di nota pesanan setelah mereka melakukan checkout.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nama Bank</label>
                <input type="text" name="bank_bankName" value={formData.bankAccount.bankName} onChange={handleChange} className={inputClass} placeholder="Misal: Bank BRI" />
              </div>
              <div>
                <label className={labelClass}>Nomor Rekening</label>
                <input type="text" name="bank_bankAccountNumber" value={formData.bankAccount.bankAccountNumber} onChange={handleChange} className={`${inputClass} font-mono`} placeholder="Minimal 5 digit" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Atas Nama (Pemilik Rekening)</label>
              <input type="text" name="bank_bankAccountHolderName" value={formData.bankAccount.bankAccountHolderName} onChange={handleChange} className={inputClass} placeholder="Misal: BUMDes Maju Bersama" />
            </div>
            <div>
              <label className={labelClass}>Catatan Tambahan (Opsional)</label>
              <input type="text" name="bank_paymentNote" value={formData.bankAccount.paymentNote} onChange={handleChange} className={inputClass} placeholder="Misal: Tambahkan kode unik 3 digit belakang." />
            </div>
          </CardContent>
        </Card>
        </div>

        <div className="flex justify-end gap-4 pb-10">
          <Link href="/dashboard">
            <Button type="button" variant="outline" disabled={isSaving}>Batal</Button>
          </Link>
          <Button type="submit" disabled={isSaving} className="min-w-32">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
