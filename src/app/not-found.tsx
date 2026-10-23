import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative w-24 h-24 mb-6">
        <Image
          src="/images/logo.png"
          alt="GeraiBumdes Logo"
          fill
          className="object-contain opacity-80"
          priority
        />
      </div>
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
        Galat 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight mb-3">
        Halaman Tidak Ditemukan
      </h1>
      <p className="max-w-md text-text-muted mb-8 text-sm sm:text-base leading-relaxed">
        Maaf, tautan atau halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau belum tersedia di GeraiBumdes.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 bg-primary hover:brightness-95 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/produk"
          className="px-6 py-2.5 bg-surface-bg border border-border hover:bg-surface text-text-main rounded-xl font-medium text-sm transition-colors"
        >
          Jelajahi Produk BUMDes
        </Link>
      </div>
    </div>
  );
}
