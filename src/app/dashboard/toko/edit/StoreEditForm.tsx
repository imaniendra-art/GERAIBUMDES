"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Store, Building, MapPin, Landmark, Phone, ImageIcon, Save, Loader2, Users, FileCheck, CheckCircle2, ShieldCheck, Briefcase, Info, BadgeCheck, X } from "lucide-react";
import Link from "next/link";
import { LocationSelector } from "@/components/ui/LocationSelector";
import { ImageUploader } from "@/components/ui/ImageUploader";

const BUSINESS_TYPE_OPTIONS = [
  "Pertanian & Perkebunan",
  "Peternakan & Perikanan",
  "Budidaya (Flora/Fauna)",
  "Perdagangan & Pasar Desa",
  "Pariwisata & Ekonomi Kreatif",
  "Jasa & Penyewaan",
  "Manufaktur & Kerajinan",
  "Pengelolaan Air Bersih & Lingkungan",
  "Keuangan & Simpan Pinjam",
  "Lainnya"
];

export default function StoreEditForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialData);

  const inputClass = "w-full h-11 bg-surface-bg border border-border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 shadow-sm placeholder:text-text-muted/50";
  const labelClass = "block text-sm font-semibold text-text-main/90 mb-2";
  const cardClass = "rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all duration-200 bg-surface overflow-hidden relative";
  const cardHeaderClass = "bg-surface-bg/50 border-b border-border/50 px-6 py-4";
  const cardContentClass = "p-6 space-y-6";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const payload = { ...formData };
      
      // Mencegah penimpaan data wilayah dengan string kosong
      if (!payload.provinceCode || !payload.regencyCode || !payload.districtCode || !payload.villageCode) {
        delete payload.province;
        delete payload.regency;
        delete payload.district;
        delete payload.village;
        delete payload.provinceCode;
        delete payload.regencyCode;
        delete payload.districtCode;
        delete payload.villageCode;
      }

      const res = await fetch("/api/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengaturan");
      }

      alert("Profil BUMDes berhasil diperbarui!");
      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message);
      alert("Gagal: " + err.message);
      setIsSaving(false);
    }
  };

  const selectedBusinessTypes = formData.businessType ? formData.businessType.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  const dynamicBusinessTypes = Array.from(new Set([...BUSINESS_TYPE_OPTIONS, ...selectedBusinessTypes]));

  const handleBusinessTypeToggle = (option: string) => {
    let newSelection = [...selectedBusinessTypes];
    if (newSelection.includes(option)) {
      newSelection = newSelection.filter((item: string) => item !== option);
    } else {
      newSelection.push(option);
    }
    setFormData((prev: any) => ({ ...prev, businessType: newSelection.join(", ") }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight mb-1.5">Edit Profil BUMDes</h1>
        <p className="text-text-muted font-medium text-sm">Lengkapi profil usaha agar lebih dipercaya pembeli.</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error-dark p-4 rounded-xl text-sm mb-8 flex items-center shadow-sm">
          <Info className="h-5 w-5 mr-3 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="pb-32">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* KOLOM KIRI: Informasi Utama */}
          <div className="flex-1 space-y-8 min-w-0">
          
          {/* 1. INFORMASI DASAR */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="text-lg font-bold flex items-center text-text-main">
                <Store className="h-5 w-5 mr-2.5 text-primary" /> 1. Informasi Dasar
              </h3>
              <p className="text-sm text-text-muted mt-1 ml-7.5">Identitas utama BUMDes Anda di GeraiBUMDes.</p>
            </div>
            <div className={cardContentClass}>
              <div>
                <label className={labelClass}>Nama BUMDes *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="Misal: BUMDes Maju Bersama" />
              </div>
              <div>
                <label className={labelClass}>Deskripsi BUMDes</label>
                <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full bg-surface-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 shadow-sm placeholder:text-text-muted/50 resize-y" placeholder="Ceritakan sejarah singkat, visi, dan keunggulan BUMDes Anda..."></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <ImageUploader
                    label="Logo BUMDes"
                    value={formData.logoUrl}
                    onChange={(url) => setFormData((prev: any) => ({ ...prev, logoUrl: url }))}
                    folder="logos"
                    aspectRatio="square"
                    maxDimension={600}
                    helperText="Logo BUMDes, otomatis dikompres ke WebP (~50-80 KB)."
                  />
                </div>
                <div>
                  <ImageUploader
                    label="Banner Toko / Profil"
                    value={formData.bannerUrl}
                    onChange={(url) => setFormData((prev: any) => ({ ...prev, bannerUrl: url }))}
                    folder="banners"
                    aspectRatio="video"
                    maxDimension={1600}
                    helperText="Banner tampilan toko BUMDes, otomatis dikompres ke WebP (~100-150 KB)."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. LOKASI & KONTAK */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="text-lg font-bold flex items-center text-text-main">
                <MapPin className="h-5 w-5 mr-2.5 text-primary" /> 2. Lokasi & Kontak
              </h3>
              <p className="text-sm text-text-muted mt-1 ml-7.5">Alamat operasional dan kontak yang dapat dihubungi pembeli.</p>
            </div>
            <div className={cardContentClass}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Nomor WhatsApp</label>
                  <div className="relative">
                    <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="08..." />
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted/70" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Telepon BUMDes (Opsional)</label>
                  <div className="relative">
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="021..." />
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted/70" />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <label className={labelClass}>Alamat Lengkap Operasional</label>
                <textarea name="address" rows={3} value={formData.address} onChange={handleChange} className="w-full bg-surface-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 shadow-sm placeholder:text-text-muted/50 resize-y" placeholder="Nama Jalan, Gedung, RT/RW..."></textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className={labelClass}>Link Google Maps (Opsional)</label>
                  <input type="text" name="googleMapsUrl" value={formData.googleMapsUrl || ""} onChange={handleChange} className={inputClass} placeholder="https://maps.app.goo.gl/..." />
                </div>
                <div>
                  <label className={labelClass}>Link Website Desa (Opsional)</label>
                  <input type="url" name="villageWebsiteUrl" value={formData.villageWebsiteUrl || ""} onChange={handleChange} className={inputClass} placeholder="https://desa-anda.id" />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <label className={labelClass}>Wilayah (Provinsi - Desa)</label>
                <div className="mb-4">
                  <LocationSelector
                    onLocationChange={handleLocationChange}
                    layout="horizontal"
                    initialProvinceCode={formData.provinceCode || ""}
                    initialRegencyCode={formData.regencyCode || ""}
                    initialDistrictCode={formData.districtCode || ""}
                    initialVillageCode={formData.villageCode || ""}
                  />
                </div>
                <div className="bg-surface-bg p-3 rounded-lg border border-border inline-block">
                  <span className="text-xs text-text-muted font-medium">Lokasi saat ini:</span>
                  <span className="text-sm font-semibold text-text-main ml-2">{formData.village}, {formData.district}, {formData.regency}, {formData.province}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. KATEGORI USAHA */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="text-lg font-bold flex items-center text-text-main">
                <Building className="h-5 w-5 mr-2.5 text-primary" /> 3. Kategori Usaha
              </h3>
              <p className="text-sm text-text-muted mt-1 ml-7.5">Fokus area bisnis BUMDes Anda (bisa pilih lebih dari satu).</p>
            </div>
            <div className={cardContentClass}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dynamicBusinessTypes.map((option) => {
                  const isSelected = selectedBusinessTypes.includes(option);
                  return (
                    <label key={option} className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-bg'}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleBusinessTypeToggle(option)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-text-muted/40'}`}>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <span className={`text-sm font-semibold ${isSelected ? 'text-primary-dark' : 'text-text-main'}`}>{option}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border/50">
                <label className={labelClass}>Jam Operasional BUMDes</label>
                <input type="text" name="operationalHours" value={formData.operationalHours} onChange={handleChange} className={inputClass} placeholder="Misal: Senin - Jumat (08:00 - 16:00)" />
              </div>
            </div>
          </div>

          {/* 4. LEGALITAS & PENGURUS */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="text-lg font-bold flex items-center text-text-main">
                <ShieldCheck className="h-5 w-5 mr-2.5 text-primary" /> 4. Legalitas & Pengurus
              </h3>
              <p className="text-sm text-text-muted mt-1 ml-7.5">Informasi legal dan struktur organisasi BUMDes.</p>
            </div>
            <div className={cardContentClass}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Nama Direktur BUMDes (Opsional)</label>
                  <input type="text" name="directorName" value={formData.directorName || ""} onChange={handleChange} className={inputClass} placeholder="Nama Lengkap Direktur" />
                </div>
                <div>
                  <label className={labelClass}>Nama Kepala Desa / Pembina (Opsional)</label>
                  <input type="text" name="villageHeadName" value={formData.villageHeadName || ""} onChange={handleChange} className={inputClass} placeholder="Nama Lengkap Kepala Desa" />
                </div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <label className={labelClass}>NIB (Nomor Induk Berusaha) (Opsional)</label>
                <input type="text" name="nib" value={formData.nib || ""} onChange={handleChange} className={inputClass} placeholder="Masukkan 13 digit NIB BUMDes Anda" />
              </div>
            </div>
          </div>
          </div> {/* END KOLOM KIRI */}

          {/* KOLOM KANAN: Rekening */}
          <div className="w-full lg:w-[35%] xl:w-[32%] flex-shrink-0 sticky top-8">
          {/* 5. REKENING PEMBAYARAN */}
          <div className="rounded-3xl shadow-sm border-0 bg-gradient-to-br from-success/5 to-success/10 transition-all duration-200 overflow-hidden relative group hover:shadow-md">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
              <Landmark className="w-32 h-32 text-success-dark" />
            </div>
            
            <div className="px-6 sm:px-8 py-5 border-b border-success/10 bg-success/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <h3 className="text-xl font-bold flex items-center text-success-dark">
                  <Landmark className="h-6 w-6 mr-2.5" /> 5. Rekening Pembayaran
                </h3>
              </div>
              <div className="inline-flex items-center bg-white px-3 py-1.5 rounded-lg border border-success/20 shadow-sm text-xs font-bold text-success-dark">
                <BadgeCheck className="h-4 w-4 mr-1.5 text-success" /> Diperlihatkan kepada pembeli saat checkout
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-success-dark/90 mb-2">Nama Bank</label>
                  <input type="text" name="bank_bankName" value={formData.bankAccount.bankName} onChange={handleChange} className="w-full h-11 bg-white/80 border border-success/30 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-success/40 focus:border-success transition-all duration-200 shadow-sm placeholder:text-success/40" placeholder="Misal: Bank BRI / Mandiri" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-success-dark/90 mb-2">Nomor Rekening</label>
                  <input type="text" name="bank_bankAccountNumber" value={formData.bankAccount.bankAccountNumber} onChange={handleChange} className="w-full h-11 bg-white/80 border border-success/30 rounded-xl px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-success/40 focus:border-success transition-all duration-200 shadow-sm placeholder:text-success/40" placeholder="1234567890" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-success-dark/90 mb-2">Atas Nama (Pemilik Rekening)</label>
                <input type="text" name="bank_bankAccountHolderName" value={formData.bankAccount.bankAccountHolderName} onChange={handleChange} className="w-full h-11 bg-white/80 border border-success/30 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-success/40 focus:border-success transition-all duration-200 shadow-sm placeholder:text-success/40" placeholder="Sesuai buku tabungan (Misal: BUMDes Maju Bersama)" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-success-dark/90 mb-2">Catatan Tambahan (Opsional)</label>
                <input type="text" name="bank_paymentNote" value={formData.bankAccount.paymentNote} onChange={handleChange} className="w-full h-11 bg-white/80 border border-success/30 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-success/40 focus:border-success transition-all duration-200 shadow-sm placeholder:text-success/40" placeholder="Misal: Harap transfer tepat waktu." />
              </div>
            </div>
          </div>
          </div> {/* END KOLOM KANAN */}
        </div>

        {/* STICKY SAVE BAR */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-surface/95 backdrop-blur-md border-t border-border px-4 sm:px-8 py-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-[9999]">
          <div className="w-full flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button type="button" variant="outline" disabled={isSaving} className="w-full sm:w-32 h-11 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-border text-text-main font-semibold">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto min-w-40 h-11">
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
