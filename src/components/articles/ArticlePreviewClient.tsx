"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Globe,
  Share2,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  ExternalLink
} from "lucide-react";
import ArticleContentRenderer from "./ArticleContentRenderer";

interface ArticlePreviewClientProps {
  article: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    pdfUrl?: string;
    pdfName?: string;
    category: string;
    status: "DRAFT" | "PUBLISHED";
    authorType: "SUPER_ADMIN" | "BUMDES_ADMIN";
    authorId?: {
      name: string;
      email: string;
    };
    bumdesId?: {
      name: string;
      villageName?: string;
    };
    storeId?: {
      name: string;
      slug: string;
      logoUrl?: string;
    };
    createdAt: string;
    publishedAt?: string;
  };
  basePath: string; // "/dashboard/kabar-bumdes" or "/admin/kabar-bumdes"
}

export default function ArticlePreviewClient({ article: initialArticle, basePath }: ArticlePreviewClientProps) {
  const router = useRouter();
  const [article, setArticle] = useState(initialArticle);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const toggleStatus = async (newStatus: "DRAFT" | "PUBLISHED") => {
    setIsUpdating(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/articles/${article._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status artikel.");

      setArticle((prev) => ({
        ...prev,
        status: newStatus,
        publishedAt: newStatus === "PUBLISHED" ? new Date().toISOString() : prev.publishedAt,
      }));

      setNotification({
        type: "success",
        text:
          newStatus === "PUBLISHED"
            ? "Selamat! Berita berhasil diterbitkan dan sekarang dapat dibaca oleh publik."
            : "Berita berhasil ditarik kembali ke Draft.",
      });
      router.refresh();
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err.message || "Terjadi kesalahan saat memperbarui status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const authorName =
    article.authorType === "SUPER_ADMIN"
      ? "Admin GeraiBUMDes (Resmi)"
      : article.bumdesId?.name || article.authorId?.name || "Mitra BUMDes";

  const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-surface-bg pb-24">
      {/* Sticky Floating Control Bar for Author / Admin */}
      <div className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-border shadow-md px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link
              href={basePath}
              className="p-2 text-text-muted hover:text-text-main hover:bg-surface-bg rounded-xl transition-colors"
              title="Kembali ke Daftar Kabar"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Mode Pratinjau:
              </span>
              {article.status === "PUBLISHED" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/30">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Tayang di Publik
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warning/15 text-earth-dark border border-warning/40">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  Draft (Belum Tayang)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: Sunting Kembali & Publish */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Link
              href={`${basePath}/edit/${article._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-bg border border-border text-text-main font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-primary" />
              <span>Sunting Narasi Kembali</span>
            </Link>

            {article.status === "DRAFT" ? (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => toggleStatus("PUBLISHED")}
                className="inline-flex items-center gap-2 px-5 py-2 bg-cta hover:brightness-95 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                <span>Terbitkan Sekarang (Publish)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href={`/kabar-bumdes/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Lihat di Publik</span>
                </a>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => toggleStatus("DRAFT")}
                  className="px-4 py-2 bg-surface-bg hover:bg-surface border border-border text-danger font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Memproses..." : "Tarik ke Draft"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border shadow-sm ${
              notification.type === "success"
                ? "bg-success/10 text-success border-success/20"
                : "bg-danger/10 text-danger border-danger/20"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <div className="flex-1">{notification.text}</div>
            {article.status === "PUBLISHED" && (
              <Link
                href={`/kabar-bumdes/${article.slug}`}
                className="underline font-bold text-sm ml-2"
                target="_blank"
              >
                Buka Halaman Artikel $\rightarrow$
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ARTICLE PUBLIC CONTAINER (100% PREVIEW OF PUBLIC VIEW) */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* Meta Header */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wide">
              {article.category}
            </span>
            <span className="text-text-muted text-xs">•</span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-text-main tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Author Badge */}
          <div className="flex items-center gap-3 pt-2 pb-4 border-b border-border">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base overflow-hidden shrink-0 border border-border">
              {article.storeId?.logoUrl ? (
                <img src={article.storeId.logoUrl} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-text-main">{authorName}</p>
              <p className="text-xs text-text-muted">
                {article.authorType === "SUPER_ADMIN" ? "Official Platform Update" : "Mitra BUMDes Terverifikasi"}
              </p>
            </div>
          </div>

          {/* Lead Paragraph / Excerpt */}
          <p className="text-base sm:text-xl font-medium text-text-muted italic leading-relaxed border-l-4 border-primary pl-4 py-1">
            "{article.excerpt}"
          </p>
        </div>

        {/* Cover Image */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-border shadow-sm mb-8 bg-surface-bg max-h-[520px] flex items-center justify-center">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-auto max-h-[520px] object-cover"
          />
        </div>

        {/* Rendered Content */}
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-sm">
          <ArticleContentRenderer
            content={article.content}
            pdfUrl={article.pdfUrl}
            pdfName={article.pdfName}
          />
        </div>

      </article>
    </div>
  );
}
