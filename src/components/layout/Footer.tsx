"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on dashboard and admin pages
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/pesanan")) {
    return null;
  }

  return (
    <footer className="bg-surface border-t border-border mt-auto pt-8 md:pt-20 pb-6 md:pb-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-12 lg:gap-16 mb-8 md:mb-16">
          <div className="lg:col-span-2 pr-0 lg:pr-12 text-left">
            <h3 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6 flex items-center justify-start gap-2 md:gap-3">
              <img src="/images/logo.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              GeraiBUMDes
            </h3>
            <p className="text-text-muted mb-4 md:mb-6 leading-relaxed max-w-sm text-sm md:text-[15px]">
              Membangun kekuatan ekonomi dari desa untuk desa. GeraiBUMDes merajut kolaborasi antar-BUMDes se-Nusantara untuk saling melengkapi kebutuhan komoditas dan mensejahterakan warga bersama.
            </p>
          </div>
          
          <div>
            <h4 className="text-[15px] md:text-lg font-semibold text-text-main mb-2 md:mb-6">Tentang</h4>
            <ul className="space-y-1.5 md:space-y-3 text-sm md:text-base">
              <li><Link href="/" className="text-text-muted hover:text-primary transition-colors">Tentang Kami</Link></li>
              <li><Link href="/#cara-kerja" className="text-text-muted hover:text-primary transition-colors">Cara Kerja</Link></li>
              <li><Link href="#" className="text-text-muted hover:text-primary transition-colors">Karir</Link></li>
              <li><Link href="#" className="text-text-muted hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[15px] md:text-lg font-semibold text-text-main mb-2 md:mb-6">Mitra BUMDes</h4>
            <ul className="space-y-1.5 md:space-y-3 text-sm md:text-base">
              <li><Link href="/register" className="text-text-muted hover:text-primary transition-colors">Daftar BUMDes</Link></li>
              <li><Link href="/login" className="text-text-muted hover:text-primary transition-colors">Masuk BUMDes</Link></li>
              <li><Link href="/bumdes" className="text-text-muted hover:text-primary transition-colors">Direktori Mitra</Link></li>
              <li><Link href="/produk" className="text-text-muted hover:text-primary transition-colors">Semua Produk</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[15px] md:text-lg font-semibold text-text-main mb-2 md:mb-6">Kontak</h4>
            <ul className="space-y-2 md:space-y-4 text-sm md:text-base">
              <li className="flex items-start gap-3 text-text-muted">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <a 
                  href="https://maps.google.com/?q=STIMI+YAPMI+Makassar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors leading-relaxed"
                >
                  STIMI YAPMI Makassar, Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan
                </a>
              </li>
              <li className="flex items-start gap-3 text-text-muted">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a 
                    href="https://wa.me/6285174489071" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-primary transition-colors"
                  >
                    +62 851-7448-9071
                  </a>
                  <a 
                    href="https://wa.me/628998701617" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-primary transition-colors"
                  >
                    +62 899-8701-617
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-text-muted">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:halo@geraibumdes.com" className="hover:text-primary transition-colors">
                  halo@geraibumdes.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-4 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 text-xs md:text-sm text-text-muted">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} GeraiBUMDes. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4 md:gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-primary transition-colors">Syarat Layanan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
