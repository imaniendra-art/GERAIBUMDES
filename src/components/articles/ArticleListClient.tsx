"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  FileDown
} from "lucide-react";

interface ArticleItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  pdfUrl?: string;
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
  };
  createdAt: string;
  publishedAt?: string;
  viewsCount?: number;
}

interface ArticleListClientProps {
  initialArticles: ArticleItem[];
  basePath: string; // "/dashboard/kabar-bumdes" or "/admin/kabar-bumdes"
  isSuperAdmin?: boolean;
}

export default function ArticleListClient({
  initialArticles,
  basePath,
  isSuperAdmin = false,
}: ArticleListClientProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filter articles locally
  const filteredArticles = articles.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.bumdesId?.name && item.bumdesId.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "ALL" || item.status === selectedStatus;

    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus berita "${title}"?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus berita.");

      setArticles((prev) => prev.filter((a) => a._id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menghapus berita.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: "DRAFT" | "PUBLISHED") => {
    const newStatus = currentStatus === "DRAFT" ? "PUBLISHED" : "DRAFT";
    try {
      const res = await fetch(`/api/articles/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status.");

      setArticles((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Kabar BUMDes & Informasi
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {isSuperAdmin
              ? "Kelola semua berita dan publikasi dari BUMDes seluruh Indonesia serta rilis berita resmi platform."
              : "Tulis dan publikasikan cerita, inovasi produk, panen raya, dan kabar terbaru dari BUMDes Anda."}
          </p>
        </div>

        <Link
          href={`${basePath}/tambah`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-cta hover:brightness-95 text-white font-bold rounded-xl text-sm shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Kabar Baru</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari judul berita atau desa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-main placeholder-text-muted"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-surface-bg border border-border rounded-xl text-xs sm:text-sm font-medium text-text-main focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="PUBLISHED">Tayang (Published)</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-surface-bg border border-border rounded-xl text-xs sm:text-sm font-medium text-text-main focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Kabar Desa">Kabar Desa</option>
            <option value="Inovasi Produk">Inovasi Produk</option>
            <option value="Kegiatan BUMDes">Kegiatan BUMDes</option>
            <option value="Pengumuman Resmi">Pengumuman Resmi</option>
            <option value="Tips & Edukasi">Tips & Edukasi</option>
          </select>
        </div>
      </div>

      {/* Article List Grid / Table */}
      {filteredArticles.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-text-main mb-1">Belum Ada Kabar yang Ditulis</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
            Mulai bagikan cerita kesuksesan, panen raya, inovasi produk, atau kegiatan penting BUMDes ke publik.
          </p>
          <Link
            href={`${basePath}/tambah`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm shadow-sm hover:bg-primary-dark transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Tulis Sekarang</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => {
            const dateStr = new Date(article.publishedAt || article.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={article._id}
                className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image thumbnail with badges */}
                <div className="relative aspect-[16/9] w-full bg-surface-bg overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white shadow-sm">
                      {article.category}
                    </span>
                    {article.pdfUrl && (
                      <span className="p-1 rounded-full bg-danger text-white shadow-sm" title="Ada Lampiran Dokumen PDF">
                        <FileDown className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    {article.status === "PUBLISHED" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success text-white shadow-sm">
                        Tayang
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-warning text-text-main shadow-sm">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Content info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                      {isSuperAdmin && article.bumdesId?.name && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-primary truncate max-w-[150px]">
                            {article.bumdesId.name}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-text-main line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {/* Preview Button */}
                      <Link
                        href={`${basePath}/preview/${article._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-surface-bg hover:bg-surface border border-border text-text-main rounded-lg text-xs font-bold transition-colors"
                        title="Lihat Pratinjau Publik"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span>Pratinjau</span>
                      </Link>

                      {/* Edit Button */}
                      <Link
                        href={`${basePath}/edit/${article._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-surface-bg hover:bg-surface border border-border text-text-main rounded-lg text-xs font-bold transition-colors"
                        title="Sunting Berita"
                      >
                        <Edit className="w-3.5 h-3.5 text-text-muted" />
                        <span>Sunting</span>
                      </Link>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Quick Status Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(article._id, article.status)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                          article.status === "DRAFT"
                            ? "bg-cta/10 text-cta hover:bg-cta hover:text-white"
                            : "bg-surface-bg text-text-muted hover:text-text-main"
                        }`}
                        title={article.status === "DRAFT" ? "Klik untuk Terbitkan" : "Klik untuk Tarik ke Draft"}
                      >
                        {article.status === "DRAFT" ? "Publish" : "Draft"}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        disabled={isDeleting === article._id}
                        onClick={() => handleDelete(article._id, article.title)}
                        className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Hapus Berita"
                      >
                        {isDeleting === article._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
