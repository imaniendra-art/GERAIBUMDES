import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import ArticleForm from "@/components/articles/ArticleForm";

export const metadata = {
  title: "Sunting Kabar BUMDes - Dashboard BUMDes",
};

export default async function EditKabarBumdesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  await dbConnect();

  const article = await Article.findById(id).lean();
  if (!article) {
    notFound();
  }

  // Ensure only author can edit
  if (article.authorId.toString() !== session.userId) {
    redirect("/dashboard/kabar-bumdes");
  }

  const serializedArticle = {
    _id: article._id.toString(),
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    content: article.content,
    coverImage: article.coverImage,
    pdfUrl: article.pdfUrl,
    pdfName: article.pdfName,
    status: article.status,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/kabar-bumdes"
          className="p-2 text-text-muted hover:text-text-main hover:bg-surface rounded-xl transition-colors"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Sunting Narasi Kabar
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Perbarui narasi, foto dokumentasi, atau dokumen lampiran berita.
          </p>
        </div>
      </div>

      <ArticleForm initialData={serializedArticle} basePath="/dashboard/kabar-bumdes" />
    </div>
  );
}
