"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Cetak Invoice", icon, href }: { label?: string, icon?: React.ReactNode, href: string }) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main print:hidden"
    >
      {icon || <Printer className="h-4 w-4 mr-2" />} {label}
    </a>
  );
}
