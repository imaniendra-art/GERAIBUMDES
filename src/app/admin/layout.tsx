import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, Store, Package, ShoppingBag, Database, FileText, Users } from "lucide-react";

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
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
            <LayoutDashboard className="h-5 w-5 mr-3 text-surface/80" /> Ringkasan
          </Link>
          <Link href="/admin/bumdes" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
            <Store className="h-5 w-5 mr-3 text-surface/80" /> Verifikasi Toko
          </Link>
          <Link href="/admin/produk" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
            <Package className="h-5 w-5 mr-3 text-surface/80" /> Verifikasi Produk
          </Link>
          <Link href="/admin/pesanan" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
            <ShoppingBag className="h-5 w-5 mr-3 text-surface/80" /> Pesanan & Transaksi
          </Link>
          <Link href="/admin/laporan/transaksi" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
            <FileText className="h-5 w-5 mr-3 text-surface/80" /> Laporan Transaksi
          </Link>
          
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-semibold text-surface/50 uppercase tracking-wider">Master Data</p>
          </div>
          <Link href="/admin/master/kategori" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
            <Database className="h-4 w-4 mr-3 text-surface/60" /> Kategori Produk
          </Link>
          <Link href="/admin/master/jenis-usaha" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
            <Database className="h-4 w-4 mr-3 text-surface/60" /> Jenis Usaha
          </Link>
          <Link href="/admin/master/wilayah" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
            <Database className="h-4 w-4 mr-3 text-surface/60" /> Wilayah
          </Link>
          <Link href="/admin/akun" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors">
            <Users className="h-4 w-4 mr-3 text-surface/60" /> Manajemen Akun
          </Link>
          
          <div className="my-2 border-t border-surface/10" />
          <Link href="/" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mt-4 text-surface/70">
            <LayoutDashboard className="h-5 w-5 mr-3" /> Kembali ke Marketplace
          </Link>
        </nav>
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
