import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import EditAccountForm from "./EditAccountForm";

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  await dbConnect();
  
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
  const user = await User.findById(userId).lean();

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Pengguna Tidak Ditemukan</h2>
        <Link href="/admin/akun">
          <Button>Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  const plainUser = JSON.parse(JSON.stringify(user));

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Edit Akun Pengguna</h1>
          <p className="text-sm text-text-muted mt-1">Ubah detail profil dan hak akses pengguna.</p>
        </div>
        <Link href="/admin/akun">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <EditAccountForm user={plainUser} />
        </CardContent>
      </Card>
    </div>
  );
}
