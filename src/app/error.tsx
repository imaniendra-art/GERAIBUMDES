"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error without exposing stack trace to users
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative w-20 h-20 mb-6">
        <Image
          src="/images/logo.png"
          alt="GeraiBumdes Logo"
          fill
          className="object-contain opacity-70 grayscale"
          priority
        />
      </div>
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-error uppercase bg-error/10 rounded-full">
        Gangguan Sistem
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight mb-3">
        Terjadi Sedikit Kendala
      </h2>
      <p className="max-w-md text-text-muted mb-8 text-sm sm:text-base leading-relaxed">
        Sistem mengalami gangguan saat memproses data. Anda dapat mencoba memuat ulang halaman atau kembali ke beranda.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-primary hover:brightness-95 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
        >
          Muat Ulang Halaman
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 bg-surface-bg border border-border hover:bg-surface text-text-main rounded-xl font-medium text-sm transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
