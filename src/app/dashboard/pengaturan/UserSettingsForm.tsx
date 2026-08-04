"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { User, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, Loader2, Save, Info, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export function UserSettingsForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phoneNumber: initialData.phoneNumber || "",
    password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const inputClass = "w-full h-11 bg-surface-bg border border-border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-primary/40 transition-all duration-200 shadow-sm placeholder:text-text-muted/50";
  const labelClass = "block text-sm font-semibold text-text-main/90 mb-2";
  const cardClass = "rounded-2xl shadow-sm border border-border hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-200 bg-surface overflow-hidden relative";
  const cardHeaderClass = "bg-surface-bg/50 border-b border-border/50 px-6 py-4";
  const cardContentClass = "p-6 sm:p-8 space-y-6";

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
        // Auto hide success message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: data.error || "Gagal memperbarui profil" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Terjadi kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return null;
    if (pass.length < 5) return { label: "Lemah", color: "text-error-dark", bar: "w-1/3 bg-error", bg: "bg-error/20" };
    if (pass.length < 8) return { label: "Sedang", color: "text-warning", bar: "w-2/3 bg-warning", bg: "bg-warning/20" };
    return { label: "Kuat", color: "text-success-dark", bar: "w-full bg-success", bg: "bg-success/20" };
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} className="pb-32">
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center shadow-sm text-sm font-medium ${message.type === 'success' ? 'bg-success/10 border border-success/20 text-success-dark' : 'bg-error/10 border border-error/20 text-error-dark'}`}>
          <Info className="h-5 w-5 mr-3 shrink-0" />
          {message.text}
        </div>
      )}

      <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">
        
        {/* KOLOM KIRI: Form Pengaturan (70%) */}
        <div className="flex-1 space-y-8 min-w-0 w-full">
          
          {/* Card 1: Informasi Akun */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="text-lg font-bold flex items-center text-text-main">
                <User className="h-5 w-5 mr-2.5 text-primary" /> Informasi Akun
              </h3>
            </div>
            <div className={cardContentClass}>
              <div>
                <label htmlFor="name" className={labelClass}>Nama Administrator</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Misal: Budi Santoso"
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>Alamat Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="admin@bumdes.com"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className={labelClass}>Nomor HP / WhatsApp</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="08123456789"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Keamanan */}
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <h3 className="text-lg font-bold flex items-center text-text-main">
                <Lock className="h-5 w-5 mr-2.5 text-primary" /> Keamanan
              </h3>
            </div>
            <div className={cardContentClass}>
              <div>
                <label htmlFor="password" className={labelClass}>Password Baru (Opsional)</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-text-muted hover:text-text-main transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password && strength && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-text-muted">Kekuatan Sandi</span>
                      <span className={`text-xs font-bold ${strength.color}`}>{strength.label}</span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${strength.bg}`}>
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.bar}`}></div>
                    </div>
                  </div>
                )}
                {!formData.password && (
                  <div className="flex items-center mt-2.5">
                    <Info className="h-4 w-4 text-text-muted mr-1.5" />
                    <p className="text-xs text-text-muted font-medium">Minimal 8 karakter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Informasi Akun Info (30%) */}
        <div className="w-full lg:w-[35%] xl:w-[30%] flex-shrink-0 sticky top-8">
          <div className={cardClass}>
            <div className="p-8 flex flex-col items-center text-center">
              
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-4">
                <span className="text-3xl font-bold text-primary tracking-tight">
                  {getInitials(formData.name)}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-text-main mb-1">
                {formData.name || "Nama Admin"}
              </h3>
              <p className="text-text-muted text-sm font-medium mb-4">
                {formData.email || "email@bumdes.com"}
              </p>

              <div className="flex flex-col gap-2 w-full mt-2">
                <div className="flex items-center justify-between px-4 py-3 bg-surface-bg rounded-xl border border-border/50">
                  <div className="flex items-center text-sm font-semibold text-text-main">
                    <ShieldCheck className="h-4 w-4 mr-2 text-primary" /> Role
                  </div>
                  <span className="text-sm font-bold text-text-main">Administrator BUMDes</span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-surface-bg rounded-xl border border-border/50">
                  <div className="flex items-center text-sm font-semibold text-text-main">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Status
                  </div>
                  <span className="inline-flex items-center bg-success/10 text-success-dark px-2.5 py-1 rounded-md text-xs font-bold border border-success/20">
                    Akun Aktif
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-surface-bg rounded-xl border border-border/50">
                  <div className="flex items-center text-sm font-semibold text-text-main">
                    <Clock className="h-4 w-4 mr-2 text-text-muted" /> Diperbarui
                  </div>
                  <span className="text-sm font-medium text-text-main">Hari ini</span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-surface-bg rounded-xl border border-border/50">
                  <div className="flex items-center text-sm font-semibold text-text-main">
                    <Calendar className="h-4 w-4 mr-2 text-text-muted" /> Bergabung
                  </div>
                  <span className="text-sm font-medium text-text-main">Januari 2026</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50 w-full text-left">
                <p className="text-xs text-text-muted/80 leading-relaxed font-medium">
                  Perubahan informasi pada halaman ini akan digunakan sebagai identitas akun login utama Anda untuk mengakses GeraiBUMDes.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-border/40 px-4 sm:px-8 py-4 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-[9999]">
        <div className="w-full flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button type="button" variant="outline" disabled={loading} className="w-full sm:w-32 h-11 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-border text-text-main font-semibold">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-48 h-11">
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </form>
  );
}
