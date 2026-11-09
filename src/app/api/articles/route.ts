import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";

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

// GET: List articles (Public or Admin filtered)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const authorType = searchParams.get("authorType");
    const bumdesId = searchParams.get("bumdesId");
    const scope = searchParams.get("scope"); // "my" for current logged in user
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const filter: any = {};

    // If scope="my", require authentication and filter by author
    if (scope === "my") {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      filter.authorId = session.userId;
    } else if (status) {
      filter.status = status;
    } else {
      // Default for public: only published
      filter.status = "PUBLISHED";
    }

    if (category && category !== "Semua") {
      filter.category = category;
    }

    if (authorType) {
      filter.authorType = authorType;
    }

    if (bumdesId) {
      filter.bumdesId = bumdesId;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
      ];
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate("authorId", "name email role")
        .populate("bumdesId", "name villageName")
        .populate("storeId", "name slug logoUrl")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[GET_ARTICLES_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Gagal mengambil data artikel" }, { status: 500 });
  }
}

// POST: Create a new article
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid. Silakan login kembali." }, { status: 401 });
    }

    if (
      session.role !== "SUPER_ADMIN" &&
      session.role !== "PLATFORM_ADMIN" &&
      session.role !== "BUMDES_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin untuk mempublikasikan artikel." },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const { title, excerpt, content, coverImage, pdfUrl, pdfName, category, status } = body;

    if (!title || !excerpt || !content || !coverImage) {
      return NextResponse.json(
        { error: "Judul, ringkasan, isi konten, dan foto utama wajib diisi." },
        { status: 400 }
      );
    }

    // Determine author information
    const isSuperAdmin = session.role === "SUPER_ADMIN" || session.role === "PLATFORM_ADMIN";
    const authorType = isSuperAdmin ? "SUPER_ADMIN" : "BUMDES_ADMIN";

    let bumdesId = undefined;
    let storeId = undefined;

    if (authorType === "BUMDES_ADMIN") {
      const profile = await BumdesProfile.findOne({ userId: session.userId });
      if (profile) {
        bumdesId = profile._id;
        const store = await Store.findOne({ bumdesId: profile._id });
        if (store) {
          storeId = store._id;
        }
      }
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = `kabar-${Date.now()}`;
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await Article.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }

    const articleStatus = status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

    const newArticle = await Article.create({
      title: title.trim(),
      slug: uniqueSlug,
      excerpt: excerpt.trim(),
      content,
      coverImage,
      pdfUrl: pdfUrl ? pdfUrl.trim() : undefined,
      pdfName: pdfName ? pdfName.trim() : undefined,
      category: category || "Kabar Desa",
      authorType,
      authorId: session.userId,
      bumdesId,
      storeId,
      status: articleStatus,
      publishedAt: articleStatus === "PUBLISHED" ? new Date() : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: articleStatus === "PUBLISHED" ? "Berita berhasil diterbitkan!" : "Draft berita berhasil disimpan!",
        article: newArticle,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[CREATE_ARTICLE_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Gagal membuat artikel baru" }, { status: 500 });
  }
}
