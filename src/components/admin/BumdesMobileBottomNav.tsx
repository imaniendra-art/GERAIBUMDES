"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, ShoppingCart, Store } from "lucide-react";

interface BumdesMobileBottomNavProps {
  pendingOrdersCount?: number;
}

export function BumdesMobileBottomNav({ pendingOrdersCount = 0 }: BumdesMobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      label: "Pesanan",
      href: "/dashboard/pesanan",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/dashboard/pesanan"),
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      label: "Produk",
      href: "/dashboard/produk",
      icon: Package,
      isActive: pathname.startsWith("/dashboard/produk"),
    },
    {
      label: "Beli B2B",
      href: "/dashboard/pembelian",
      icon: ShoppingCart,
      isActive: pathname.startsWith("/dashboard/pembelian"),
    },
    {
      label: "Profil Toko",
      href: "/dashboard/toko/edit",
      icon: Store,
      isActive: pathname.startsWith("/dashboard/toko"),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 py-1 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-w-[58px] ${
                item.isActive
                  ? "text-primary font-bold scale-105"
                  : "text-text-muted hover:text-text-main font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${item.isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-danger text-white text-[9px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm border border-surface">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-tight tracking-tight">
                {item.label}
              </span>
              {item.isActive && (
                <span className="absolute -bottom-0.5 w-4 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
