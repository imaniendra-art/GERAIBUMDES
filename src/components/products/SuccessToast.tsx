"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export function SuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShow(true);
      // Clean up URL without triggering a full page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  if (!show) return null;

  return (
    <div className="fixed top-24 right-4 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
      <div className="bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 max-w-sm">
        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#137333]" />
        <div>
          <p className="font-semibold text-sm">Produk berhasil ditambahkan.</p>
          <p className="text-sm mt-0.5 opacity-90">Produk Anda sedang menunggu proses verifikasi Admin.</p>
        </div>
      </div>
    </div>
  );
}
