import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ReviewIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-main mb-4">UI/UX Review Mode</h1>
        <p className="text-lg text-text-muted">
          Mode ini digunakan untuk meninjau desain komponen dan halaman dengan data dummy. 
          Sepenuhnya terisolasi dari database dan API produksi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface rounded-2xl shadow-natural border border-border p-8 hover-lift">
          <h2 className="text-2xl font-bold text-primary mb-2">Marketplace</h2>
          <p className="text-text-muted mb-6">Penjelajahan produk dan katalog BUMDes.</p>
          <div className="flex flex-col gap-3">
            <Link href="/review/marketplace">
              <Button variant="outline" className="w-full justify-start">Beranda / Marketplace</Button>
            </Link>
            <Link href="/review/product">
              <Button variant="outline" className="w-full justify-start">Detail Produk</Button>
            </Link>
            <Link href="/review/profile">
              <Button variant="outline" className="w-full justify-start">Profil Publik BUMDes</Button>
            </Link>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-natural border border-border p-8 hover-lift">
          <h2 className="text-2xl font-bold text-cta mb-2">Dashboard (Mock)</h2>
          <p className="text-text-muted mb-6">Simulasi panel admin tanpa perlu login autentikasi.</p>
          <div className="flex flex-col gap-3">
            <Link href="/review/dashboard">
              <Button variant="outline" className="w-full justify-start">Overview Statistik</Button>
            </Link>
            <Link href="/review/dashboard/products">
              <Button variant="outline" className="w-full justify-start">Manajemen Produk</Button>
            </Link>
            <Link href="/review/dashboard/orders">
              <Button variant="outline" className="w-full justify-start">Kelola Pesanan</Button>
            </Link>
            <Link href="/review/dashboard/users">
              <Button variant="outline" className="w-full justify-start">Manajemen Pengguna</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
