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
    <div className="flex h-screen overflow-hidden bg-surface-bg">
      <aside className="w-60 bg-primary-dark text-surface hidden md:flex flex-col h-screen shrink-0 select-none overflow-hidden justify-between">
        {/* Header Ringkas: Brand & Admin */}
        <div className="h-13 px-3.5 border-b border-surface/10 shrink-0 flex items-center justify-between bg-black/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-cta flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0">
              GB
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="font-bold text-xs text-white tracking-wide leading-tight truncate">
                Gerai<span className="text-cta">BUMDes</span>
              </p>
              <p className="text-[10px] text-surface/60 truncate leading-tight mt-0.5">
                {currentUser?.name || "Admin"}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white/10 text-emerald-300 rounded border border-white/10 shrink-0 uppercase tracking-wider ml-1">
            {currentUser?.role === "SUPER_ADMIN" ? "Super" : "Admin"}
          </span>
        </div>

        {/* Navigasi Menu: Pas 1 Layar Tanpa Scroll */}
        <div className="flex-1 overflow-y-auto py-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AdminSidebarNav />
        </div>

        {/* Footer Paten (Selalu Terlihat di Layar Bawah) */}
        <div className="p-2.5 border-t border-surface/10 shrink-0 bg-black/15 space-y-0.5">
          <Link
            href="/"
            className="flex items-center hover:bg-surface/10 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-surface/75 hover:text-white w-full"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-2 shrink-0 opacity-70" /> Ke Marketplace
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center hover:bg-danger/20 hover:text-danger text-surface/75 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors w-full"
            >
              <LogOut className="h-3.5 w-3.5 mr-2 shrink-0 text-danger/80" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Bagian Kanan (Isian Konten) yang Dapat Di-scroll */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
