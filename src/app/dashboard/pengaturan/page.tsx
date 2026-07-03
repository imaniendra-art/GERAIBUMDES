import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main shadow-sm">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
          </span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-main">Pengaturan Akun Pengguna</h1>
        <p className="text-text-muted text-sm mt-1">Kelola informasi pribadi dan keamanan akun login Anda.</p>
      </div>

      <UserSettingsForm initialData={initialData} />
    </div>
  );
}
