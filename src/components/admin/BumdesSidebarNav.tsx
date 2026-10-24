"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  BarChart3,
  ShoppingCart,
  Store,
  Globe,
  ExternalLink,
} from "lucide-react";

interface BumdesSidebarNavProps {
  storeSlug?: string;
  pendingOrdersCount?: number;
}

export function BumdesSidebarNav({ storeSlug, pendingOrdersCount = 0 }: BumdesSidebarNavProps) {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
    
    return `flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors mb-0.5 group ${
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
    <nav className="space-y-1">
      {/* 1. RINGKASAN */}
      <div className="space-y-0.5">
        <Link href="/dashboard" className={getLinkClasses("/dashboard")}>
          <div className="flex items-center">
            <LayoutDashboard className={getIconClasses(pathname === "/dashboard")} /> Dashboard
          </div>
        </Link>
      </div>

      {/* 2. OPERASIONAL TOKO SAYA */}
      <div className="space-y-0.5 pt-1">
        <h4 className="px-3 pt-1.5 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider">
          Toko Saya
        </h4>
        <Link href="/dashboard/pesanan" className={getLinkClasses("/dashboard/pesanan")}>
          <div className="flex items-center">
            <ShoppingBag className={getIconClasses(pathname.startsWith("/dashboard/pesanan"))} /> Pesanan Masuk
          </div>
          {pendingOrdersCount > 0 && (
            <span
              className="bg-danger text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto shadow-sm"
              title={`${pendingOrdersCount} pesanan baru menunggu konfirmasi`}
            >
              {pendingOrdersCount}
            </span>
          )}
        </Link>
        <Link href="/dashboard/produk" className={getLinkClasses("/dashboard/produk")}>
          <div className="flex items-center">
            <Package className={getIconClasses(pathname.startsWith("/dashboard/produk"))} /> Produk Saya
          </div>
        </Link>
        <Link href="/dashboard/laporan/penjualan" className={getLinkClasses("/dashboard/laporan/penjualan")}>
          <div className="flex items-center">
            <BarChart3 className={getIconClasses(pathname.startsWith("/dashboard/laporan"))} /> Laporan Penjualan
          </div>
        </Link>
        <Link href="/dashboard/toko/edit" className={getLinkClasses("/dashboard/toko/edit")}>
          <div className="flex items-center">
            <Settings className={getIconClasses(pathname === "/dashboard/toko/edit")} /> Profil BUMDes
          </div>
        </Link>
      </div>

      {/* 3. AKTIVITAS BUYER */}
      <div className="space-y-0.5 pt-1.5">
        <h4 className="px-3 pt-1.5 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider">
          Belanja B2B
        </h4>
        <Link href="/pesanan" className={getLinkClasses("/pesanan")}>
          <div className="flex items-center">
            <ShoppingCart className={getIconClasses(pathname.startsWith("/pesanan"))} /> Pembelian Saya
          </div>
        </Link>
      </div>

      {/* 4. AKSES CEPAT */}
      <div className="space-y-0.5 pt-1.5">
        <h4 className="px-3 pt-1.5 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider">
          Akses Cepat
        </h4>
        {storeSlug && (
          <Link
            href={`/bumdes/${storeSlug}`}
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors mb-0.5 text-surface/75 hover:bg-surface/10 hover:text-white group"
          >
            <div className="flex items-center">
              <Store className="h-[18px] w-[18px] mr-2.5 shrink-0 text-surface/50 group-hover:text-white transition-colors duration-200" />
              Toko Publik Saya
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-surface/40 group-hover:text-white/70" />
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center px-3 py-2 rounded-xl text-[13px] font-medium transition-colors mb-0.5 text-surface/75 hover:bg-surface/10 hover:text-white group"
        >
          <Globe className="h-[18px] w-[18px] mr-2.5 shrink-0 text-surface/50 group-hover:text-white transition-colors duration-200" />
          Ke Marketplace
        </Link>
      </div>
    </nav>
  );
}

export default BumdesSidebarNav;
