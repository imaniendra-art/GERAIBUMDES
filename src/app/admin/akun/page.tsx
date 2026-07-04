import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import { AccountActions } from "./AccountActions";

import Link from "next/link";

export default async function AdminAccountsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "bumdes";
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  await dbConnect();
  
  // Fetch all users
  const users = await User.find({}).sort({ createdAt: -1 });
  
  const bumdesUsers = users.filter(u => ["BUMDES_ADMIN", "BUMDES_MEMBER", "CUSTOMER"].includes(u.role));
  const adminUsers = users.filter(u => ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(u.role));
  
  const displayedUsers = activeTab === "admin" ? adminUsers : bumdesUsers;

  // Fetch BUMDes profiles if on bumdes tab
  let bumdesMap = new Map();
  if (activeTab === "bumdes") {
    const profiles = await BumdesProfile.find({ userId: { $in: bumdesUsers.map(u => u._id) } }).lean();
    profiles.forEach(p => {
      bumdesMap.set(p.userId.toString(), p);
    });
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Manajemen Akun</h1>
          <p className="text-text-muted mt-1">Daftar semua pengguna terdaftar dan alat kelola akun dasar.</p>
        </div>
        {activeTab === 'admin' && (
          <Link href="/admin/akun/tambah">
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              + Tambah Admin
            </button>
          </Link>
        )}
        {activeTab === 'bumdes' && (
          <Link href="/admin/akun/tambah-bumdes">
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              + Tambah Akun BUMDes
            </button>
          </Link>
        )}
      </div>

      <div className="flex space-x-4 mb-6 border-b border-border">
        <Link 
          href="/admin/akun?tab=bumdes" 
          className={`pb-2 px-4 font-medium ${activeTab === 'bumdes' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-main'}`}
        >
          Pengelola BUMDes
        </Link>
        <Link 
          href="/admin/akun?tab=admin" 
          className={`pb-2 px-4 font-medium ${activeTab === 'admin' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-main'}`}
        >
          Tim Admin
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Nama Pengguna</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">No. Telepon</th>
                {activeTab === 'bumdes' && (
                  <th className="px-4 py-3 font-medium">Nama BUMDes</th>
                )}
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user._id.toString()} className="border-b border-border hover:bg-surface-bg/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-main">
                    {user.name}
                  </td>
                  <td className="px-4 py-3">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    {activeTab === 'bumdes' && bumdesMap.get(user._id.toString())?.contactNumber 
                      ? bumdesMap.get(user._id.toString()).contactNumber 
                      : (user.phoneNumber || "-")}
                  </td>
                  {activeTab === 'bumdes' && (
                    <td className="px-4 py-3 font-medium text-text-main">
                      {bumdesMap.get(user._id.toString())?.name || <span className="text-text-muted italic">- Belum isi profil -</span>}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <AccountActions userId={user._id.toString()} userName={user.name} />
                  </td>
                </tr>
              ))}
              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'bumdes' ? 5 : 4} className="px-6 py-8 text-center text-text-muted">
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
