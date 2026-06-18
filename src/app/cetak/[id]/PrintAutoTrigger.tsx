"use client";

import { useEffect } from "react";

export default function PrintAutoTrigger() {
  useEffect(() => {
    // Memberikan jeda sedikit agar semua font/gambar termuat sebelum print
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}
