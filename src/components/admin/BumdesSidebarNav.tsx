"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Settings, Users, UserCog, Store, Globe } from "lucide-react";

export function BumdesSidebarNav({ storeSlug }: { storeSlug?: string }) {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
    
    return `flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors duration-200 mb-1 group ${
      isActive 
        ? "bg-primary text-white font-semibold" 
        : "text-surface/70 hover:bg-surface/10 hover:text-white font-medium"
    }`;
  };

  const getIconClasses = (isActive: boolean) => {
    return `h-5 w-5 mr-3 transition-colors duration-200 flex-shrink-0 ${
      isActive ? "text-white" : "text-surface/50 group-hover:text-white"
    }`;
  };

  return (
    <>
      <div className="mb-2">
        <h4 className="px-4 text-[11px] font-bold text-surface/40 uppercase tracking-widest mb-2">Menu Utama</h4>
      </div>
      <Link href="/dashboard" className={getLinkClasses("/dashboard")}>
        <LayoutDashboard className={getIconClasses(pathname === "/dashboard")} /> Dashboard
      </Link>
      <Link href="/dashboard/toko/edit" className={getLinkClasses("/dashboard/toko/edit")}>
        <Settings className={getIconClasses(pathname === "/dashboard/toko/edit")} /> Profil BUMDes
      </Link>

      <Link href="/dashboard/produk" className={getLinkClasses("/dashboard/produk")}>
        <Package className={getIconClasses(pathname.startsWith("/dashboard/produk"))} /> Produk Saya
      </Link>
      <Link href="/dashboard/pesanan" className={getLinkClasses("/dashboard/pesanan")}>
        <ShoppingBag className={getIconClasses(pathname.startsWith("/dashboard/pesanan"))} /> Pesanan Masuk
      </Link>
      <Link href="/dashboard/laporan/penjualan" className={getLinkClasses("/dashboard/laporan/penjualan")}>
        <Package className={getIconClasses(pathname.startsWith("/dashboard/laporan"))} /> Laporan Penjualan
      </Link>
      
      <div className="mt-8 mb-2">
        <h4 className="px-4 text-[11px] font-bold text-surface/40 uppercase tracking-widest mb-2">Aktivitas Buyer</h4>
      </div>
      <Link href="/pesanan" className={getLinkClasses("/pesanan")}>
        <Users className={getIconClasses(pathname.startsWith("/pesanan"))} /> Pembelian Saya
      </Link>
      
      <div className="mt-8 mb-2">
        <h4 className="px-4 text-[11px] font-bold text-surface/40 uppercase tracking-widest mb-2">Akses Cepat</h4>
      </div>
      {storeSlug && (
        <Link href={`/bumdes/${storeSlug}`} target="_blank" className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 mb-1 text-surface/70 hover:bg-surface/10 hover:text-white group">
          <Store className="h-5 w-5 mr-3 flex-shrink-0 text-surface/50 group-hover:text-white transition-colors duration-200" /> Lihat BUMDes Saya
        </Link>
      )}
      <Link href="/" className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 mb-1 text-surface/70 hover:bg-surface/10 hover:text-white group">
        <Globe className="h-5 w-5 mr-3 flex-shrink-0 text-surface/50 group-hover:text-white transition-colors duration-200" /> Marketplace
      </Link>
    </>
  );
}
