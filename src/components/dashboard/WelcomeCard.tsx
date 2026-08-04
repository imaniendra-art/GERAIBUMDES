"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface WelcomeCardProps {
  show: boolean;
}

export function WelcomeCard({ show }: WelcomeCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  return (
    <div className="bg-gradient-to-br from-primary-dark via-primary to-primary-light border-none rounded-3xl p-8 sm:p-10 shadow-lg text-white mb-8 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="relative z-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-3">
          🎉 Selamat Datang di GeraiBUMDes
        </h2>
        <div className="text-white/90 text-base sm:text-lg mb-8 leading-relaxed">
          <p className="mb-1">Selamat, akun BUMDes Anda telah berhasil diverifikasi oleh Admin GeraiBUMDes.</p>
          <p>Sekarang tinggal beberapa langkah lagi agar toko Anda siap menerima pesanan dari seluruh Indonesia.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/produk/tambah" className="w-full sm:w-auto">
            <Button className="bg-warning text-warning-dark hover:bg-warning/90 font-bold border-none w-full sm:w-auto">
              Mulai Persiapan Toko
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => setDismissed(true)}
            className="w-full sm:w-auto bg-white/10 border-white/20 hover:bg-white/20 hover:text-white text-white font-medium"
          >
            Lewati
          </Button>
        </div>
      </div>
    </div>
  );
}
