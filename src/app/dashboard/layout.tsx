import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import Link from "next/link";
import { LogOut, UserCog } from "lucide-react";
import { BumdesSidebarNav } from "@/components/admin/BumdesSidebarNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();
  let profile = null;
  let store = null;
  
  try {
    profile = await BumdesProfile.findOne({ userId: session.userId });
    if (profile) {
      store = await Store.findOne({ bumdesId: profile._id });
    }
  } catch (error) {
    console.error("Error fetching profile/store for layout:", error);
  }

  return (
    <div className="flex h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] overflow-hidden bg-surface-bg p-0 md:p-3.5 md:gap-3.5">
      {/* Floating Modern Rounded Sidebar */}
      <aside className="w-64 bg-primary-dark text-surface hidden md:flex flex-col h-full shrink-0 select-none overflow-hidden justify-between rounded-2xl shadow-xl shadow-emerald-950/20 border border-white/10 ring-1 ring-black/5">
        {/* Header Ringkas BUMDes */}
        <div className="h-16 px-4 border-b border-surface/10 shrink-0 flex items-center gap-3 bg-black/10">
          <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden border border-white/10">
            {store?.logoUrl ? (
              <img src={store.logoUrl} alt={profile?.name || "BUMDes"} className="h-full w-full object-cover" />
            ) : (
              <span className="text-white">{profile?.name ? profile.name.charAt(0).toUpperCase() : "B"}</span>
            )}
          </div>
          <div className="overflow-hidden min-w-0">
            <h2 className="text-[10px] font-semibold text-surface/50 uppercase tracking-wider leading-tight">Dashboard BUMDes</h2>
            <p className="text-xs font-bold text-white truncate leading-tight mt-0.5">{profile?.name || "BUMDes Saya"}</p>
          </div>
        </div>

        {/* Navigasi Menu Tengah (Bebas Scroll Halus jika di Layar Mini) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <BumdesSidebarNav storeSlug={store?.slug} />
        </div>

        {/* Footer Paten (Selalu Terlihat di Layar Bawah - Zero Scroll) */}
        <div className="p-3 border-t border-surface/10 shrink-0 bg-black/15 space-y-1">
          <Link 
            href="/dashboard/pengaturan" 
            className="flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-colors w-full text-surface/75 hover:bg-surface/10 hover:text-white group"
          >
            <UserCog className="h-4 w-4 mr-2.5 flex-shrink-0 text-surface/50 group-hover:text-white transition-colors" /> Pengaturan Akun
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button 
              type="submit" 
              className="flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-colors w-full text-surface/75 hover:bg-danger/20 hover:text-danger group"
            >
              <LogOut className="h-4 w-4 mr-2.5 flex-shrink-0 text-danger/80 group-hover:text-danger transition-colors" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Bagian Kanan (Isian Konten) yang Dapat Di-scroll Bebas Secara Mandiri */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 md:p-6">
        {children}
      </main>
    </div>
  );
}
