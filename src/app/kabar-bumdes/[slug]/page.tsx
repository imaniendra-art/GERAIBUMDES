import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import ArticleContentRenderer from "@/components/articles/ArticleContentRenderer";
import {
  Calendar,
  Building2,
  ChevronRight,
  Share2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Eye,
  ExternalLink
} from "lucide-react";
import ArticleShareBar from "./ArticleShareBar";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const article = await Article.findOne({ slug, status: "PUBLISHED" }).lean();

  if (!article) {
    return {
      title: "Kabar Tidak Ditemukan - GeraiBUMDes",
    };
  }

  return {
    title: `${article.title} - Kabar BUMDes`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    },
  };
}

export default async function KabarBumdesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  await dbConnect();

  // Find article and increment view count
  const article = await Article.findOneAndUpdate(
    { slug, status: "PUBLISHED" },
    { $inc: { viewsCount: 1 } },
    { new: true }
  )
    .populate("authorId", "name email")
    .populate("bumdesId", "name villageName")
    .populate("storeId", "name slug logoUrl")
    .lean();

  if (!article) {
    notFound();
  }

  // Get 3 other related recent articles
  const otherArticles = await Article.find({
    status: "PUBLISHED",
    _id: { $ne: article._id },
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  const authorName =
    article.authorType === "SUPER_ADMIN"
      ? "Admin GeraiBUMDes"
      : article.bumdesId?.name || "Mitra BUMDes";

  const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-surface-bg pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="bg-surface border-b border-border py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs text-text-muted overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />
          <Link href="/kabar-bumdes" className="hover:text-primary transition-colors">
            Kabar BUMDes
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />
          <span className="text-text-main font-semibold truncate max-w-xs sm:max-w-md">
            {article.title}
          </span>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 md:mt-12">
        
        {/* Article Meta Header */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wide">
              {article.category}
            </span>
            <span className="text-text-muted text-xs">•</span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              {formattedDate}
            </span>
            {article.viewsCount > 1 && (
              <>
                <span className="text-text-muted text-xs">•</span>
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Eye className="w-3.5 h-3.5" />
                  {article.viewsCount} kali dibaca
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-text-main tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Author Card & Share Actions */}
          <div className="pt-3 pb-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base overflow-hidden shrink-0 border border-border">
                {article.storeId?.logoUrl ? (
                  <img src={article.storeId.logoUrl} alt={authorName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm sm:text-base text-text-main">{authorName}</p>
                  {article.storeId?.slug && (
                    <Link
                      href={`/bumdes/${article.storeId.slug}`}
                      className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Kunjungi Profil</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  {article.authorType === "SUPER_ADMIN"
                    ? "Rilis Resmi Pengelola Platform"
                    : `Mitra BUMDes ${article.bumdesId?.villageName ? `Desa ${article.bumdesId.villageName}` : "Terverifikasi"}`}
                </p>
              </div>
            </div>

            {/* Interactive Share Button Bar */}
            <ArticleShareBar title={article.title} />
          </div>

          {/* Excerpt Lead */}
          <p className="text-base sm:text-lg font-medium text-text-muted italic leading-relaxed border-l-4 border-primary pl-4 sm:pl-5 py-1">
            "{article.excerpt}"
          </p>
        </div>

        {/* Hero Cover Image */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-border shadow-sm mb-10 bg-surface-bg max-h-[540px] flex items-center justify-center">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-auto max-h-[540px] object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
          <ArticleContentRenderer
            content={article.content}
            pdfUrl={article.pdfUrl}
            pdfName={article.pdfName}
          />
        </div>

        {/* Back Link */}
        <div className="mt-8 flex justify-start">
          <Link
            href="/kabar-bumdes"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface hover:bg-surface-bg border border-border text-text-main font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>Kembali ke Semua Kabar BUMDes</span>
          </Link>
        </div>

        {/* Other Recent Stories */}
        {otherArticles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-text-main">
                Kabar BUMDes Lainnya
              </h3>
              <Link
                href="/kabar-bumdes"
                className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {otherArticles.map((other: any) => (
                <Link
                  key={other._id.toString()}
                  href={`/kabar-bumdes/${other.slug}`}
                  className="group bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-[16/10] w-full bg-surface-bg overflow-hidden">
                    <img
                      src={other.coverImage}
                      alt={other.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-bold text-sm text-text-main line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {other.title}
                    </h4>
                    <span className="text-[11px] text-text-muted">
                      {new Date(other.publishedAt || other.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
  );
}
