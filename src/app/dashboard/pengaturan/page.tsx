import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserSettingsForm } from "./UserSettingsForm";

export default async function UserSettingsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();
  
  const user = await User.findById(session.userId).lean();
  if (!user) {
    redirect("/login");
  }

  const initialData = {
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };

  return (
    <div className="space-y-6">
      <div className="mb-10">
        <Link href="/dashboard">
          <Button variant="ghost" className="rounded-xl text-sm font-semibold transition-colors duration-200 h-11 px-4 text-text-muted hover:text-text-main hover:bg-surface-bg">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-main tracking-tight mb-2">Pengaturan Akun Pengguna</h1>
        <p className="text-text-muted font-medium text-lg">Kelola informasi administrator dan keamanan akun.</p>
      </div>

      <UserSettingsForm initialData={initialData} />
    </div>
  );
}
