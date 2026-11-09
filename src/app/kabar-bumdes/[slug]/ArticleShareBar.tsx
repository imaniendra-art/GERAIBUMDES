"use client";

import { useState } from "react";
import { Share2, Check, MessageCircle } from "lucide-react";

export default function ArticleShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window === "undefined") return;
    const text = encodeURIComponent(`*${title}*\n\nBaca selengkapnya di GeraiBUMDes:\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-bg hover:bg-surface border border-border text-text-main rounded-xl text-xs font-semibold transition-colors shadow-sm"
        title="Salin Tautan Berita"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Share2 className="w-3.5 h-3.5 text-text-muted" />}
        <span>{copied ? "Tautan Disalin!" : "Bagikan"}</span>
      </button>

      <button
        onClick={handleWhatsAppShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/20 rounded-xl text-xs font-semibold transition-colors shadow-sm"
        title="Bagikan ke WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>WhatsApp</span>
      </button>
    </div>
  );
}
