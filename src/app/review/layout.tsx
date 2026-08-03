import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Menu, Search, User, X, LayoutDashboard, ShieldCheck } from "lucide-react";

// Minimal Review Navbar
function ReviewNavbar() {
  return (
    <nav className="glass-nav text-text-main sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between py-3 min-h-[80px] items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/review" className="text-xl sm:text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
              <span className="hidden sm:inline-block">GeraiBumdes <span className="text-xs text-cta bg-cta/10 px-2 py-1 rounded">REVIEW MODE</span></span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-4xl mx-8 items-center gap-3">
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link href="/review/marketplace" className="h-11 px-4 rounded-xl flex items-center justify-center hover:bg-surface-bg transition-colors text-sm font-medium">
                Marketplace
              </Link>
              <Link href="/review/profile" className="h-11 px-4 rounded-xl flex items-center justify-center hover:bg-surface-bg transition-colors text-sm font-medium">
                Profil BUMDes
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Link href="/review/dashboard" className="p-2 text-text-muted hover:text-primary transition-colors flex items-center gap-2 border-r border-border pr-4 mr-2">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-sm font-semibold">Dashboard Mock</span>
            </Link>
            <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NEXT_PUBLIC_ENABLE_REVIEW_MODE !== "true") {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ReviewNavbar />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
