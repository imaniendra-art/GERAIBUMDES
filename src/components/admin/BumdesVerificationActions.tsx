"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { verifyBumdes, rejectBumdes } from "@/app/admin/bumdes/actions";

interface BumdesVerificationActionsProps {
  bumdesId: string;
  bumdesName: string;
  directorName: string;
  location: string;
  businessType: string;
  createdAt: string;
  phoneNumber?: string;
  email?: string;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 512l151.7-39.8c33 18.2 69.8 27.9 107.5 27.9 122.3 0 222-99.6 222-222 0-59.3-23.1-115.1-65.1-157.1zM224 430.7c-33.1 0-65.6-8.9-94.2-25.7l-6.7-4-69.9 18.3L72 351l-4.4-7.1c-18.4-29.6-28.1-64-28.1-99.8 0-104 84.6-188.6 188.6-188.6 55.5 0 107.6 21.6 146.8 60.8 39.2 39.2 60.8 91.3 60.8 146.8 0 104-84.6 188.6-188.6 188.6zm102.7-140.6c-5.6-2.8-33.5-16.5-38.7-18.4-5.2-1.9-9-2.8-12.8 2.8-3.8 5.6-14.7 18.4-18 22.2-3.3 3.8-6.6 4.2-12.2 1.4-5.6-2.8-23.9-8.8-45.5-28.1-16.8-15-28.2-33.5-31-39.2-2.8-5.6-.3-8.7 2.5-11.5 2.5-2.5 5.6-6.6 8.4-10 2.8-3.3 3.8-5.7 5.7-9.5 1.9-3.8 .9-7.1-.5-10-1.4-2.8-12.8-30.8-17.5-42.2-4.6-11.1-9.3-9.6-12.8-9.8-3.3-.2-7.1-.2-10.9-.2-3.8 0-10 1.4-15.2 7.1-5.2 5.7-19.9 19.4-19.9 47.3s20.4 54.9 23.2 58.7c2.8 3.8 40.1 61.3 97 85.9 13.5 5.8 24.1 9.3 32.3 11.9 13.6 4.3 26 3.7 35.8 2.2 11-1.7 33.5-13.7 38.2-26.9 4.7-13.2 4.7-24.5 3.3-26.9-1.4-2.4-5.2-3.8-10.8-6.6z" />
  </svg>
);

const formatWhatsAppNumber = (phone?: string) => {
  if (!phone) return null;
  let formatted = phone.replace(/\D/g, "");
  if (formatted.startsWith("0")) {
    formatted = "62" + formatted.slice(1);
  }
  return formatted.length >= 10 ? formatted : null;
};

