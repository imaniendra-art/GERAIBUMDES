import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto pt-16 pb-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              GeraiBUMDes
            </h3>
            <p className="text-text-muted mb-6 leading-relaxed max-w-sm">
              GeraiBUMDes menghubungkan potensi desa di seluruh Indonesia. Platform marketplace BUMDes untuk masa depan desa yang mandiri dan profesional.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-text-main mb-6">Tentang</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-text-muted hover:text-primary transition-colors">Tentang Kami</Link></li>
              <li><Link href="/#cara-kerja" className="text-text-muted hover:text-primary transition-colors">Cara Kerja</Link></li>
              <li><Link href="#" className="text-text-muted hover:text-primary transition-colors">Karir</Link></li>
              <li><Link href="#" className="text-text-muted hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-text-main mb-6">Mitra BUMDes</h4>
            <ul className="space-y-3">
              <li><Link href="/register" className="text-text-muted hover:text-primary transition-colors">Daftar BUMDes</Link></li>
              <li><Link href="/login" className="text-text-muted hover:text-primary transition-colors">Masuk BUMDes</Link></li>
              <li><Link href="/bumdes" className="text-text-muted hover:text-primary transition-colors">Direktori Mitra</Link></li>
              <li><Link href="/produk" className="text-text-muted hover:text-primary transition-colors">Semua Produk</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-text-main mb-6">Kontak</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-text-muted">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Gedung Kementerian Desa, Jakarta Selatan, Indonesia</span>
              </li>
              <li className="flex items-center gap-3 text-text-muted">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span>0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-3 text-text-muted">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>halo@geraibumdes.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} GeraiBUMDes. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-primary transition-colors">Syarat Layanan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
