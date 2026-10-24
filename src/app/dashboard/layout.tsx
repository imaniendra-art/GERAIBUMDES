import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import Order from "@/models/Order";
import Link from "next/link";
import { LogOut, UserCog } from "lucide-react";
import { BumdesSidebarNav } from "@/components/admin/BumdesSidebarNav";
import { BumdesMobileBottomNav } from "@/components/admin/BumdesMobileBottomNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();
  let profile = null;
  let store = null;
  let pendingOrdersCount = 0;
  
  try {
    profile = await BumdesProfile.findOne({ userId: session.userId });
    if (profile) {
      store = await Store.findOne({ bumdesId: profile._id });
      if (store) {
        pendingOrdersCount = await Order.countDocuments({
          sellerStoreId: store._id,
          status: "WAITING_SELLER_CONFIRMATION",
        });
      }
    }
  } catch (error) {
    console.error("Error fetching profile/store for layout:", error);
  }

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-85px)] overflow-hidden bg-surface-bg p-0 md:p-3.5 md:gap-3.5">
      {/* Floating Modern Rounded Sidebar (Desktop) */}
      <aside className="w-64 bg-primary-dark text-surface hidden md:flex flex-col h-full shrink-0 select-none overflow-hidden justify-between rounded-2xl shadow-xl shadow-emerald-950/20 border border-white/10 ring-1 ring-black/5">
        {/* Header Profil BUMDes Aktif Langsung */}
        <div className="h-16 px-4 border-b border-surface/10 shrink-0 flex items-center gap-3 bg-black/15">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-white/20 overflow-hidden">
              {store?.logoUrl ? (
                <img src={store.logoUrl} alt={profile?.name || "BUMDes"} className="h-full w-full object-cover" />
              ) : (
                <span className="text-white">{profile?.name ? profile.name.charAt(0).toUpperCase() : "B"}</span>
              )}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-400 rounded-full border-2 border-primary-dark shadow-sm"
              title="Toko Aktif"
            />
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p
              className="font-bold text-sm text-white tracking-wide truncate"
              title={profile?.name || "BUMDes Saya"}
            >
              {profile?.name || "BUMDes Saya"}
            </p>
          </div>
        </div>

        {/* Navigasi Menu Tengah (Bebas Scroll Halus jika di Layar Mini) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <BumdesSidebarNav storeSlug={store?.slug} pendingOrdersCount={pendingOrdersCount} />
        </div>

        {/* Footer Paten (Selalu Terlihat di Layar Bawah - Zero Scroll) */}
        <div className="p-3 border-t border-surface/10 shrink-0 bg-black/20 space-y-1">
          <Link 
            href="/dashboard/pengaturan" 
            className="flex items-center px-3 py-2 rounded-xl text-[13px] font-medium transition-colors w-full text-surface/75 hover:bg-surface/10 hover:text-white group"
          >
            <UserCog className="h-4 w-4 mr-2.5 flex-shrink-0 text-surface/50 group-hover:text-white transition-colors" /> Pengaturan Akun
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button 
              type="submit" 
              className="flex items-center px-3 py-2 rounded-xl text-[13px] font-medium transition-colors w-full text-surface/75 hover:bg-danger/20 hover:text-danger group"
            >
              <LogOut className="h-4 w-4 mr-2.5 flex-shrink-0 text-danger/80 group-hover:text-danger transition-colors" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Bagian Kanan (Isian Konten) dengan padding bottom ekstra di mobile agar tidak tertutup dock bar */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 md:p-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Modern Floating Bottom Navigation Bar (Khusus Layar Mobile) */}
      <BumdesMobileBottomNav pendingOrdersCount={pendingOrdersCount} />
    </div>
  );
}
