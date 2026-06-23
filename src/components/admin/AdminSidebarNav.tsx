"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Package, ShoppingBag, Database, FileText, Users } from "lucide-react";

export function AdminSidebarNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ bumdesCount: 0, productCount: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/pending-counts");
        if (res.ok) {
          const data = await res.json();
          setCounts({ bumdesCount: data.bumdesCount || 0, productCount: data.productCount || 0 });
        }
      } catch (error) {
        console.error("Failed to fetch pending counts", error);
      }
    };

    fetchCounts();
    // Refresh counter every 60 seconds automatically
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(`${path}/`);
    const isExactAdmin = pathname === "/admin" && path === "/admin";
    const highlight = isExactAdmin || (path !== "/admin" && isActive);
    
    return `flex items-center justify-between hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
      highlight ? 'bg-surface/10 text-white' : 'text-surface/80'
    }`;
  };

  return (
    <nav className="p-4 space-y-1">
      <Link href="/admin" className={getLinkClasses("/admin")}>
        <div className="flex items-center">
          <LayoutDashboard className="h-5 w-5 mr-3" /> Ringkasan
        </div>
      </Link>
      
      <Link href="/admin/bumdes" className={getLinkClasses("/admin/bumdes")}>
        <div className="flex items-center">
          <Store className="h-5 w-5 mr-3" /> Verifikasi BUMDes
        </div>
        {counts.bumdesCount > 0 && (
          <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto shadow-sm">
            {counts.bumdesCount}
          </span>
        )}
      </Link>
      
      <Link href="/admin/produk" className={getLinkClasses("/admin/produk")}>
        <div className="flex items-center">
          <Package className="h-5 w-5 mr-3" /> Verifikasi Produk
        </div>
        {counts.productCount > 0 && (
          <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto shadow-sm">
            {counts.productCount}
          </span>
        )}
      </Link>
      
      <Link href="/admin/pesanan" className={getLinkClasses("/admin/pesanan")}>
        <div className="flex items-center">
          <ShoppingBag className="h-5 w-5 mr-3" /> Pesanan & Transaksi
        </div>
      </Link>
      
      <Link href="/admin/laporan/transaksi" className={getLinkClasses("/admin/laporan/transaksi")}>
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-3" /> Laporan Transaksi
        </div>
      </Link>
      
      <div className="pt-6 pb-2">
        <p className="px-3 text-xs font-semibold text-surface/50 uppercase tracking-wider">Master Data</p>
      </div>
      
      <Link href="/admin/master/kategori" className={getLinkClasses("/admin/master/kategori")}>
        <div className="flex items-center">
          <Database className="h-4 w-4 mr-3 opacity-70" /> Kategori Produk
        </div>
      </Link>
      
      <Link href="/admin/master/jenis-usaha" className={getLinkClasses("/admin/master/jenis-usaha")}>
        <div className="flex items-center">
          <Database className="h-4 w-4 mr-3 opacity-70" /> Jenis Usaha
        </div>
      </Link>
      
      <Link href="/admin/master/wilayah" className={getLinkClasses("/admin/master/wilayah")}>
        <div className="flex items-center">
          <Database className="h-4 w-4 mr-3 opacity-70" /> Wilayah
        </div>
      </Link>
      
      <Link href="/admin/akun" className={getLinkClasses("/admin/akun")}>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-3 opacity-70" /> Manajemen Akun
        </div>
      </Link>
      
      <div className="my-2 border-t border-surface/10" />
      <Link href="/" className="flex items-center hover:bg-surface/10 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mt-4 text-surface/70">
        <div className="flex items-center">
          <LayoutDashboard className="h-5 w-5 mr-3" /> Kembali ke Marketplace
        </div>
      </Link>
    </nav>
  );
}
