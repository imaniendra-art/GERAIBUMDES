import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import AdminBumdesEditForm from "./AdminBumdesEditForm";

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

  // Convert lean document to plain object, handle ObjectId parsing
  const plainProfile = JSON.parse(JSON.stringify(profile));

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
          <AdminBumdesEditForm bumdesId={bumdesId} profile={plainProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
