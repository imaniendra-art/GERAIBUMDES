import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArticleForm from "@/components/articles/ArticleForm";

export const metadata = {
  title: "Tulis Kabar BUMDes Baru - Dashboard BUMDes",
};

export default async function TambahKabarBumdesPage() {
  const session = await getSession();
  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/kabar-bumdes"
          className="p-2 text-text-muted hover:text-text-main hover:bg-surface rounded-xl transition-colors"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Tulis Kabar BUMDes Baru
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Susun cerita kegiatan, panen raya, inovasi produk, atau pengumuman desa Anda.
          </p>
        </div>
      </div>

      <ArticleForm basePath="/dashboard/kabar-bumdes" />
    </div>
  );
}
