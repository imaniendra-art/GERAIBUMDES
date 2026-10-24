import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
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
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Pengaturan Akun Pengguna</h1>
        <p className="text-text-muted mt-1.5 font-medium">Kelola informasi administrator dan keamanan akun.</p>
      </div>

      <UserSettingsForm initialData={initialData} />
    </div>
  );
}
