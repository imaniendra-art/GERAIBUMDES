"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  Link as LinkIcon,
  X,
  FileCheck,
  Star,
  Plus,
} from "lucide-react";
import { compressImage, formatFileSize } from "@/lib/utils/imageCompressor";
import { cn } from "@/components/ui/Button";

export interface ImageUploaderProps {
  // Single mode
  value?: string;
  onChange?: (url: string) => void;

  // Multiple mode
  multiple?: boolean;
  values?: string[];
  onChangeMultiple?: (urls: string[]) => void;
  maxFiles?: number;

  // General settings
  folder?: "products" | "logos" | "banners" | "payments";
  label?: string;
  helperText?: string;
  aspectRatio?: "square" | "video" | "wide";
  maxDimension?: number;
  quality?: number;
  className?: string;
  allowUrlInput?: boolean;
  disabled?: boolean;
}

export function ImageUploader({
  value = "",
  onChange,
  multiple = false,
  values = [],
  onChangeMultiple,
  maxFiles = 5,
  folder = "products",
  label = "Foto",
  helperText,
  aspectRatio = "square",
  maxDimension,
  quality = 0.82,
  className = "",
  allowUrlInput = true,
  disabled = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    savedPercent: number;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tentukan batas dimensi berdasarkan kategori
  const resolvedMaxDimension =
    maxDimension ||
    (folder === "logos" ? 600 : folder === "banners" ? 1920 : 1200);

  const ratioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
  };

  // Helper untuk memproses dan mengunggah satu file
  const processAndUploadSingleFile = async (
    file: File,
    index?: number,
    total?: number
  ): Promise<{ url: string; originalSize: number; compressedSize: number }> => {
    if (!file.type.startsWith("image/")) {
      throw new Error(`File "${file.name}" bukan format gambar.`);
    }

    const stepLabel = total && total > 1 ? ` (${index} dari ${total})` : "";
    setUploadStatus(`Mengompres & merampingkan gambar${stepLabel}...`);

    // Kompresi WebP di browser
    const compressed = await compressImage(file, {
      maxWidth: resolvedMaxDimension,
      maxHeight: resolvedMaxDimension,
      quality: quality,
      format: "image/webp",
    });

    setUploadStatus(`Menyimpan ke server lokal${stepLabel}...`);

    const formData = new FormData();
    formData.append("file", compressed.file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mengunggah gambar ke server.");
    }

    return {
      url: data.url,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
    };
  };

  // Handler utama saat file dipilih (single maupun multiple)
  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    if (rawFiles.length === 0) return;

    setError("");
    setIsUploading(true);

    try {
      if (!multiple) {
        // Mode Single (1 Gambar)
        const singleFile = rawFiles[0];
        const res = await processAndUploadSingleFile(singleFile);

        const savedPercent = Math.round(
          ((res.originalSize - res.compressedSize) / res.originalSize) * 100
        );

        setCompressionStats({
          originalSize: res.originalSize,
          compressedSize: res.compressedSize,
          savedPercent: Math.max(0, savedPercent),
        });

        onChange?.(res.url);
        setUploadStatus("Berhasil disimpan!");
      } else {
        // Mode Multiple (Banyak Gambar)
        const currentUrls = values ? [...values] : [];
        const slotsAvailable = maxFiles - currentUrls.length;

        if (slotsAvailable <= 0) {
          throw new Error(`Batas maksimal ${maxFiles} foto telah tercapai.`);
        }

        const filesToProcess = rawFiles.slice(0, slotsAvailable);
        let totalOriginal = 0;
        let totalCompressed = 0;
        const newUploadedUrls: string[] = [];

        for (let i = 0; i < filesToProcess.length; i++) {
          const res = await processAndUploadSingleFile(
            filesToProcess[i],
            i + 1,
            filesToProcess.length
          );
          newUploadedUrls.push(res.url);
          totalOriginal += res.originalSize;
          totalCompressed += res.compressedSize;
        }

        const updatedList = [...currentUrls, ...newUploadedUrls];
        onChangeMultiple?.(updatedList);

        if (totalOriginal > 0) {
          const savedPercent = Math.round(
            ((totalOriginal - totalCompressed) / totalOriginal) * 100
          );
          setCompressionStats({
            originalSize: totalOriginal,
            compressedSize: totalCompressed,
            savedPercent: Math.max(0, savedPercent),
          });
        }

        setUploadStatus(`${newUploadedUrls.length} foto berhasil diunggah!`);
      }

      setTimeout(() => setUploadStatus(""), 2500);
    } catch (err: any) {
      console.error("[ImageUploader Error]", err);
      setError(err?.message || "Terjadi kesalahan saat memproses gambar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Aksi Single Mode
  const handleRemoveSingleImage = () => {
    onChange?.("");
    setCompressionStats(null);
    setError("");
  };

  // Aksi Multiple Mode
  const handleRemoveMultiImage = (indexToRemove: number) => {
    if (!onChangeMultiple) return;
    const updated = values.filter((_, idx) => idx !== indexToRemove);
    onChangeMultiple(updated);
  };

  const handleSetAsPrimary = (indexToPrimary: number) => {
    if (!onChangeMultiple || indexToPrimary === 0) return;
    const item = values[indexToPrimary];
    const remaining = values.filter((_, idx) => idx !== indexToPrimary);
    const reordered = [item, ...remaining];
    onChangeMultiple(reordered);
  };

  // Input manual URL
  const handleApplyManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;

    if (!multiple) {
      onChange?.(trimmed);
      setManualUrl("");
      setShowUrlInput(false);
    } else {
      if (values.length >= maxFiles) {
        setError(`Maksimal ${maxFiles} foto telah tercapai.`);
        return;
      }
      onChangeMultiple?.([...values, trimmed]);
      setManualUrl("");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header Label & URL Input Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-main">
          {label}
          {multiple && (
            <span className="ml-2 text-xs font-normal text-text-muted">
              ({values.length}/{maxFiles} Foto)
            </span>
          )}
        </label>
        {allowUrlInput && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            <LinkIcon className="h-3 w-3" />
            {showUrlInput ? "Tutup Input URL" : "Input URL Manual"}
          </button>
        )}
      </div>

      {/* Input manual URL toggle */}
      {showUrlInput && (
        <div className="flex gap-2 p-2.5 bg-surface-bg border border-border rounded-xl mb-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/foto.jpg"
            className="flex-1 px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={disabled || isUploading}
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {multiple ? "Tambah URL" : "Terapkan"}
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* ============================================================ */}
      {/* MODE 1: MULTIPLE IMAGES (UNTUK PRODUK)                       */}
      {/* ============================================================ */}
      {multiple ? (
        <div className="space-y-3">
          {/* Grid Preview Foto & Tombol Tambah */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {values.map((imgUrl, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative rounded-xl overflow-hidden border-2 bg-surface-bg shadow-sm group aspect-square",
                  idx === 0
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-text-muted"
                )}
              >
                <img
                  src={imgUrl}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                  }}
                />

                {/* Badge Foto Utama */}
                {idx === 0 ? (
                  <div className="absolute top-1.5 left-1.5 z-10 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                    <Star className="h-2.5 w-2.5 fill-white" />
                    Utama
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetAsPrimary(idx)}
                    disabled={disabled || isUploading}
                    className="absolute top-1.5 left-1.5 z-10 opacity-0 group-hover:opacity-100 bg-black/70 hover:bg-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded transition-all shadow"
                    title="Jadikan Foto Utama / Sampul"
                  >
                    Set Utama
                  </button>
                )}

                {/* Tombol Hapus Foto */}
                <button
                  type="button"
                  onClick={() => handleRemoveMultiImage(idx)}
                  disabled={disabled || isUploading}
                  className="absolute top-1.5 right-1.5 z-10 p-1 bg-black/60 hover:bg-danger text-white rounded-md transition-colors opacity-90 group-hover:opacity-100 shadow"
                  title="Hapus foto ini"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Kotak Tambah Foto Baru (jika belum mencapai maxFiles) */}
            {values.length < maxFiles && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() =>
                  !disabled && !isUploading && fileInputRef.current?.click()
                }
                className={cn(
                  "relative flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 aspect-square text-center",
                  isDragOver
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-border hover:border-primary/60 hover:bg-surface-bg/70 bg-surface",
                  disabled && "opacity-50 cursor-not-allowed",
                  isUploading && "pointer-events-none opacity-80"
                )}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-1.5 p-1">
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-[10px] font-medium text-text-main line-clamp-1">
                      {uploadStatus || "Proses..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-text-main">
                      Tambah Foto
                    </span>
                    <span className="text-[10px] text-text-muted">
                      WebP Auto
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Bar / Compression Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-text-muted text-[11px]">
              Foto pertama adalah foto utama produk. Klik &quot;Set Utama&quot; untuk memindahkan urutan.
            </span>
            {compressionStats && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <FileCheck className="h-3 w-3 text-emerald-600" />
                WebP: {formatFileSize(compressionStats.originalSize)} ➔{" "}
                {formatFileSize(compressionStats.compressedSize)} (Hemat{" "}
                {compressionStats.savedPercent}%)
              </span>
            )}
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* MODE 2: SINGLE IMAGE (UNTUK LOGO & BANNER)                   */
        /* ============================================================ */
        <div>
          {value ? (
            /* Preview State Single */
            <div className="space-y-2">
              <div
                className={cn(
                  "relative rounded-2xl overflow-hidden border-2 border-border bg-surface-bg shadow-sm group",
                  ratioClasses[aspectRatio],
                  aspectRatio === "square" ? "max-w-[260px]" : "w-full"
                )}
              >
                <img
                  src={value}
                  alt={label}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                  }}
                />

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="px-3 py-1.5 bg-white/90 hover:bg-white text-text-main text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSingleImage}
                    disabled={disabled || isUploading}
                    className="px-3 py-1.5 bg-danger/90 hover:bg-danger text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>

              {/* Action row & Compression Stats */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Ganti Gambar
                  </button>
                  <span className="text-text-muted text-xs">•</span>
                  <button
                    type="button"
                    onClick={handleRemoveSingleImage}
                    disabled={disabled || isUploading}
                    className="text-xs text-danger font-semibold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Hapus
                  </button>
                </div>

                {compressionStats && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <FileCheck className="h-3 w-3 text-emerald-600" />
                    WebP: {formatFileSize(compressionStats.originalSize)} ➔{" "}
                    {formatFileSize(compressionStats.compressedSize)} (Hemat{" "}
                    {compressionStats.savedPercent}%)
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Dropzone Empty State Single */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                !disabled && !isUploading && fileInputRef.current?.click()
              }
              className={cn(
                "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 text-center",
                isDragOver
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/60 hover:bg-surface-bg/60 bg-surface",
                disabled && "opacity-50 cursor-not-allowed",
                isUploading && "pointer-events-none opacity-80",
                ratioClasses[aspectRatio],
                aspectRatio === "square" ? "max-w-[260px]" : "w-full"
              )}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-4">
                  <div className="h-9 w-9 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-xs font-semibold text-text-main animate-pulse">
                    {uploadStatus || "Memproses..."}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Otomatis resize & kompresi WebP
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 p-2">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-1">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-main">
                      Klik untuk pilih foto, atau seret ke sini
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Foto otomatis dikompres ke WebP (~100 KB)
                    </p>
                  </div>
                  <span className="inline-flex items-center text-[10px] font-semibold text-primary/80 bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/20">
                    JPG, PNG, WebP • Maks. {resolvedMaxDimension}px
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-xs text-text-muted">{helperText}</p>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-danger bg-danger/10 p-2.5 rounded-xl border border-danger/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
