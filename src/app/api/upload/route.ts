import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

const ALLOWED_FOLDERS = ["products", "logos", "banners", "payments"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const MIME_EXTENSIONS: Record<string, string> = {
  "image/webp": ".webp",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
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
        { error: "Tidak ada file gambar yang diunggah." },
        { status: 400 }
      );
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File yang diunggah harus berupa gambar (JPG, PNG, WebP, dll)." },
        { status: 400 }
      );
    }

    // Validasi batas ukuran maksimum (15MB untuk toleransi sebelum kompresi)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 15MB." },
        { status: 400 }
      );
    }

    // Tentukan folder tujuan yang diizinkan
    const folder: AllowedFolder = (
      requestedFolder && ALLOWED_FOLDERS.includes(requestedFolder as AllowedFolder)
        ? requestedFolder
        : "products"
    ) as AllowedFolder;

    // Tentukan ekstensi file
    let ext = MIME_EXTENSIONS[file.type.toLowerCase()];
    if (!ext) {
      const match = file.name.match(/\.[^.]+$/);
      ext = match ? match[0].toLowerCase() : ".webp";
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
      size: buffer.length,
      folder,
    });
  } catch (error: any) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat menyimpan gambar di server." },
      { status: 500 }
    );
  }
}
