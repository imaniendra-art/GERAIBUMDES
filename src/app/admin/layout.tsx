import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminMobileBottomNav } from "@/components/admin/AdminMobileBottomNav";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import Product from "@/models/Product";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  await dbConnect();
  let currentUser = null;
  let pendingBumdesCount = 0;
  let pendingProductsCount = 0;

  try {
    currentUser = await User.findById(session.userId).select("name email role").lean();
    pendingBumdesCount = await BumdesProfile.countDocuments({ verificationStatus: "PENDING_VERIFICATION" });
    pendingProductsCount = await Product.countDocuments({ status: "WAITING_APPROVAL" });
  } catch (err) {
    console.error("Error fetching admin profile/counts:", err);
  }

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-85px)] overflow-hidden bg-surface-bg p-0 md:p-3.5 md:gap-3.5">
      {/* Floating Modern Rounded Sidebar (Desktop) */}
      <aside className="w-64 bg-primary-dark text-surface hidden md:flex flex-col h-full shrink-0 select-none overflow-hidden justify-between rounded-2xl shadow-xl shadow-emerald-950/20 border border-white/10 ring-1 ring-black/5">
        {/* Header Profil Administrator Aktif */}
        <div className="h-16 px-4 border-b border-surface/10 shrink-0 flex items-center gap-3 bg-black/15">
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
        <div className="p-3 border-t border-surface/10 shrink-0 bg-black/20 space-y-1">
          <Link
            href="/"
            className="flex items-center hover:bg-surface/10 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors text-surface/75 hover:text-white w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2.5 shrink-0 opacity-70" /> Ke Marketplace
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center hover:bg-danger/20 hover:text-danger text-surface/75 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors w-full"
            >
              <LogOut className="h-4 w-4 mr-2.5 shrink-0 text-danger/80" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Bagian Kanan (Isian Konten) dengan padding bottom ekstra di mobile agar tidak tertutup dock bar */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 md:p-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Modern Floating Bottom Navigation Bar (Khusus Layar Mobile) */}
      <AdminMobileBottomNav
        pendingBumdesCount={pendingBumdesCount}
        pendingProductsCount={pendingProductsCount}
      />
    </div>
  );
}
