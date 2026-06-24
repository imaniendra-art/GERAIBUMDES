"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, Search, User, X, LayoutDashboard, Bell } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface NavbarClientProps {
  session: {
    userId: string;
    role: string;
    email: string;
  } | null;
  unreadCount?: number;
  storeSlug?: string | null;
}

export default function NavbarClient({ session, unreadCount = 0, storeSlug }: NavbarClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produk?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-primary text-surface sticky top-0 z-50 shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between py-4 min-h-[80px] items-center">
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-surface flex items-center gap-2">
              <Image src="/images/logo.png" alt="Logo GeraiBumdes" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10 object-contain" priority />
              <span className="hidden sm:inline-block">GeraiBumdes.com</span>
            </Link>
          </div>

          {/* Search Bar & Quick Links Desktop */}
          <div className="hidden md:flex flex-1 max-w-4xl mx-8 items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-surface border border-border text-text-main rounded-md pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary placeholder-text-muted"
              />
              <button 
                type="submit"
                className="h-12 px-6 bg-secondary hover:bg-secondary/90 text-secondary-dark rounded-md flex items-center justify-center transition-colors font-medium border border-secondary flex-shrink-0"
                aria-label="Cari"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link 
                href="/produk" 
                className="h-12 px-5 rounded-md flex items-center justify-center border border-surface/30 bg-surface/10 hover:bg-surface/20 transition-colors text-sm font-semibold whitespace-nowrap"
              >
                Produk
              </Link>
              <Link 
                href="/bumdes" 
                className="h-12 px-5 rounded-md flex items-center justify-center border border-surface/30 bg-surface/10 hover:bg-surface/20 transition-colors text-sm font-semibold whitespace-nowrap"
              >
                BUMDes
              </Link>
            </div>
          </div>

          {/* Right Section Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                {session.role === "BUMDES_ADMIN" && (
                  <Link href="/dashboard/pesanan" className="relative p-2 text-surface hover:text-secondary transition-colors" aria-label="Notifikasi">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                
                <Link href="/keranjang" className="relative p-2 text-surface hover:text-secondary transition-colors" aria-label="Keranjang">
                  <ShoppingCart className="h-6 w-6" />
                </Link>

                <div className="flex items-center space-x-4 ml-2">
                  <Link 
                    href={session.role === "SUPER_ADMIN" ? "/admin" : "/dashboard"} 
                    className="p-2 text-surface hover:text-secondary transition-colors relative group"
                    aria-label="Dashboard"
                  >
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="absolute top-10 right-0 w-max bg-surface text-text-main text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      Dashboard
                    </span>
                  </Link>
                  <Link 
                    href={session.role === "SUPER_ADMIN" ? "/admin/akun" : (storeSlug ? `/bumdes/${storeSlug}` : "/dashboard")} 
                    className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center text-secondary-dark font-bold hover:scale-105 transition-transform group relative"
                    aria-label={session.role === "SUPER_ADMIN" ? "Manajemen Akun" : "Profil Publik BUMDes"}
                  >
                    <User className="h-5 w-5" />
                    {session.role === "BUMDES_ADMIN" && storeSlug && (
                      <span className="absolute top-10 right-0 w-max bg-surface text-text-main text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Lihat Profil Publik
                      </span>
                    )}
                    {session.role === "SUPER_ADMIN" && (
                      <span className="absolute top-10 right-0 w-max bg-surface text-text-main text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Manajemen Akun
                      </span>
                    )}
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-2">
                <Link 
                  href="/login" 
                  className="text-surface/90 hover:text-secondary font-medium transition-colors"
                >
                  Masuk
                </Link>
                <Link 
                  href="/register" 
                  className="bg-secondary text-secondary-dark font-bold px-4 py-2 rounded hover:bg-secondary/90 transition-colors text-sm"
                >
                  Daftarkan BUMDes
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="md:hidden flex items-center space-x-1 justify-end">
            {session && (
              <>
                {session.role === "BUMDES_ADMIN" && (
                  <Link href="/dashboard/pesanan" className="relative p-2 text-surface hover:text-secondary transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link href="/keranjang" className="p-2 text-surface hover:text-secondary transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </>
            )}
            <button onClick={toggleMobileMenu} className="text-surface p-2 focus:outline-none">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden pb-4 px-1">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-surface border border-border text-text-main rounded-md pl-3 pr-2 focus:outline-none focus:ring-1 focus:ring-secondary text-sm placeholder-text-muted min-w-0"
            />
            <button 
              type="submit"
              className="h-10 px-4 bg-secondary hover:bg-secondary/90 text-secondary-dark rounded-md flex items-center justify-center transition-colors border border-secondary flex-shrink-0"
              aria-label="Cari"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-dark border-t border-primary/20">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-surface hover:bg-primary" onClick={toggleMobileMenu}>
              Beranda
            </Link>
            <Link href="/produk" className="block px-3 py-2 rounded-md text-base font-medium text-surface hover:bg-primary" onClick={toggleMobileMenu}>
              Produk
            </Link>
            <Link href="/bumdes" className="block px-3 py-2 rounded-md text-base font-medium text-surface hover:bg-primary" onClick={toggleMobileMenu}>
              BUMDes
            </Link>
            <Link href="/#cara-kerja" className="block px-3 py-2 rounded-md text-base font-medium text-surface hover:bg-primary" onClick={toggleMobileMenu}>
              Cara Kerja
            </Link>
            
            <div className="border-t border-primary mt-4 pt-4">
              {session ? (
                <Link href={session.role === "SUPER_ADMIN" ? "/admin" : "/dashboard"} className="block px-3 py-2 rounded-md text-base font-bold text-secondary hover:bg-primary" onClick={toggleMobileMenu}>
                  Dashboard Akun
                </Link>
              ) : (
                <div className="flex flex-col space-y-2 mt-2">
                  <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-surface hover:bg-primary text-center" onClick={toggleMobileMenu}>
                    Masuk
                  </Link>
                  <Link href="/register" className="block px-3 py-2 rounded-md text-base font-bold text-secondary-dark bg-secondary hover:bg-secondary/90 text-center" onClick={toggleMobileMenu}>
                    Daftarkan BUMDes
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
