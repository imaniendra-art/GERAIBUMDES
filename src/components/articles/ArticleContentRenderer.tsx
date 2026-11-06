"use client";

import React from "react";
import Image from "next/image";
import { FileText, Download, ExternalLink } from "lucide-react";

interface ArticleContentRendererProps {
  content: string;
  pdfUrl?: string;
  pdfName?: string;
}

export default function ArticleContentRenderer({
  content,
  pdfUrl,
  pdfName,
}: ArticleContentRendererProps) {
  // Parse paragraphs and formatting blocks
  const blocks = content.split("\n\n").map((block) => block.trim()).filter(Boolean);

  const renderFormattedText = (text: string) => {
    // Basic parser for **bold**, *italic*, and [link](url)
    const parts: (string | React.ReactNode)[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith("**") && matchText.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-bold text-text-main">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith("*") && matchText.endsWith("*")) {
        parts.push(
          <em key={match.index} className="italic">
            {matchText.slice(1, -1)}
          </em>
        );
      } else if (matchText.startsWith("[") && matchText.includes("](")) {
        const linkMatch = matchText.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={match.index}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>{linkMatch[1]}</span>
              <ExternalLink className="w-3.5 h-3.5 inline" />
            </a>
          );
        }
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="space-y-6 text-text-main text-base sm:text-lg leading-relaxed article-body">
      {blocks.map((block, idx) => {
        // Heading 2
        if (block.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-xl sm:text-2xl md:text-3xl font-extrabold text-text-main pt-4 pb-1 border-b border-border/60"
            >
              {renderFormattedText(block.replace("## ", ""))}
            </h2>
          );
        }

        // Heading 3
        if (block.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="text-lg sm:text-xl font-bold text-text-main pt-2"
            >
              {renderFormattedText(block.replace("### ", ""))}
            </h3>
          );
        }

        // Blockquote
        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-primary pl-4 sm:pl-6 py-2 my-4 italic text-text-main/90 bg-primary/[0.03] rounded-r-xl"
            >
              {renderFormattedText(block.replace(/^> \s*/, ""))}
            </blockquote>
          );
        }

        // Inline Image: ![alt](url)
        const imageMatch = block.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imageMatch) {
          const alt = imageMatch[1] || "Dokumentasi Berita";
          const src = imageMatch[2];
          return (
            <figure key={idx} className="my-6">
              <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-sm max-h-[500px] bg-surface-bg flex items-center justify-center">
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-auto max-h-[500px] object-cover"
                  loading="lazy"
                />
              </div>
              {alt && (
                <figcaption className="text-center text-xs sm:text-sm text-text-muted mt-2.5 italic">
                  Foto: {alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // Bulleted List (- item or * item)
        if (block.split("\n").every((line) => line.startsWith("- ") || line.startsWith("* "))) {
          const items = block.split("\n").map((line) => line.replace(/^[-*]\s+/, ""));
          return (
            <ul key={idx} className="list-disc pl-6 space-y-2 text-text-main">
              {items.map((item, i) => (
                <li key={i}>{renderFormattedText(item)}</li>
              ))}
            </ul>
          );
        }

        // Numbered List (1. item)
        if (block.split("\n").every((line) => /^\d+\.\s+/.test(line))) {
          const items = block.split("\n").map((line) => line.replace(/^\d+\.\s+/, ""));
          return (
            <ol key={idx} className="list-decimal pl-6 space-y-2 text-text-main">
              {items.map((item, i) => (
                <li key={i}>{renderFormattedText(item)}</li>
              ))}
            </ol>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {renderFormattedText(block)}
          </p>
        );
      })}

      {/* PDF Attachment Card Widget (if available) */}
      {pdfUrl && (
        <div className="mt-10 p-5 sm:p-6 bg-surface border border-primary/20 rounded-2xl shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Dokumen Resmi Lampiran
                </span>
                <h4 className="font-bold text-base sm:text-lg text-text-main mt-1">
                  {pdfName || "Dokumen-Lampiran-KabarBUMDes.pdf"}
                </h4>
                <p className="text-xs text-text-muted">Format: Dokumen Digital PDF</p>
              </div>
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm shadow-sm transition-all whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Dokumen</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
