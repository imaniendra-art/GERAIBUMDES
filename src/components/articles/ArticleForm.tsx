"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Sparkles
} from "lucide-react";

interface ArticleFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    category?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    pdfUrl?: string;
    pdfName?: string;
    status?: "DRAFT" | "PUBLISHED";
  };
  basePath: string; // "/dashboard/kabar-bumdes" or "/admin/kabar-bumdes"
}

const CATEGORIES = [
  "Kabar Desa",
  "Inovasi Produk",
  "Kegiatan BUMDes",
  "Pengumuman Resmi",
  "Tips & Edukasi",
];

export default function ArticleForm({ initialData, basePath }: ArticleFormProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "Kabar Desa");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || "");
  const [pdfName, setPdfName] = useState(initialData?.pdfName || "");

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Insert markdown at cursor in textarea
  const insertFormatting = (prefix: string, suffix: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || placeholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "articles");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto sampul.");
      setCoverImage(data.url);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah foto.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Upload Inline Image and insert markdown
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingInline(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "articles");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar sisipan.");

      const imageMarkdown = `\n\n![Dokumentasi - ${file.name.replace(/\.[^/.]+$/, "")}](${data.url})\n\n`;
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const newContent =
          textarea.value.substring(0, start) + imageMarkdown + textarea.value.substring(start);
        setContent(newContent);
      } else {
        setContent((prev) => prev + imageMarkdown);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyisipkan gambar.");
    } finally {
      setIsUploadingInline(false);
      if (inlineImageInputRef.current) inlineImageInputRef.current.value = "";
    }
  };

  // Upload PDF Document
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "documents");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mengunggah file PDF.");
      setPdfUrl(data.url);
      setPdfName(file.name);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah dokumen PDF.");
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  // Submit Handler: targetStatus can be "DRAFT" or "PUBLISHED", and redirectMode can be "preview" or "list"
  const handleSubmit = async (targetStatus: "DRAFT" | "PUBLISHED", redirectMode: "preview" | "list" = "list") => {
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Judul berita tidak boleh kosong.");
      return;
    }
    if (!excerpt.trim()) {
      setErrorMessage("Ringkasan singkat berita tidak boleh kosong.");
      return;
    }
    if (!coverImage) {
      setErrorMessage("Foto sampul utama wajib diunggah.");
      return;
    }
    if (!content.trim()) {
      setErrorMessage("Isi konten berita tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage,
        pdfUrl: pdfUrl || undefined,
        pdfName: pdfName || undefined,
        status: targetStatus,
      };

      const url = initialData?._id ? `/api/articles/${initialData._id}` : "/api/articles";
      const method = initialData?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan artikel.");

      const savedArticleId = initialData?._id || data.article?._id;

      if (redirectMode === "preview" && savedArticleId) {
        router.push(`${basePath}/preview/${savedArticleId}`);
      } else {
        router.push(basePath);
      }
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses berita.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {errorMessage && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. INFORMASI UTAMA */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Informasi Utama Berita</span>
        </h3>

        {/* Judul Berita */}
        <div>
          <label className="form-label font-bold">Judul Berita / Kabar Desa *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: BUMDes Maju Bersama Panen Raya Kopi Arabika 10 Ton"
            className="form-input text-base sm:text-lg font-semibold"
            required
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="form-label font-bold">Kategori Kabar *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input bg-surface"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Ringkasan Singkat (Excerpt) */}
        <div>
          <label className="form-label font-bold">
            Ringkasan Berita (Lead Paragraph) *
          </label>
          <p className="text-xs text-text-muted mb-2">
            Ringkasan 1-2 kalimat yang menarik untuk pratinjau kartu berita di beranda dan media sosial.
          </p>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Tulis ringkasan singkat isi berita..."
            className="form-input"
            required
          />
        </div>
      </div>

      {/* 2. FOTO SAMPUL UTAMA */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          <span>Foto Sampul Utama (Cover Image) *</span>
        </h3>
        <p className="text-xs text-text-muted">
          Format landscape (16:9 disarankan), maksimal 15MB. Foto ini akan tampil di bagian paling atas artikel dan kartu berita.
        </p>

        {coverImage ? (
          <div className="relative rounded-2xl overflow-hidden border border-border group max-h-[360px] bg-surface-bg flex items-center justify-center">
            <img src={coverImage} alt="Cover preview" className="w-full h-auto object-cover max-h-[360px]" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => coverImageInputRef.current?.click()}
                className="px-4 py-2 bg-white text-text-main font-bold rounded-xl text-sm shadow hover:bg-surface-bg"
              >
                Ganti Foto
              </button>
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="px-4 py-2 bg-danger text-white font-bold rounded-xl text-sm shadow hover:bg-danger/90"
              >
                Hapus
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => coverImageInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-8 text-center cursor-pointer transition-colors bg-surface-bg/50 hover:bg-surface"
          >
            {isUploadingCover ? (
              <div className="flex flex-col items-center justify-center gap-2 text-text-muted">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium">Sedang mengunggah foto...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-text-muted">
                <Upload className="w-8 h-8 text-primary/70" />
                <span className="font-bold text-sm text-text-main">
                  Klik untuk unggah foto sampul utama
                </span>
                <span className="text-xs">Mendukung format JPG, PNG, atau WebP</span>
              </div>
            )}
          </div>
        )}
        <input
          ref={coverImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />
      </div>

      {/* 3. KONTEN & FORMATTING EDITOR */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Isi Berita Lengkap *</span>
          </h3>
          <span className="text-xs text-text-muted">
            Gunakan tombol toolbar di bawah untuk merapikan narasi.
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-surface-bg border border-border rounded-xl">
          <button
            type="button"
            title="Tebal (Bold)"
            onClick={() => insertFormatting("**", "**", "teks tebal")}
            className="p-2 hover:bg-surface rounded-lg text-text-main transition-colors text-sm"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Miring (Italic)"
            onClick={() => insertFormatting("*", "*", "teks miring")}
            className="p-2 hover:bg-surface rounded-lg text-text-main transition-colors text-sm"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-5 bg-border mx-1" />
          <button
            type="button"
            title="Subjudul Utama (H2)"
            onClick={() => insertFormatting("\n\n## ", "\n\n", "Subjudul Utama")}
            className="p-2 hover:bg-surface rounded-lg text-text-main transition-colors text-sm font-bold flex items-center gap-1"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Subjudul Kecil (H3)"
            onClick={() => insertFormatting("\n\n### ", "\n\n", "Subjudul Kecil")}
            className="p-2 hover:bg-surface rounded-lg text-text-main transition-colors text-sm font-bold flex items-center gap-1"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-5 bg-border mx-1" />
          <button
            type="button"
            title="Daftar Poin (List)"
            onClick={() => insertFormatting("\n- Poin pertama\n- Poin kedua\n- Poin ketiga\n")}
            className="p-2 hover:bg-surface rounded-lg text-text-main transition-colors text-sm"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Daftar Nomor"
            onClick={() => insertFormatting("\n1. Langkah pertama\n2. Langkah kedua\n3. Langkah ketiga\n")}
            className="p-2 hover:bg-surface rounded-lg text-text-main transition-colors text-sm"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Kutipan (Quote)"
            onClick={() => insertFormatting("\n> ", "\n", "Kutipan pernyataan narasumber...")}
            className="p-2 hover:bg-surface rounded-lg text-text-main transition-colors text-sm"
          >
            <Quote className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-5 bg-border mx-1" />
          {/* Sisip Foto Dokumentasi */}
          <button
            type="button"
            onClick={() => inlineImageInputRef.current?.click()}
            disabled={isUploadingInline}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors"
          >
            {isUploadingInline ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5" />
            )}
            <span>Sisip Foto di Berita</span>
          </button>
          <input
            ref={inlineImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInlineImageUpload}
          />
        </div>

        {/* Textarea Konten */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          placeholder="Tulis narasi berita lengkap di sini... Anda dapat menyisipkan foto dokumentasi kegiatan atau kutipan narasumber."
          className="form-input font-mono text-sm sm:text-base leading-relaxed"
          required
        />
      </div>

      {/* 4. DOKUMEN PDF LAMPIRAN (OPSIONAL) */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
            <FileText className="w-5 h-5 text-danger" />
            <span>Lampiran Dokumen PDF (Opsional)</span>
          </h3>
          <span className="text-xs text-text-muted">
            Contoh: SK Kades, Brosur Penawaran, Laporan Tahunan
          </span>
        </div>

        {pdfUrl ? (
          <div className="p-4 bg-surface-bg border border-border rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-text-main truncate max-w-sm sm:max-w-md">
                  {pdfName || "Dokumen-Lampiran.pdf"}
                </p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Buka & Cek Dokumen
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPdfUrl("");
                setPdfName("");
              }}
              className="p-2 text-text-muted hover:text-danger hover:bg-surface rounded-lg transition-colors"
              title="Hapus Dokumen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => pdfInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-colors bg-surface-bg/50 hover:bg-surface"
          >
            {isUploadingPdf ? (
              <div className="flex items-center justify-center gap-2 text-text-muted text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Mengunggah dokumen PDF...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 text-text-muted">
                <Upload className="w-6 h-6 text-primary/70" />
                <span className="font-bold text-sm text-text-main">
                  Klik untuk unggah dokumen lampiran (.pdf)
                </span>
                <span className="text-xs">Maksimal ukuran file 20MB</span>
              </div>
            )}
          </div>
        )}
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handlePdfUpload}
        />
      </div>

      {/* 5. TOMBOL AKSI UTAMA (SIMPAN DRAFT, PRATINJAU, PUBLISH) */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
        <button
          type="button"
          onClick={() => router.push(basePath)}
          className="text-sm font-semibold text-text-muted hover:text-text-main order-3 sm:order-1"
        >
          Batal & Kembali
        </button>

        <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto order-1 sm:order-2">
          {/* Tombol Simpan Draft */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("DRAFT", "list")}
            className="px-5 py-2.5 bg-surface-bg hover:bg-surface border border-border text-text-main font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Draft"}
          </button>

          {/* Tombol Simpan & Lihat Pratinjau (Alur Rekomendasi Pengguna) */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("DRAFT", "preview")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Simpan & Lihat Pratinjau</span>
          </button>

          {/* Tombol Terbitkan Langsung */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("PUBLISHED", "list")}
            className="px-6 py-2.5 bg-cta hover:brightness-95 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Memproses..." : "Terbitkan Langsung"}
          </button>
        </div>
      </div>
    </div>
  );
}
