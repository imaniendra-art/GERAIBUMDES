import { Metadata } from "next";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import KabarBumdesClient from "./KabarBumdesClient";

export const metadata: Metadata = {
  title: "Kabar & Inspirasi BUMDes Nusantara - GeraiBUMDes",
  description:
    "Portal berita dan informasi seputar kegiatan BUMDes, panen raya komoditas unggulan desa, inovasi UMKM, dan pengumuman resmi platform GeraiBUMDes.",
};

export const revalidate = 60; // ISR cache revalidation every 60s

export default async function KabarBumdesPage() {
  await dbConnect();

  const articles = await Article.find({ status: "PUBLISHED" })
    .populate("authorId", "name email")
    .populate("bumdesId", "name villageName")
    .populate("storeId", "name slug logoUrl")
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();

  const serializedArticles = articles.map((doc: any) => ({
    _id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    coverImage: doc.coverImage,
    pdfUrl: doc.pdfUrl,
    category: doc.category,
    authorType: doc.authorType,
    authorId: doc.authorId ? { name: doc.authorId.name } : undefined,
    bumdesId: doc.bumdesId ? { name: doc.bumdesId.name, villageName: doc.bumdesId.villageName } : undefined,
    storeId: doc.storeId ? { name: doc.storeId.name, slug: doc.storeId.slug, logoUrl: doc.storeId.logoUrl } : undefined,
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : undefined,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    viewsCount: doc.viewsCount || 0,
  }));

  return <KabarBumdesClient articles={serializedArticles} />;
}
