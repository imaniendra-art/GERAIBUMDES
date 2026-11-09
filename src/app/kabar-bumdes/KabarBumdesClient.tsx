"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  Building2,
  FileDown,
  ArrowRight,
  Sparkles,
  Newspaper
} from "lucide-react";

interface ArticleItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  pdfUrl?: string;
  category: string;
  authorType: "SUPER_ADMIN" | "BUMDES_ADMIN";
  authorId?: {
    name: string;
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
  publishedAt?: string;
  createdAt: string;
  viewsCount?: number;
}

interface KabarBumdesClientProps {
  articles: ArticleItem[];
}

const CATEGORIES = [
  "Semua",
  "Kabar Desa",
  "Inovasi Produk",
  "Kegiatan BUMDes",
  "Pengumuman Resmi",
  "Tips & Edukasi",
];

export default function KabarBumdesClient({ articles }: KabarBumdesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.bumdesId?.name && item.bumdesId.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles[0];
  const regularArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen bg-surface-bg pb-24">
      {/* Hero Header */}
      <section className="bg-surface border-b border-border py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight mb-4">
            Kabar & Inspirasi <span className="text-primary">BUMDes Nusantara</span>
          </h1>

          <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed mb-8">
            Liputan kegiatan desa, kisah sukses panen komoditas unggulan, pengumuman resmi, dan inovasi usaha BUMDes dari Sabang sampai Merauke.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kabar panen, komoditas, atau nama BUMDes..."
              className="w-full h-12 pl-12 pr-4 bg-surface-bg border border-border text-text-main rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm text-sm sm:text-base placeholder-text-muted transition-all"
            />
            <Search className="w-5 h-5 text-text-muted absolute left-4 top-3.5" />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-bg hover:bg-surface border border-border text-text-muted hover:text-text-main"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Main Articles Container */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-14">
        
        {filteredArticles.length === 0 ? (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <Newspaper className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-text-main mb-1">Belum Ada Kabar yang Ditemukan</h3>
            <p className="text-sm text-text-muted">
              Tidak ada berita yang cocok dengan kata kunci atau filter kategori yang dipilih.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* FEATURED STORY BANNER (Only when first item exists and search is not actively narrowing small results) */}
            {featuredArticle && (
              <Link
                href={`/kabar-bumdes/${featuredArticle.slug}`}
                className="group block bg-surface border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-hover-lift transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] bg-surface-bg overflow-hidden">
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-md">
                        {featuredArticle.category}
                      </span>
                      {featuredArticle.pdfUrl && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-danger text-white flex items-center gap-1 shadow-md">
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-main tracking-tight leading-tight group-hover:text-primary transition-colors mb-3">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-sm sm:text-base text-text-muted line-clamp-3 leading-relaxed mb-6">
                        {featuredArticle.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {featuredArticle.storeId?.logoUrl ? (
                            <img src={featuredArticle.storeId.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-text-main truncate max-w-[180px]">
                          {featuredArticle.authorType === "SUPER_ADMIN"
                            ? "Admin GeraiBUMDes"
                            : featuredArticle.bumdesId?.name || "Mitra BUMDes"}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* REGULAR ARTICLES GRID */}
            {regularArticles.length > 0 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-main mb-6">
                  Kabar & Berita Lainnya
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularArticles.map((article) => {
                    const dateStr = new Date(article.publishedAt || article.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    const authorName =
                      article.authorType === "SUPER_ADMIN"
                        ? "Admin Platform"
                        : article.bumdesId?.name || "Mitra BUMDes";

                    return (
                      <Link
                        key={article._id}
                        href={`/kabar-bumdes/${article.slug}`}
                        className="group bg-surface border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-hover-lift transition-all flex flex-col"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[16/10] w-full bg-surface-bg overflow-hidden">
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white">
                              {article.category}
                            </span>
                            {article.pdfUrl && (
                              <span className="p-1 rounded-full bg-danger text-white shadow-sm" title="Ada Lampiran Dokumen PDF">
                                <FileDown className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{dateStr}</span>
                            </div>

                            <h4 className="font-bold text-base sm:text-lg text-text-main line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                              {article.title}
                            </h4>

                            <p className="text-xs sm:text-sm text-text-muted line-clamp-2 leading-relaxed mb-4">
                              {article.excerpt}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                                {article.storeId?.logoUrl ? (
                                  <img src={article.storeId.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                  <Building2 className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <span className="font-medium text-text-main truncate max-w-[130px]">
                                {authorName}
                              </span>
                            </div>

                            <span className="font-bold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                              <span>Baca</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
