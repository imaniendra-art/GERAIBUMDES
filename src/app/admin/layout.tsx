import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-surface-bg">
      <aside className="w-64 bg-primary-dark text-surface hidden md:flex flex-col">
        <div className="p-4 border-b border-surface/10">
          <h2 className="text-lg font-bold">Admin Platform</h2>
          <p className="text-xs text-surface/70 mt-1">geraibumdes.com</p>
        </div>
        <AdminSidebarNav />
        <div className="p-4 border-t border-surface/10">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center hover:text-danger px-3 py-2 text-sm font-medium transition-colors w-full">
              <LogOut className="h-5 w-5 mr-3" /> Keluar
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
