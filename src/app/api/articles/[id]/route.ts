import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// GET: Get article by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const article = await Article.findById(id)
      .populate("authorId", "name email role")
      .populate("bumdesId", "name villageName")
      .populate("storeId", "name slug logoUrl")
      .lean();

    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error("[GET_ARTICLE_ID_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Gagal mengambil data artikel" }, { status: 500 });
  }
}

// PUT: Update article
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
    }

    // Permission check
    const isSuperAdmin = session.role === "SUPER_ADMIN" || session.role === "PLATFORM_ADMIN";
    const isOwner = article.authorId.toString() === session.userId;

    if (!isSuperAdmin && !isOwner) {
      return NextResponse.json({ error: "Anda tidak memiliki hak untuk mengubah artikel ini." }, { status: 403 });
    }

    const body = await req.json();
    const { title, excerpt, content, coverImage, pdfUrl, pdfName, category, status } = body;

    if (title && title.trim() !== article.title) {
      article.title = title.trim();
      let baseSlug = slugify(title);
      let uniqueSlug = baseSlug;
      let count = 1;
      while (await Article.exists({ slug: uniqueSlug, _id: { $ne: article._id } })) {
        uniqueSlug = `${baseSlug}-${count}`;
        count++;
      }
      article.slug = uniqueSlug;
    }

    if (excerpt !== undefined) article.excerpt = excerpt.trim();
    if (content !== undefined) article.content = content;
    if (coverImage !== undefined) article.coverImage = coverImage;
    if (pdfUrl !== undefined) article.pdfUrl = pdfUrl ? pdfUrl.trim() : undefined;
    if (pdfName !== undefined) article.pdfName = pdfName ? pdfName.trim() : undefined;
    if (category !== undefined) article.category = category;

    if (status !== undefined) {
      if (status === "PUBLISHED" && article.status !== "PUBLISHED") {
        article.publishedAt = new Date();
      }
      article.status = status;
    }

    await article.save();

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil diperbarui!",
      article,
    });
  } catch (error: any) {
    console.error("[UPDATE_ARTICLE_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Gagal memperbarui artikel" }, { status: 500 });
  }
}

// DELETE: Delete article
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
    }

    const isSuperAdmin = session.role === "SUPER_ADMIN" || session.role === "PLATFORM_ADMIN";
    const isOwner = article.authorId.toString() === session.userId;

    if (!isSuperAdmin && !isOwner) {
      return NextResponse.json({ error: "Anda tidak memiliki hak untuk menghapus artikel ini." }, { status: 403 });
    }

    await Article.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Artikel berhasil dihapus." });
  } catch (error: any) {
    console.error("[DELETE_ARTICLE_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Gagal menghapus artikel" }, { status: 500 });
  }
}
