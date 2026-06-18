import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { AccountActions } from "./AccountActions";

export default async function AdminAccountsPage() {
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  await dbConnect();
  
  // Fetch all users except SUPER_ADMINs (optional, but good practice to protect super admins)
  const users = await User.find({ role: { $ne: "SUPER_ADMIN" } }).sort({ createdAt: -1 });

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Manajemen Akun</h1>
          <p className="text-text-muted mt-1">Daftar semua pengguna terdaftar dan alat kelola akun dasar.</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Nama Pengguna</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">No. Telepon</th>
                <th className="px-6 py-4 font-medium">Peran</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id.toString()} className="border-b border-border hover:bg-surface-bg/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-main">
                    {user.name}
                  </td>
                  <td className="px-6 py-4">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {user.phoneNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      user.role === 'PLATFORM_ADMIN' ? 'bg-primary/10 text-primary-dark' :
                      user.role === 'BUMDES_ADMIN' ? 'bg-secondary/20 text-secondary-dark' :
                      'bg-surface-bg border border-border text-text-muted'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <AccountActions userId={user._id.toString()} userName={user.name} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Tidak ada data pengguna yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
