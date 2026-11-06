import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";

export async function PATCH(
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
      return NextResponse.json({ error: "Anda tidak memiliki hak untuk mengubah status artikel ini." }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (status !== "DRAFT" && status !== "PUBLISHED") {
      return NextResponse.json({ error: "Status tidak valid. Harus DRAFT atau PUBLISHED." }, { status: 400 });
    }

    article.status = status;
    if (status === "PUBLISHED" && !article.publishedAt) {
      article.publishedAt = new Date();
    }

    await article.save();

    return NextResponse.json({
      success: true,
      message: status === "PUBLISHED" ? "Berita berhasil diterbitkan ke publik!" : "Berita berhasil ditarik ke draft.",
      article,
    });
  } catch (error: any) {
    console.error("[TOGGLE_STATUS_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Gagal mengubah status artikel" }, { status: 500 });
  }
}
