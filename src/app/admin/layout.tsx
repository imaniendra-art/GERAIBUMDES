import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  await dbConnect();
  let currentUser = null;
  try {
    currentUser = await User.findById(session.userId).select("name email role").lean();
  } catch (err) {
    console.error("Error fetching admin profile:", err);
  }

  return (
    <div className="flex h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] overflow-hidden bg-surface-bg">
      <aside className="w-60 bg-primary-dark text-surface hidden md:flex flex-col h-full shrink-0 select-none overflow-hidden justify-between">
        {/* Header Profil Administrator Aktif */}
        <div className="h-16 px-3.5 border-b border-surface/10 shrink-0 flex items-center gap-3 bg-black/15">
          <div className="relative shrink-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-white/20">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-400 rounded-full border-2 border-primary-dark shadow-sm"
              title="Online / Aktif"
            />
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p
              className="font-bold text-sm text-white tracking-wide leading-tight truncate"
              title={currentUser?.name || "Admin"}
            >
              {currentUser?.name || "Administrator"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-950/70 text-emerald-300 rounded border border-emerald-500/30 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                {currentUser?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigasi Menu: Pas 1 Layar Tanpa Scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AdminSidebarNav />
        </div>

        {/* Footer Paten (Selalu Terlihat di Layar Bawah - Zero Overflow) */}
        <div className="p-2.5 border-t border-surface/10 shrink-0 bg-black/20 space-y-1">
          <Link
            href="/"
            className="flex items-center hover:bg-surface/10 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-surface/75 hover:text-white w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2.5 shrink-0 opacity-70" /> Ke Marketplace
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center hover:bg-danger/20 hover:text-danger text-surface/75 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors w-full"
            >
              <LogOut className="h-4 w-4 mr-2.5 shrink-0 text-danger/80" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Bagian Kanan (Isian Konten) yang Dapat Di-scroll */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
