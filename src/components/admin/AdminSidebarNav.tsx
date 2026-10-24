"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  CreditCard,
  Users,
  Activity,
  FolderTree,
  Briefcase,
  MapPin,
} from "lucide-react";

export function AdminSidebarNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ bumdesCount: 0, productCount: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/pending-counts");
        if (res.ok) {
          const data = await res.json();
          setCounts({
            bumdesCount: data.bumdesCount || 0,
            productCount: data.productCount || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch pending counts", error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const getLinkClasses = (path: string) => {
    const isActive =
      pathname === path || (path !== "/admin" && pathname.startsWith(`${path}/`));
    const isExactAdmin = pathname === "/admin" && path === "/admin";
    const highlight = isExactAdmin || (path !== "/admin" && isActive);

    return `flex items-center justify-between hover:bg-surface/10 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
      highlight
        ? "bg-surface/15 text-white shadow-sm font-semibold"
        : "text-surface/75 hover:text-white"
    }`;
  };

  return (
    <nav className="px-3 py-1 space-y-1.5">
      {/* 1. RINGKASAN */}
      <div className="space-y-0.5">
        <Link href="/admin" className={getLinkClasses("/admin")}>
          <div className="flex items-center">
            <LayoutDashboard className="h-[18px] w-[18px] mr-2.5 shrink-0" /> Ringkasan
          </div>
        </Link>
      </div>

      {/* 2. OPERASIONAL BUMDES & PRODUK */}
      <div className="space-y-0.5 pt-0.5">
        <p className="px-3 pt-1.5 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider">
          BUMDes & Produk
        </p>
        <Link href="/admin/bumdes" className={getLinkClasses("/admin/bumdes")}>
          <div className="flex items-center">
            <Store className="h-[18px] w-[18px] mr-2.5 shrink-0" /> Kelola BUMDes
          </div>
          {counts.bumdesCount > 0 && (
            <span
              className="bg-danger text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto shadow-sm"
              title={`${counts.bumdesCount} BUMDes menunggu verifikasi`}
            >
              {counts.bumdesCount}
            </span>
          )}
        </Link>

        <Link href="/admin/produk" className={getLinkClasses("/admin/produk")}>
          <div className="flex items-center">
            <Package className="h-[18px] w-[18px] mr-2.5 shrink-0" /> Kelola Produk
          </div>
          {counts.productCount > 0 && (
            <span
              className="bg-danger text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto shadow-sm"
              title={`${counts.productCount} produk menunggu verifikasi`}
            >
              {counts.productCount}
            </span>
          )}
        </Link>
      </div>

      {/* 3. PENGELOLAAN KEUANGAN & TRANSAKSI */}
      <div className="space-y-0.5 pt-0.5">
        <p className="px-3 pt-1.5 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider">
          Pengelolaan Keuangan
        </p>
        <Link href="/admin/pesanan" className={getLinkClasses("/admin/pesanan")}>
          <div className="flex items-center">
            <ShoppingBag className="h-[18px] w-[18px] mr-2.5 shrink-0" /> Pesanan & Transaksi
          </div>
        </Link>
        <Link
          href="/admin/laporan/transaksi"
          className={getLinkClasses("/admin/laporan/transaksi")}
        >
          <div className="flex items-center">
            <CreditCard className="h-[18px] w-[18px] mr-2.5 shrink-0" /> Laporan Transaksi
          </div>
        </Link>
      </div>

      {/* 4. MANAJEMEN AKUN & AKSES */}
      <div className="space-y-0.5 pt-0.5">
        <p className="px-3 pt-1.5 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider">
          Pengguna & Akses
        </p>
        <Link href="/admin/akun" className={getLinkClasses("/admin/akun")}>
          <div className="flex items-center">
            <Users className="h-[18px] w-[18px] mr-2.5 shrink-0" /> Manajemen Akun
          </div>
        </Link>
        <Link
          href="/admin/laporan/aktivitas"
          className={getLinkClasses("/admin/laporan/aktivitas")}
        >
          <div className="flex items-center">
            <Activity className="h-[18px] w-[18px] mr-2.5 shrink-0" /> Log Aktivitas Admin
          </div>
        </Link>
      </div>

      {/* 5. MASTER DATA */}
      <div className="space-y-0.5 pt-0.5">
        <p className="px-3 pt-1.5 pb-0.5 text-[10.5px] font-bold text-surface/50 uppercase tracking-wider">
          Master Data
        </p>
        <Link
          href="/admin/master/kategori"
          className={getLinkClasses("/admin/master/kategori")}
        >
          <div className="flex items-center">
            <FolderTree className="h-[18px] w-[18px] mr-2.5 shrink-0 opacity-80" /> Kategori Produk
          </div>
        </Link>
        <Link
          href="/admin/master/jenis-usaha"
          className={getLinkClasses("/admin/master/jenis-usaha")}
        >
          <div className="flex items-center">
            <Briefcase className="h-[18px] w-[18px] mr-2.5 shrink-0 opacity-80" /> Jenis Usaha
          </div>
        </Link>
        <Link
          href="/admin/master/wilayah"
          className={getLinkClasses("/admin/master/wilayah")}
        >
          <div className="flex items-center">
            <MapPin className="h-[18px] w-[18px] mr-2.5 shrink-0 opacity-80" /> Wilayah
          </div>
        </Link>
      </div>
    </nav>
  );
}

export default AdminSidebarNav;
