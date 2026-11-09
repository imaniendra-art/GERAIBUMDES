import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import ArticlePreviewClient from "@/components/articles/ArticlePreviewClient";

export const metadata = {
  title: "Pratinjau Berita - Super Admin",
};

export default async function AdminPreviewKabarBumdesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  const { id } = await params;
  await dbConnect();

  const article = await Article.findById(id)
    .populate("authorId", "name email")
    .populate("bumdesId", "name villageName")
    .populate("storeId", "name slug logoUrl")
    .lean();

  if (!article) {
    notFound();
  }

  const serializedArticle = {
    _id: article._id.toString(),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    coverImage: article.coverImage,
    pdfUrl: article.pdfUrl,
    pdfName: article.pdfName,
    category: article.category,
    status: article.status,
    authorType: article.authorType,
    authorId: article.authorId ? { name: article.authorId.name, email: article.authorId.email } : undefined,
    bumdesId: article.bumdesId ? { name: article.bumdesId.name, villageName: article.bumdesId.villageName } : undefined,
    storeId: article.storeId ? { name: article.storeId.name, slug: article.storeId.slug, logoUrl: article.storeId.logoUrl } : undefined,
    createdAt: article.createdAt ? article.createdAt.toISOString() : new Date().toISOString(),
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : undefined,
  };

  return <ArticlePreviewClient article={serializedArticle} basePath="/admin/kabar-bumdes" />;
}
