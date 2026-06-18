import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-surface/80 py-12 mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-surface mb-4">geraibumdes.com</h3>
            <p className="max-w-sm mb-6 leading-relaxed">
              geraibumdes.com membantu BUMDes saling terhubung, saling memasok, dan saling menguatkan ekonomi desa. Pasar digital antar-BUMDes untuk masa depan desa yang mandiri.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-surface mb-4">Navigasi</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-secondary transition-colors">Beranda</Link></li>
              <li><Link href="/produk" className="hover:text-secondary transition-colors">Semua Produk</Link></li>
              <li><Link href="/toko" className="hover:text-secondary transition-colors">Toko BUMDes</Link></li>
              <li><Link href="/register" className="hover:text-secondary transition-colors text-secondary">Daftarkan BUMDes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-surface mb-4">Akses BUMDes</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="hover:text-secondary transition-colors font-medium text-surface">Masuk</Link></li>
              <li><Link href="/#cara-kerja" className="hover:text-secondary transition-colors">Cara Kerja</Link></li>
              <li><Link href="#" className="hover:text-secondary transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface/20 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} geraibumdes.com. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
