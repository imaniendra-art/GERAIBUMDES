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
    <div className="flex min-h-screen bg-surface-bg">
      <aside className="w-64 bg-primary-dark text-surface hidden md:flex flex-col">
        <div className="p-6 pb-8 flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden border border-white/5">
            {store?.logoUrl ? (
              <img src={store.logoUrl} alt={profile?.name || "BUMDes"} className="h-full w-full object-cover" />
            ) : (
              <span className="text-white">{profile?.name ? profile.name.charAt(0).toUpperCase() : "B"}</span>
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-semibold text-surface/50 uppercase tracking-wider mb-0.5">Dashboard BUMDes</h2>
            <p className="text-sm font-bold text-white truncate">{profile?.name || "BUMDes Saya"}</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          <BumdesSidebarNav storeSlug={store?.slug} />
        </nav>
        <div className="p-4 pt-2 space-y-1">
          <Link href="/dashboard/pengaturan" className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 w-full text-surface/70 hover:bg-surface/10 hover:text-white group">
            <UserCog className="h-5 w-5 mr-3 flex-shrink-0 text-surface/50 group-hover:text-white transition-colors duration-200" /> Pengaturan Akun
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 w-full text-surface/70 hover:bg-danger/10 hover:text-danger group">
              <LogOut className="h-5 w-5 mr-3 flex-shrink-0 text-surface/50 group-hover:text-danger transition-colors duration-200" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0 w-full overflow-x-hidden p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
