import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { logAdminActivity } from "@/lib/adminLogger";

export default async function AdminBumdesDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  await dbConnect();
  
  const profile = await BumdesProfile.findById(resolvedParams.id).populate({ path: "userId", model: User, select: "email" }).lean();
  
  if (!profile) {
    return <div>BUMDes tidak ditemukan.</div>;
  }

  // Server action for verification
  async function verifyBumdes() {
    "use server";
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) return;

    await dbConnect();
    await BumdesProfile.findByIdAndUpdate(resolvedParams.id, {
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      verifiedBy: session.userId,
    });
    await Store.findOneAndUpdate({ bumdesId: resolvedParams.id }, { status: "ACTIVE" });
    
    await logAdminActivity(
      session.userId,
      "VERIFY_BUMDES",
      profile.name as string,
      `BUMDes ${profile.name} diverifikasi`
    );
    
    redirect("/admin/bumdes");
  }

  // Server action for rejection
  async function rejectBumdes(formData: FormData) {
    "use server";
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) return;
    
    const reason = formData.get("reason") as string;

    await dbConnect();
    await BumdesProfile.findByIdAndUpdate(resolvedParams.id, {
      verificationStatus: "REJECTED",
      rejectionReason: reason || "Tidak memenuhi kualifikasi.",
    });
    await Store.findOneAndUpdate({ bumdesId: resolvedParams.id }, { status: "INACTIVE" });
    
    await logAdminActivity(
      session.userId,
      "REJECT_BUMDES",
      profile.name as string,
      `BUMDes ${profile.name} ditolak. Alasan: ${reason || "Tidak memenuhi kualifikasi."}`
    );
    
    redirect("/admin/bumdes");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detail Pendaftaran BUMDes</h1>
        <Link href="/admin/bumdes">
          <Button variant="outline">Kembali</Button>
        </Link>
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
              <h3 className="text-lg font-bold mb-4 border-b pb-2">Data Pengelola</h3>
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
            <Card className="border-warning">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Aksi Verifikasi</h3>
                
                <form action={verifyBumdes} className="mb-4">
                  <Button type="submit" className="w-full bg-success hover:bg-success/90">
                    Verifikasi BUMDes
                  </Button>
                </form>

                <div className="border-t pt-4 mt-4">
                  <form action={rejectBumdes} className="space-y-3">
                    <input 
                      name="reason" 
                      placeholder="Alasan penolakan..." 
                      className="w-full px-3 py-2 border rounded text-sm bg-surface"
                      required
                    />
                    <Button type="submit" variant="danger" className="w-full">
                      Tolak Pendaftaran
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
