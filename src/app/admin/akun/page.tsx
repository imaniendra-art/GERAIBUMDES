import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import { AccountActions } from "./AccountActions";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getUserRoleLabel, getUserRoleBadgeVariant } from "@/lib/utils/status";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Store,
  UserPlus,
  Search,
  Key,
} from "lucide-react";

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "all";
  const searchQuery = (resolvedParams.q || "").trim().toLowerCase();

  const session = await getSession();
  if (
    !session ||
    (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")
  ) {
    redirect("/login");
  }

  await dbConnect();

  // Ambil semua pengguna secara aman (tanpa passwordHash)
  const allUsers = await User.find({})
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  const bumdesUsers = allUsers.filter((u) =>
    ["BUMDES_ADMIN", "BUMDES_MEMBER", "CUSTOMER"].includes(u.role)
  );
  const adminUsers = allUsers.filter((u) =>
    ["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(u.role)
  );

  // Filter berdasarkan tab aktif
  let filteredByTab = allUsers;
  if (activeTab === "bumdes") {
    filteredByTab = bumdesUsers;
  } else if (activeTab === "admin") {
    filteredByTab = adminUsers;
  }

  // Filter pencarian nama / email / no telepon
  const displayedUsers = searchQuery
    ? filteredByTab.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery) ||
          u.email.toLowerCase().includes(searchQuery) ||
          (u.phoneNumber && u.phoneNumber.includes(searchQuery))
      )
    : filteredByTab;

  // Ambil data profil BUMDes terkait
  const profiles = await BumdesProfile.find({
    userId: { $in: allUsers.map((u) => u._id) },
  })
    .select("userId name contactNumber district province")
    .lean();

  const bumdesMap = new Map();
  profiles.forEach((p) => {
    bumdesMap.set(p.userId.toString(), p);
  });

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Tombol Tambah Akun */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" /> Manajemen Akun & Akses
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Pusat pengelolaan akun Pengelola BUMDes dan Tim Admin. Reset password atau buat akun baru.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/akun/tambah-bumdes">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 shadow-sm">
              <Store className="h-4 w-4 text-primary" /> + Akun BUMDes
            </Button>
          </Link>
          <Link href="/admin/akun/tambah">
            <Button size="sm" className="text-xs flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="h-4 w-4" /> + Admin Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Kartu Statistik Pengguna */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/akun?tab=all" className="block">
          <Card className={`transition-all hover:border-primary/50 cursor-pointer ${activeTab === 'all' ? 'border-primary ring-1 ring-primary/20' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted">Total Seluruh Akun</p>
                <h3 className="text-2xl font-bold text-text-main mt-1">{allUsers.length}</h3>
                <span className="text-[11px] text-text-muted">Terdaftar di sistem</span>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/akun?tab=bumdes" className="block">
          <Card className={`transition-all hover:border-primary/50 cursor-pointer ${activeTab === 'bumdes' ? 'border-primary ring-1 ring-primary/20' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted">Pengelola BUMDes</p>
                <h3 className="text-2xl font-bold text-text-main mt-1">{bumdesUsers.length}</h3>
                <span className="text-[11px] text-text-muted">Admin toko & desa</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                <Store className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/akun?tab=admin" className="block">
          <Card className={`transition-all hover:border-primary/50 cursor-pointer ${activeTab === 'admin' ? 'border-primary ring-1 ring-primary/20' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted">Tim Admin Platform</p>
                <h3 className="text-2xl font-bold text-text-main mt-1">{adminUsers.length}</h3>
                <span className="text-[11px] text-text-muted">Super & Platform Admin</span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3. Bar Filter Tab & Kotak Pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        {/* Tab navigasi */}
        <div className="flex space-x-2">
          <Link
            href={`/admin/akun?tab=all${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:bg-surface-bg hover:text-text-main"
            }`}
          >
            Semua Akun ({allUsers.length})
          </Link>
          <Link
            href={`/admin/akun?tab=bumdes${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "bumdes"
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:bg-surface-bg hover:text-text-main"
            }`}
          >
            Pengelola BUMDes ({bumdesUsers.length})
          </Link>
          <Link
            href={`/admin/akun?tab=admin${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "admin"
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:bg-surface-bg hover:text-text-main"
            }`}
          >
            Tim Admin ({adminUsers.length})
          </Link>
        </div>

        {/* Pencarian */}
        <form method="GET" action="/admin/akun" className="relative w-full sm:w-64">
          <input type="hidden" name="tab" value={activeTab} />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Cari nama atau email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="h-3.5 w-3.5 text-text-muted absolute left-2.5 top-2.5" />
        </form>
      </div>

      {/* 4. Tabel Akun */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] text-text-muted uppercase bg-surface-bg border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Pengguna</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Kontak / HP</th>
                <th className="px-4 py-3 font-semibold">Terkait BUMDes</th>
                <th className="px-4 py-3 font-semibold">Tgl Terdaftar</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedUsers.map((user) => {
                const bProfile = bumdesMap.get(user._id.toString());
                const registeredDate = user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-";

                return (
                  <tr
                    key={user._id.toString()}
                    className="hover:bg-surface-bg/60 transition-colors"
                  >
                    {/* Nama & Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                          {user.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-text-main leading-tight">
                            {user.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-4 py-3">
                      <Badge variant={getUserRoleBadgeVariant(user.role)}>
                        {getUserRoleLabel(user.role)}
                      </Badge>
                    </td>

                    {/* No. Telepon */}
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {bProfile?.contactNumber || user.phoneNumber || "-"}
                    </td>

                    {/* BUMDes Terkait */}
                    <td className="px-4 py-3 text-xs">
                      {bProfile ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-text-main">
                            {bProfile.name}
                          </span>
                          <span className="text-[11px] text-text-muted">
                            {bProfile.district ? `${bProfile.district}, ` : ""}{bProfile.province || ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-muted/60 italic">-</span>
                      )}
                    </td>

                    {/* Tanggal Terdaftar */}
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {registeredDate}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3 text-right">
                      <AccountActions
                        userId={user._id.toString()}
                        userName={user.name}
                        userEmail={user.email}
                        userRole={user.role}
                      />
                    </td>
                  </tr>
                );
              })}

              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    <Users className="h-8 w-8 mx-auto text-text-muted/40 mb-2" />
                    <p className="font-medium">Tidak ada akun yang ditemukan.</p>
                    <p className="text-xs text-text-muted/70 mt-0.5">
                      {searchQuery
                        ? `Tidak ada hasil untuk kata kunci "${searchQuery}".`
                        : "Belum ada akun di kategori ini."}
                    </p>
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
