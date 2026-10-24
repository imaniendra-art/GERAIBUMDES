import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Store from "@/models/Store";
import Category from "@/models/Category";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils/formatters";
import { getProductBadgeVariant, getProductStatusLabel } from "@/lib/utils/status";
import { ProductActionButtons } from "@/components/products/ProductActionButtons";
import { 
  Search, 
  Filter, 
  Package, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Store as StoreIcon, 
  Tag, 
  ArrowUpDown, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    storeId?: string;
    categoryId?: string;
    sortBy?: string;
    page?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  await dbConnect();
  
  const q = resolvedSearchParams.q?.trim() || "";
  const statusFilter = resolvedSearchParams.status || "ALL";
  const storeId = resolvedSearchParams.storeId || "ALL";
  const categoryId = resolvedSearchParams.categoryId || "ALL";
  const sortBy = resolvedSearchParams.sortBy || "newest";
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const limit = 10;
  const skip = (page - 1) * limit;

  // 1. Build Query
  const query: Record<string, any> = {};
  if (q) {
    query.name = { $regex: q, $options: "i" };
  }
  if (statusFilter !== "ALL") {
    query.status = statusFilter;
  }
  if (storeId !== "ALL") {
    query.storeId = storeId;
  }
  if (categoryId !== "ALL") {
    query.categoryId = categoryId;
  }

  // 2. Sort Options
  let sortOption: Record<string, any> = { createdAt: -1 };
  if (sortBy === "oldest") sortOption = { createdAt: 1 };
  else if (sortBy === "name_asc") sortOption = { name: 1 };
  else if (sortBy === "name_desc") sortOption = { name: -1 };
  else if (sortBy === "price_asc") sortOption = { retailPrice: 1 };
  else if (sortBy === "price_desc") sortOption = { retailPrice: -1 };
  else if (sortBy === "stock_asc") sortOption = { stock: 1 };
  else if (sortBy === "stock_desc") sortOption = { stock: -1 };

  // 3. Calculate statistics across all products
  const allProducts = await Product.find({}, "status").lean();
  const totalCount = allProducts.length;
  const waitingCount = allProducts.filter(p => p.status === "WAITING_APPROVAL").length;
  const activeCount = allProducts.filter(p => p.status === "ACTIVE").length;
  const inactiveCount = allProducts.filter(p => p.status === "INACTIVE").length;
  const rejectedCount = allProducts.filter(p => p.status === "REJECTED").length;

  // 4. Fetch filter options
  const stores = await Store.find({}, "name slug").sort({ name: 1 }).lean();
  const categories = await Category.find({ isActive: true }, "name slug").sort({ name: 1 }).lean();

  // 5. Total count after filter & fetch paginated products
  const totalFiltered = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalFiltered / limit);

  const products = await Product.find(query)
    .populate({ path: "storeId", model: Store, select: "name slug village district regency province" })
    .populate({ path: "categoryId", model: Category, select: "name" })
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();

  // Helper URL builder
  const createFilterUrl = (overrides: Record<string, string | number>) => {
    const params = new URLSearchParams();
    const current: Record<string, any> = {
      q,
      status: statusFilter,
      storeId,
      categoryId,
      sortBy,
      page: "1",
      ...overrides,
    };

    if (current.q) params.set("q", current.q.toString());
    if (current.status && current.status !== "ALL") params.set("status", current.status.toString());
    if (current.storeId && current.storeId !== "ALL") params.set("storeId", current.storeId.toString());
    if (current.categoryId && current.categoryId !== "ALL") params.set("categoryId", current.categoryId.toString());
    if (current.sortBy && current.sortBy !== "newest") params.set("sortBy", current.sortBy.toString());
    if (current.page && current.page !== "1") params.set("page", current.page.toString());

    const qs = params.toString();
    return `/admin/produk${qs ? `?${qs}` : ""}`;
  };

  const isFiltered = q || statusFilter !== "ALL" || storeId !== "ALL" || categoryId !== "ALL" || sortBy !== "newest";

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Kelola Produk</h1>
          <p className="text-text-muted text-sm mt-1">
            Katalog seluruh produk BUMDes se-Indonesia, status tayang, dan verifikasi produk baru.
          </p>
        </div>
      </div>

      {/* STATS CARDS (Responsif tanpa terpotong di resolusi laptop apa pun) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <Link href={createFilterUrl({ status: "ALL", page: 1 })}>
          <Card className={`border-border hover:border-primary/50 transition-all rounded-2xl ${statusFilter === "ALL" ? "ring-2 ring-primary/40 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Produk</p>
                  <h3 className="text-xl sm:text-2xl font-black text-text-main mt-1">{totalCount}</h3>
                </div>
                <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href={createFilterUrl({ status: "WAITING_APPROVAL", page: 1 })}>
          <Card className={`border-warning/40 bg-warning/5 hover:border-warning transition-all rounded-2xl ${statusFilter === "WAITING_APPROVAL" ? "ring-2 ring-warning/60 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-warning-dark uppercase tracking-wider">Perlu Verifikasi</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-warning-dark">{waitingCount}</h3>
                </div>
                <div className="h-9 w-9 bg-warning/20 rounded-xl flex items-center justify-center text-warning-dark shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={createFilterUrl({ status: "ACTIVE", page: 1 })}>
          <Card className={`border-success/40 bg-success/5 hover:border-success transition-all rounded-2xl ${statusFilter === "ACTIVE" ? "ring-2 ring-success/60 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-success-dark uppercase tracking-wider">Produk Aktif</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-success-dark">{activeCount}</h3>
                </div>
                <div className="h-9 w-9 bg-success/20 rounded-xl flex items-center justify-center text-success-dark shrink-0">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={createFilterUrl({ status: "INACTIVE", page: 1 })}>
          <Card className={`border-slate-300 bg-slate-50 hover:border-slate-400 transition-all rounded-2xl ${statusFilter === "INACTIVE" ? "ring-2 ring-slate-400 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Nonaktif</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-slate-700">{inactiveCount}</h3>
                </div>
                <div className="h-9 w-9 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={createFilterUrl({ status: "REJECTED", page: 1 })} className="col-span-2 sm:col-span-1 xl:col-span-1">
          <Card className={`border-danger/40 bg-danger/5 hover:border-danger transition-all rounded-2xl ${statusFilter === "REJECTED" ? "ring-2 ring-danger/60 shadow-sm" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-danger uppercase tracking-wider">Ditolak</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-danger">{rejectedCount}</h3>
                </div>
                <div className="h-9 w-9 bg-danger/20 rounded-xl flex items-center justify-center text-danger shrink-0">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ENTERPRISE TOOLBAR: FILTER & SEARCH */}
      <Card className="rounded-2xl border-border shadow-sm bg-surface">
        <form method="GET" action="/admin/produk" className="p-4 sm:p-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Cari nama produk..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-muted"
              />
            </div>

            {/* 2. Filter BUMDes / Toko */}
            <div className="relative">
              <StoreIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <AutoSubmitSelect
                name="storeId"
                defaultValue={storeId}
                className="w-full pl-10 pr-8 py-2.5 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-text-main font-medium"
              >
                <option value="ALL">Semua BUMDes ({stores.length})</option>
                {stores.map((s: any) => (
                  <option key={s._id.toString()} value={s._id.toString()}>
                    {s.name}
                  </option>
                ))}
              </AutoSubmitSelect>
            </div>

            {/* 3. Filter Kategori */}
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <AutoSubmitSelect
                name="categoryId"
                defaultValue={categoryId}
                className="w-full pl-10 pr-8 py-2.5 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-text-main font-medium"
              >
                <option value="ALL">Semua Kategori ({categories.length})</option>
                {categories.map((c: any) => (
                  <option key={c._id.toString()} value={c._id.toString()}>
                    {c.name}
                  </option>
                ))}
              </AutoSubmitSelect>
            </div>

            {/* 4. Filter Status */}
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <AutoSubmitSelect
                name="status"
                defaultValue={statusFilter}
                className="w-full pl-10 pr-8 py-2.5 bg-surface-bg border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-text-main font-medium"
              >
                <option value="ALL">Semua Status</option>
                <option value="WAITING_APPROVAL">Perlu Verifikasi ({waitingCount})</option>
                <option value="ACTIVE">Aktif ({activeCount})</option>
                <option value="INACTIVE">Nonaktif ({inactiveCount})</option>
                <option value="REJECTED">Ditolak ({rejectedCount})</option>
              </AutoSubmitSelect>
            </div>
          </div>

          {/* Baris Kedua: Pengurutan & Reset Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-text-muted whitespace-nowrap flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" /> Urutkan:
              </span>
              <AutoSubmitSelect
                name="sortBy"
                defaultValue={sortBy}
                className="px-3 py-1.5 bg-surface-bg border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer text-text-main"
              >
                <option value="newest">Terbaru Ditambahkan</option>
                <option value="oldest">Terlama</option>
                <option value="name_asc">Nama Produk (A - Z)</option>
                <option value="name_desc">Nama Produk (Z - A)</option>
                <option value="stock_asc">Stok Paling Sedikit (Menipis)</option>
                <option value="stock_desc">Stok Terbanyak</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="price_asc">Harga Terendah</option>
              </AutoSubmitSelect>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-text-muted">
                Ditemukan: <strong className="text-text-main font-bold">{totalFiltered}</strong> produk
              </span>
              {isFiltered && (
                <Link href="/admin/produk">
                  <Button variant="ghost" size="sm" type="button" className="text-xs h-8 px-2.5 text-danger hover:bg-danger/10 rounded-lg">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Filter
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </form>
      </Card>

      {/* PRODUCTS TABLE (DESKTOP) */}
      <div className="hidden md:block bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-text-main">
            <thead className="text-[11px] text-text-muted uppercase font-bold tracking-wider bg-surface-bg border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Produk</th>
                <th className="px-5 py-3.5">BUMDes / Toko</th>
                <th className="px-5 py-3.5">Harga & Satuan</th>
                <th className="px-5 py-3.5">Stok</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product: any) => (
                <tr key={product._id.toString()} className="hover:bg-surface-bg/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-surface-bg rounded-xl border border-border overflow-hidden flex items-center justify-center shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-text-muted" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-text-main line-clamp-1">{product.name}</p>
                        <span className="inline-block px-2 py-0.5 mt-0.5 bg-surface-bg text-text-muted rounded text-[10px] font-medium border border-border/60">
                          {product.categoryId?.name || "Umum"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-primary">
                      {product.storeId?.name || "BUMDes Tidak Diketahui"}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {[product.storeId?.village, product.storeId?.district, product.storeId?.regency].filter(Boolean).join(", ") || product.locationText || "-"}
                    </p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="font-bold text-text-main">{formatCurrency(product.retailPrice)}</p>
                    <p className="text-xs text-text-muted">per {product.unit}</p>
                    {product.isWholesaleAvailable && (
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Grosir
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`font-semibold ${product.stock <= 5 ? "text-danger" : "text-text-main"}`}>
                      {product.stock} {product.unit}
                    </span>
                    {product.stock <= 5 && (
                      <span className="block text-[10px] font-bold text-danger mt-0.5">
                        {product.stock === 0 ? "Habis" : "Stok Menipis"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Badge variant={getProductBadgeVariant(product.status)}>
                      {getProductStatusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <ProductActionButtons 
                      productId={product._id.toString()} 
                      productName={product.name} 
                      editUrl={`/admin/produk/edit/${product._id}`} 
                      viewUrl={`/admin/produk/${product._id}`}
                      status={product.status}
                    />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState 
                      title="Tidak Ada Produk" 
                      description={
                        isFiltered
                          ? "Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih."
                          : "Belum ada produk yang didaftarkan oleh BUMDes."
                      }
                      icon="package" 
                      className="border-0 rounded-none bg-transparent py-14"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCTS CARDS (MOBILE) */}
      <div className="block md:hidden space-y-3">
        {products.map((product: any) => (
          <div key={product._id.toString()} className="bg-surface rounded-2xl p-4 border border-border shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-16 w-16 bg-surface-bg rounded-xl border border-border overflow-hidden flex items-center justify-center shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-bold text-sm text-text-main line-clamp-1">{product.name}</h3>
                  <Badge variant={getProductBadgeVariant(product.status)} className="rounded-lg px-2 py-0.5 text-[9px] shrink-0">
                    {getProductStatusLabel(product.status)}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-primary mt-0.5 line-clamp-1">
                  {product.storeId?.name || "BUMDes"}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-bold text-sm text-text-main">
                    {formatCurrency(product.retailPrice)}
                    <span className="text-[10px] text-text-muted font-normal"> /{product.unit}</span>
                  </span>
                  <span className={`text-xs font-semibold ${product.stock <= 5 ? "text-danger" : "text-text-muted"}`}>
                    Stok: {product.stock}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="text-[10px] text-text-muted bg-surface-bg px-2 py-0.5 rounded border border-border/60">
                {product.categoryId?.name || "Umum"}
              </span>
              <ProductActionButtons 
                productId={product._id.toString()} 
                productName={product.name} 
                editUrl={`/admin/produk/edit/${product._id}`} 
                viewUrl={`/admin/produk/${product._id}`}
                status={product.status}
              />
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <EmptyState 
            title="Tidak Ada Produk" 
            description="Tidak ada produk yang cocok dengan filter yang dipilih."
            icon="package" 
            className="py-12 bg-surface rounded-2xl border border-border"
          />
        )}
      </div>

      {/* PAGINATION BAR */}
      {totalPages > 1 && (
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-text-muted">
            Menampilkan <strong className="text-text-main">{skip + 1}</strong> – <strong className="text-text-main">{Math.min(skip + limit, totalFiltered)}</strong> dari <strong className="text-text-main">{totalFiltered}</strong> produk
          </p>

          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link href={createFilterUrl({ page: page - 1 })}>
                <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl text-xs font-semibold">
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Sebelumnya
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="h-8 px-3 rounded-xl text-xs opacity-50 cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Sebelumnya
              </Button>
            )}

            <div className="flex items-center px-2 text-xs font-bold text-text-main">
              Halaman {page} dari {totalPages}
            </div>

            {page < totalPages ? (
              <Link href={createFilterUrl({ page: page + 1 })}>
                <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl text-xs font-semibold">
                  Selanjutnya <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="h-8 px-3 rounded-xl text-xs opacity-50 cursor-not-allowed">
                Selanjutnya <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
