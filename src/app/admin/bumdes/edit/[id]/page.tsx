import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { updateBumdesProfile } from "../../actions";

export default async function AdminEditBumdesPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  await dbConnect();
  
  const resolvedParams = await params;
  const bumdesId = resolvedParams.id;
  
  const profile = await BumdesProfile.findById(bumdesId).lean();

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">BUMDes Tidak Ditemukan</h2>
        <Link href="/admin/bumdes">
          <Button>Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Edit BUMDes</h1>
          <p className="text-sm text-text-muted mt-1">Perbarui informasi profil {profile.name}</p>
        </div>
        <Link href="/admin/bumdes">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <form action={updateBumdesProfile.bind(null, bumdesId)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-main mb-1">
                Nama BUMDes
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={profile.name}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
              />
            </div>

            <div>
              <label htmlFor="directorName" className="block text-sm font-medium text-text-main mb-1">
                Nama Direktur/Ketua
              </label>
              <input
                id="directorName"
                name="directorName"
                type="text"
                defaultValue={profile.directorName}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
              />
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-text-main mb-1">
                Nomor Telepon/WhatsApp
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="text"
                defaultValue={profile.contactNumber}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-main mb-1">
                Deskripsi Singkat
              </label>
              <textarea
                id="description"
                name="description"
                defaultValue={profile.description}
                required
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-surface text-text-main"
              />
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary-dark">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
