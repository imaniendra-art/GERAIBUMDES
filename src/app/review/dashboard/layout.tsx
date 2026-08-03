import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings } from "lucide-react";

export default function MockDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-surface-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col">
        <div className="p-6">
          <div className="font-bold text-lg text-text-main mb-6">Menu Dashboard</div>
          <nav className="space-y-2">
            <Link href="/review/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-bg text-text-main font-medium">
              <LayoutDashboard className="w-5 h-5 text-primary" /> Overview
            </Link>
            <Link href="/review/dashboard/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-bg text-text-main font-medium">
              <Package className="w-5 h-5 text-primary" /> Produk
            </Link>
            <Link href="/review/dashboard/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-bg text-text-main font-medium">
              <ShoppingCart className="w-5 h-5 text-primary" /> Pesanan
            </Link>
            <Link href="/review/dashboard/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-bg text-text-main font-medium">
              <Users className="w-5 h-5 text-primary" /> Pengguna
            </Link>
            <Link href="/review/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-bg text-text-main font-medium">
              <Settings className="w-5 h-5 text-primary" /> Pengaturan
            </Link>
          </nav>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
