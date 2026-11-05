import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadToMinio, deleteFromMinio } from "@/lib/minio";

const ALLOWED_FOLDERS = [
  "products",
  "logos",
  "banners",
  "payments",
  "qris",
  "shipments",
  "receipts",
  "documents",
] as const;
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

    // Validasi tipe file (mendukung gambar & dokumen PDF)
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: "File yang diunggah harus berupa gambar (JPG, PNG, WebP, dll) atau PDF." },
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
    const objectKey = `${folder}/${safeFilename}`;

    // Konversi arrayBuffer ke Buffer dan unggah ke MinIO
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || "image/webp";

    const uploaded = await uploadToMinio(buffer, objectKey, contentType);

    return NextResponse.json({
      success: true,
      url: uploaded.url,
      filename: safeFilename,
      objectName: uploaded.objectName,
      bucket: uploaded.bucket,
      size: buffer.length,
      folder,
    });
  } catch (error: any) {
    console.error("[MINIO_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat mengunggah file ke MinIO." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL file diperlukan." }, { status: 400 });
    }

    await deleteFromMinio(url);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[MINIO_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus file dari MinIO." },
      { status: 500 }
    );
  }
}
