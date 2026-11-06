import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import ArticleListClient from "@/components/articles/ArticleListClient";

export const metadata = {
  title: "Kelola Kabar BUMDes - Super Admin",
};

export default async function AdminKabarBumdesPage() {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    redirect("/login");
  }

  await dbConnect();

  const articles = await Article.find({})
    .populate("authorId", "name email")
    .populate("bumdesId", "name villageName")
    .populate("storeId", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  const serializedArticles = articles.map((doc: any) => ({
    _id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    coverImage: doc.coverImage,
    pdfUrl: doc.pdfUrl,
    category: doc.category,
    status: doc.status,
    authorType: doc.authorType,
    authorId: doc.authorId ? { name: doc.authorId.name, email: doc.authorId.email } : undefined,
    bumdesId: doc.bumdesId ? { name: doc.bumdesId.name, villageName: doc.bumdesId.villageName } : undefined,
    storeId: doc.storeId ? { name: doc.storeId.name, slug: doc.storeId.slug } : undefined,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : undefined,
    viewsCount: doc.viewsCount || 0,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <ArticleListClient
        initialArticles={serializedArticles}
        basePath="/admin/kabar-bumdes"
        isSuperAdmin={true}
      />
    </div>
  );
}
