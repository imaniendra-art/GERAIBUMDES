import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

const ALLOWED_FOLDERS = ["products", "logos", "banners", "payments", "qris", "articles", "documents"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const MIME_EXTENSIONS: Record<string, string> = {
  "image/webp": ".webp",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file yang diunggah." },
        { status: 400 }
      );
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/");

    // Validasi tipe file
    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: "File yang diunggah harus berupa gambar (JPG, PNG, WebP) atau dokumen PDF." },
        { status: 400 }
      );
    }

    // Validasi batas ukuran maksimum (20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 20MB." },
        { status: 400 }
      );
    }

    // Tentukan folder tujuan yang diizinkan
    let defaultFolder: AllowedFolder = "products";
    if (isPdf) {
      defaultFolder = "documents";
    } else if (requestedFolder === "articles") {
      defaultFolder = "articles";
    }

    const folder: AllowedFolder = (
      requestedFolder && ALLOWED_FOLDERS.includes(requestedFolder as AllowedFolder)
        ? requestedFolder
        : defaultFolder
    ) as AllowedFolder;

    // Tentukan ekstensi file
    let ext = MIME_EXTENSIONS[file.type.toLowerCase()];
    if (!ext) {
      const match = file.name.match(/\.[^.]+$/);
      ext = match ? match[0].toLowerCase() : (isPdf ? ".pdf" : ".webp");
    }

    // Sanitasi dan generate nama file unik
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const safeFilename = `${folder}_${timestamp}_${randomSuffix}${ext}`;

    // Path penyimpanan di direktori public/uploads/[folder]
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, safeFilename);

    // Konversi arrayBuffer ke Buffer dan simpan
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);

    // URL publik yang dapat diakses oleh browser
    const publicUrl = `/uploads/${folder}/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      originalName: file.name,
      size: buffer.length,
      folder,
      isPdf,
    });
  } catch (error: any) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat menyimpan file di server." },
      { status: 500 }
    );
  }
}
