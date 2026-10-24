import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import User from "@/models/User";
import { CheckCircle, Clock, PauseCircle, AlertTriangle } from "lucide-react";
import { BumdesVerificationActions } from "@/components/admin/BumdesVerificationActions";
import { BumdesActionButtons } from "@/components/admin/BumdesActionButtons";

export default async function AdminBumdesDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  await dbConnect();
  
  const profile = await BumdesProfile.findById(resolvedParams.id).populate({ path: "userId", model: User, select: "email" }).lean();
  
  if (!profile) {
    return <div>BUMDes tidak ditemukan.</div>;
  }

  const locationString = `${profile.village}, ${profile.district}, ${profile.regency}, ${profile.province}`;
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Detail BUMDes: {profile.name}</h1>
          <p className="text-xs text-text-muted mt-1">ID: {resolvedParams.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <BumdesActionButtons
            bumdesId={resolvedParams.id}
            bumdesName={profile.name as string}
            status={profile.verificationStatus}
            suspensionReason={profile.suspensionReason}
          />
          <Link href="/admin/bumdes">
            <Button variant="outline">Kembali</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 border-b pb-2">Data BUMDes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-muted">Nama BUMDes</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Status</p>
                  <p className="font-medium">{profile.verificationStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Jenis Usaha Utama</p>
                  <p className="font-medium">{profile.businessType}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Tanggal Daftar</p>
                  <p className="font-medium">{new Date(profile.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-text-muted">Deskripsi Singkat</p>
                  <p className="font-medium">{profile.description}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold mt-8 mb-4 border-b pb-2">Lokasi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-muted">Desa</p>
                  <p className="font-medium">{profile.village}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Kecamatan</p>
                  <p className="font-medium">{profile.district}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Kabupaten/Kota</p>
                  <p className="font-medium">{profile.regency}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Provinsi</p>
                  <p className="font-medium">{profile.province}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Progress Pendaftaran</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Akun Dibuat</p>
                    <p className="text-xs text-text-muted">Pengelola berhasil membuat akun</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Profil BUMDes Lengkap</p>
                    <p className="text-xs text-text-muted">Informasi bisnis telah diisi</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Lokasi Lengkap</p>
                    <p className="text-xs text-text-muted">Data alamat telah diisi</p>
                  </div>
                </div>
                
                {profile.verificationStatus === "PENDING_VERIFICATION" ? (
                  <div className="flex items-start gap-3 opacity-90">
                    <Clock className="h-5 w-5 text-warning-dark mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-warning-dark">Menunggu Persetujuan Admin</p>
                      <p className="text-xs text-text-muted">Membutuhkan tindak lanjut</p>
                    </div>
                  </div>
                ) : profile.verificationStatus === "VERIFIED" ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-success-dark">Verifikasi Selesai</p>
                      <p className="text-xs text-text-muted">BUMDes aktif beroperasi</p>
                    </div>
                  </div>
                ) : profile.verificationStatus === "SUSPENDED" ? (
                  <div className="flex items-start gap-3">
                    <PauseCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-amber-700 font-semibold">BUMDes Ditangguhkan (Suspended)</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {profile.suspensionReason ? `Alasan: ${profile.suspensionReason}` : "Toko dinonaktifkan sementara oleh Admin"}
                      </p>
                      {profile.suspendedAt && (
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Tanggal: {new Date(profile.suspendedAt).toLocaleDateString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-danger mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-danger">Pendaftaran Ditolak</p>
                      <p className="text-xs text-text-muted">{profile.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Data Pengelola</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text-muted">Nama Lengkap</p>
                  <p className="font-medium">{profile.directorName}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Email</p>
                  <p className="font-medium">{profile.userId?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Nomor WhatsApp/HP</p>
                  <p className="font-medium">{profile.contactNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {profile.verificationStatus === "PENDING_VERIFICATION" && (
            <Card className="border-warning bg-warning/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Tindakan Persetujuan</h3>
                <p className="text-sm text-text-muted mb-4">Pastikan data yang diinput sudah sesuai kriteria marketplace sebelum menyetujui BUMDes ini.</p>
                
                <BumdesVerificationActions 
                  bumdesId={resolvedParams.id}
                  bumdesName={profile.name as string}
                  directorName={profile.directorName as string}
                  location={locationString}
                  businessType={profile.businessType as string}
                  createdAt={new Date(profile.createdAt).toLocaleDateString("id-ID")}
                  phoneNumber={profile.contactNumber as string}
                  email={profile.userId?.email as string}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