export function BumdesVerificationActions({
  bumdesId,
  bumdesName,
  directorName,
  location,
  businessType,
  createdAt,
  phoneNumber,
  email,
}: BumdesVerificationActionsProps) {
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const handleVerify = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMsg("");
    const result = await verifyBumdes(bumdesId);
    if (result.success) {
      const waNumber = formatWhatsAppNumber(phoneNumber);
      
      if (waNumber) {
        const loginUrl = window.location.origin + "/login";
        const text = `Halo Bapak/Ibu *${directorName}*.

🎉 Selamat!

Pendaftaran *${bumdesName}* telah berhasil disetujui oleh Admin GeraiBUMDes.

Akun Anda sekarang telah aktif dan sudah dapat digunakan untuk login.

Informasi akun:

• Email Login:
${email || "-"}

• Password:
Gunakan password yang telah Anda buat saat melakukan pendaftaran.

Silakan login melalui:
${loginUrl}

Setelah berhasil login, kami menyarankan Anda untuk:
✅ Melengkapi data rekening BUMDes.
✅ Melengkapi profil BUMDes apabila masih ada yang kurang.
✅ Menambahkan produk pertama.

Perlu diketahui bahwa produk pertama akan melalui proses verifikasi Admin sebelum tampil di marketplace.

Terima kasih telah bergabung bersama GeraiBUMDes.

Salam,
Admin GeraiBUMDes`;

        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, "_blank");
        setIsVerifyModalOpen(false);
        setToastMsg("✅ BUMDes berhasil diaktifkan. WhatsApp siap dikirim kepada pendaftar.");
        setTimeout(() => setToastMsg(""), 6000);
      } else {
        setSuccessMsg("BUMDes berhasil diaktifkan, namun nomor WhatsApp tidak tersedia sehingga pemberitahuan tidak dapat dikirim.");
        setTimeout(() => setIsVerifyModalOpen(false), 3000);
      }
    } else {
      setError(result.error || "Gagal memverifikasi BUMDes.");
    }
    setIsLoading(false);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccessMsg("");
    
    const result = await rejectBumdes(bumdesId, rejectReason);
    
    if (result.success) {
      const waNumber = formatWhatsAppNumber(phoneNumber);
      
      if (waNumber) {
        const text = `Halo Bapak/Ibu *${directorName}*.

Terima kasih telah mendaftarkan *${bumdesName}* di GeraiBUMDes.

Mohon maaf, pendaftaran BUMDes Anda *belum dapat kami setujui*.

Alasan:
"${rejectReason}"

Silakan login kembali ke GeraiBUMDes menggunakan akun yang telah didaftarkan.
Sistem akan mengarahkan Anda ke halaman *Revisi Pendaftaran* untuk memperbaiki data dan mengajukan verifikasi ulang.

Terima kasih.
Admin GeraiBUMDes`;

        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, "_blank");
        setIsRejectModalOpen(false);
        setToastMsg("✅ Pendaftaran berhasil ditolak. WhatsApp siap dikirim kepada pendaftar.");
        setTimeout(() => setToastMsg(""), 6000);
      } else {
        setSuccessMsg("Pendaftaran berhasil ditolak, namun nomor WhatsApp tidak tersedia sehingga pemberitahuan tidak dapat dikirim.");
        // Hide modal after a delay
        setTimeout(() => setIsRejectModalOpen(false), 3000);
      }
    } else {
      setError(result.error || "Gagal menolak BUMDes.");
    }
    setIsLoading(false);
  };

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-success/20 shadow-xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm">
          <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
          <p className="text-sm font-medium text-text-main">{toastMsg}</p>
        </div>
      )}
      
      <div className="space-y-3 mt-4">
        {successMsg && (
          <div className="p-3 mb-3 bg-warning/10 text-warning-dark text-sm rounded-lg border border-warning/20">
            {successMsg}
          </div>
        )}
        
        <Button 
          onClick={() => setIsVerifyModalOpen(true)}
          className="w-full bg-success hover:bg-success-dark text-white shadow-sm flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-4 w-4" /> Aktifkan BUMDes
        </Button>
        <Button 
          onClick={() => setIsRejectModalOpen(true)}
          variant="outline" 
          className="w-full text-danger border-danger/20 hover:bg-danger/10 flex items-center justify-center gap-2"
        >
          <XCircle className="h-4 w-4" /> Tolak Pendaftaran
        </Button>
      </div>

      {/* VERIFY MODAL */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-left border border-border">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-success-dark">
                <CheckCircle className="h-6 w-6" />
                <h3 className="text-xl font-bold">Konfirmasi Aktivasi BUMDes</h3>
              </div>
              
              <p className="text-text-main mb-6">
                Anda akan mengaktifkan akun BUMDes berikut. Harap periksa kembali detail pendaftaran sebelum melanjutkan.
              </p>

              <div className="bg-surface-bg border border-border rounded-lg p-4 space-y-3 mb-6">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-text-muted">Nama BUMDes</span>
                  <span className="col-span-2 font-semibold">{bumdesName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-text-muted">Pengelola</span>
                  <span className="col-span-2 font-medium">{directorName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-text-muted">Lokasi</span>
                  <span className="col-span-2 font-medium">{location}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-text-muted">Jenis Usaha</span>
                  <span className="col-span-2 font-medium">{businessType}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-text-muted">Tanggal Daftar</span>
                  <span className="col-span-2 font-medium">{createdAt}</span>
                </div>
              </div>

              <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                <p className="font-semibold text-sm mb-2 text-success-dark">Setelah aktif:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Pengelola dapat login ke sistem.</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Toko menjadi aktif.</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Pengelola dapat menambah produk.</li>
                  <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning-dark" /> Produk pertama tetap melalui approval Admin.</li>
                </ul>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-danger/10 text-danger text-sm rounded-lg border border-danger/20">
                  {error}
                </div>
              )}
              
              {successMsg && (
                <div className="mt-4 p-3 bg-warning/10 text-warning-dark text-sm rounded-lg border border-warning/20">
                  {successMsg}
                </div>
              )}
            </div>
            
            <div className="bg-surface-bg px-6 py-4 flex justify-end gap-3 border-t border-border">
              <Button variant="outline" onClick={() => setIsVerifyModalOpen(false)} disabled={isLoading || !!successMsg}>
                Batal
              </Button>
              <Button 
                className="bg-success hover:bg-success-dark text-white"
                onClick={handleVerify}
                disabled={isLoading || !!successMsg}
              >
                {isLoading ? "Memproses..." : "Aktifkan BUMDes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-left border border-border">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-danger">
                <XCircle className="h-6 w-6" />
                <h3 className="text-xl font-bold">Tolak Pendaftaran BUMDes</h3>
              </div>
              
              <p className="text-text-main mb-6">
                Anda akan menolak pendaftaran <strong>{bumdesName}</strong>. Pengelola tidak akan dapat mengakses sistem.
              </p>

              <form id="reject-form" onSubmit={handleReject}>
                <div className="space-y-2">
                  <label htmlFor="reason" className="block text-sm font-medium text-text-main">
                    Alasan Penolakan <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="reason"
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                    placeholder="Contoh: Dokumen tidak lengkap, data lokasi tidak sesuai..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                    disabled={isLoading || !!successMsg}
                  ></textarea>
                </div>
                
                <p className="mt-3 text-xs text-text-muted flex items-center">
                  <WhatsAppIcon className="h-3 w-3 mr-1.5 text-success" /> 
                  WhatsApp akan terbuka otomatis setelah pendaftaran ditolak.
                </p>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-danger/10 text-danger text-sm rounded-lg border border-danger/20">
                  {error}
                </div>
              )}
              
              {successMsg && (
                <div className="mt-4 p-3 bg-warning/10 text-warning-dark text-sm rounded-lg border border-warning/20">
                  {successMsg}
                </div>
              )}
            </div>
            
            <div className="bg-surface-bg px-6 py-4 flex justify-end gap-3 border-t border-border">
              <Button variant="outline" onClick={() => setIsRejectModalOpen(false)} disabled={isLoading || !!successMsg}>
                Batal
              </Button>
              <Button 
                form="reject-form"
                type="submit"
                className="bg-danger hover:bg-danger-dark text-white flex items-center"
                disabled={isLoading || !rejectReason.trim() || !!successMsg}
              >
                {isLoading ? "Memproses..." : (
                  <>
                    <WhatsAppIcon className="h-4 w-4 mr-2" /> Tolak & Kirim WhatsApp
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
