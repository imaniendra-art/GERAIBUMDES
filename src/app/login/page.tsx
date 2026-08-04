"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { CheckCircle2, ShieldCheck, Clock, UserCheck, Store, PackagePlus, Info, Home, LogIn } from "lucide-react";

function RegistrationSuccessView() {
  const router = useRouter();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Success Card */}
      <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
        <CardContent className="pt-10 pb-10 px-6 sm:px-12 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-text-main mb-4">
            🎉 Pendaftaran Berhasil
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Terima kasih telah mendaftarkan BUMDes Anda sebagai Mitra GeraiBUMDes. Pendaftaran telah kami terima dan saat ini sedang menunggu proses verifikasi oleh Admin Platform.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-warning/10 text-warning-dark rounded-full font-medium border border-warning/20">
            <Clock size={20} />
            Estimasi verifikasi maksimal 1 x 24 jam kerja
          </div>
        </CardContent>
      </Card>

      {/* 2. Progress Onboarding & Langkah Selanjutnya */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Progress Timeline */}
        <Card className="shadow-md md:col-span-2">
          <CardHeader>
            <h3 className="text-xl font-bold text-text-main">Status Pendaftaran</h3>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center z-10 shrink-0 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="h-full w-0.5 bg-primary mt-2"></div>
                </div>
                <div className="pb-6 pt-1">
                  <h4 className="font-semibold text-text-main text-base">Registrasi Berhasil</h4>
                  <p className="text-sm text-text-muted mt-1">Data BUMDes telah dikirimkan.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 bg-warning text-white rounded-full flex items-center justify-center z-10 shrink-0 shadow-sm relative">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-warning opacity-25 animate-ping"></span>
                    <Clock size={18} />
                  </div>
                  <div className="h-full w-0.5 bg-border mt-2"></div>
                </div>
                <div className="pb-6 pt-1">
                  <h4 className="font-semibold text-warning-dark text-base">Menunggu Verifikasi</h4>
                  <p className="text-sm text-text-muted mt-1">Admin sedang memeriksa data.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 bg-surface-hover text-text-muted rounded-full flex items-center justify-center z-10 border-2 border-border shrink-0">
                    <UserCheck size={16} />
                  </div>
                  <div className="h-full w-0.5 bg-border mt-2"></div>
                </div>
                <div className="pb-6 pt-1">
                  <h4 className="font-semibold text-text-muted text-base">Akun Aktif</h4>
                  <p className="text-sm text-text-muted mt-1">Akun dapat digunakan login.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 bg-surface-hover text-text-muted rounded-full flex items-center justify-center z-10 border-2 border-border shrink-0">
                    <Store size={16} />
                  </div>
                </div>
                <div className="pt-1">
                  <h4 className="font-semibold text-text-muted text-base">Mulai Berjualan</h4>
                  <p className="text-sm text-text-muted mt-1">Platform siap digunakan.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info & Next Steps */}
        <div className="md:col-span-3 space-y-6">
          <Card className="shadow-md h-full flex flex-col">
            <CardHeader>
              <h3 className="text-xl font-bold text-text-main">Apa yang akan terjadi selanjutnya?</h3>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
              <ul className="space-y-5">
                <li className="flex gap-4 text-text-main items-start">
                  <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="leading-relaxed">Admin memeriksa kelengkapan dan keabsahan data BUMDes Anda.</span>
                </li>
                <li className="flex gap-4 text-text-main items-start">
                  <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <span className="leading-relaxed">Akun BUMDes Anda akan diverifikasi dan diaktifkan.</span>
                </li>
                <li className="flex gap-4 text-text-main items-start">
                  <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary shrink-0">
                    <LogIn size={18} />
                  </div>
                  <span className="leading-relaxed">Akun dapat digunakan untuk login ke dasbor Manajemen BUMDes.</span>
                </li>
                <li className="flex gap-4 text-text-muted items-start">
                  <div className="mt-0.5 bg-surface-hover border border-border p-1.5 rounded-full text-text-muted shrink-0">
                    <Store size={18} />
                  </div>
                  <span className="leading-relaxed">Lengkapi profil toko dan atur informasi rekening BUMDes.</span>
                </li>
                <li className="flex gap-4 text-text-muted items-start">
                  <div className="mt-0.5 bg-surface-hover border border-border p-1.5 rounded-full text-text-muted shrink-0">
                    <PackagePlus size={18} />
                  </div>
                  <span className="leading-relaxed">Tambahkan produk pertama dan mulai berjualan!</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 4. Informasi Bantuan */}
      <Card className="bg-info/5 border-l-4 border-l-info border-y-info/20 border-r-info/20 shadow-none">
        <CardContent className="p-5 flex gap-4 items-start">
          <Info size={24} className="text-info shrink-0 mt-0.5" />
          <p className="text-base text-text-main leading-relaxed">
            Apabila proses verifikasi memerlukan klarifikasi lebih lanjut, tim Admin GeraiBUMDes akan langsung menghubungi Anda melalui nomor WhatsApp yang telah Anda daftarkan.
          </p>
        </CardContent>
      </Card>

      {/* 5. Tombol */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 pb-8">
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full sm:w-auto min-w-[200px] bg-surface hover:bg-surface-hover h-12 text-base"
          onClick={() => router.push("/")}
        >
          <Home className="mr-2 h-5 w-5" />
          Kembali ke Beranda
        </Button>
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full sm:w-auto min-w-[200px] h-12 text-base shadow-md hover:shadow-lg"
          onClick={() => {
            // Remove the 'registered=true' param to show the login form instead
            router.push("/login");
          }}
        >
          <LogIn className="mr-2 h-5 w-5" />
          Masuk ke Akun
        </Button>
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal masuk. Periksa kembali email dan password.");
      } else {
        // Redirect based on role
        if (data.role === "SUPER_ADMIN" || data.role === "PLATFORM_ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex-1 bg-surface-bg flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <RegistrationSuccessView />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-surface-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-main">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Atau{" "}
          <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
            daftarkan akun baru
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8 px-4 sm:px-10">
            {error && (
              <div className="mb-4 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline text-sm">{error}</span>
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-main">
                  Alamat Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface text-text-main"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-main">
                  Kata Sandi
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface text-text-main"
                  />
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-surface-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
