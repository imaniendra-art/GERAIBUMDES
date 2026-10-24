"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Settings, Users, Store, Globe } from "lucide-react";

export function BumdesSidebarNav({ storeSlug }: { storeSlug?: string }) {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
    
    return `flex items-center px-3 py-2 rounded-xl text-[13px] font-medium transition-colors mb-0.5 group ${
      isActive 
        ? "bg-primary text-white font-semibold shadow-sm" 
        : "text-surface/75 hover:bg-surface/10 hover:text-white"
    }`;
  };

  const getIconClasses = (isActive: boolean) => {
    return `h-[18px] w-[18px] mr-2.5 transition-colors duration-200 shrink-0 ${
      isActive ? "text-white" : "text-surface/50 group-hover:text-white"
    }`;
  };

  return (
    <>
      <div className="mb-1 mt-1">
        <h4 className="px-3 pt-1 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider mb-1">Menu Utama</h4>
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
      
      <div className="mt-4 mb-1">
        <h4 className="px-3 pt-1 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider mb-1">Aktivitas Buyer</h4>
      </div>
      <Link href="/pesanan" className={getLinkClasses("/pesanan")}>
        <Users className={getIconClasses(pathname.startsWith("/pesanan"))} /> Pembelian Saya
      </Link>
      
      <div className="mt-4 mb-1">
        <h4 className="px-3 pt-1 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider mb-1">Akses Cepat</h4>
      </div>
      {storeSlug && (
        <Link href={`/bumdes/${storeSlug}`} target="_blank" className="flex items-center px-3 py-2 rounded-xl text-[13px] font-medium transition-colors mb-0.5 text-surface/75 hover:bg-surface/10 hover:text-white group">
          <Store className="h-[18px] w-[18px] mr-2.5 shrink-0 text-surface/50 group-hover:text-white transition-colors duration-200" /> Toko Publik Saya
        </Link>
      )}
      <Link href="/" className="flex items-center px-3 py-2 rounded-xl text-[13px] font-medium transition-colors mb-0.5 text-surface/75 hover:bg-surface/10 hover:text-white group">
        <Globe className="h-[18px] w-[18px] mr-2.5 shrink-0 text-surface/50 group-hover:text-white transition-colors duration-200" /> Ke Marketplace
      </Link>
    </>
  );
}

export default BumdesSidebarNav;
