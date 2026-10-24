import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Store from "@/models/Store";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils/formatters";
import { getProductBadgeVariant, getProductStatusLabel } from "@/lib/utils/status";
import { ProductActionButtons } from "@/components/products/ProductActionButtons";
import { Search, Filter, Package, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  await dbConnect();
  
  const q = resolvedSearchParams.q?.trim() || "";
  const statusFilter = resolvedSearchParams.status || "ALL";

  // Build Query
  const query: Record<string, any> = {};
  if (q) {
    query.name = { $regex: q, $options: "i" };
  }
  if (statusFilter !== "ALL") {
    query.status = statusFilter;
  }

  // Calculate statistics across all products
  const allProducts = await Product.find({}, "status").lean();
  const totalCount = allProducts.length;
  const waitingCount = allProducts.filter(p => p.status === "WAITING_APPROVAL").length;
  const activeCount = allProducts.filter(p => p.status === "ACTIVE").length;
  const inactiveCount = allProducts.filter(p => p.status === "INACTIVE").length;
  const rejectedCount = allProducts.filter(p => p.status === "REJECTED").length;

  // Fetch products and populate store details
  const products = await Product.find(query)
    .populate({ path: "storeId", model: Store, select: "name" })
    .sort({ createdAt: -1 })
    .lean();

  const createFilterUrl = (status: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "ALL") params.set("status", status);
    const qs = params.toString();
    return `/admin/produk${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Produk</h1>
          <p className="text-text-muted text-sm mt-1">
            Katalog seluruh produk BUMDes, status tayang, dan verifikasi produk baru
          </p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Link href={createFilterUrl("ALL")}>
          <Card className={`border-border hover:border-primary/50 transition-colors ${statusFilter === "ALL" ? "ring-2 ring-primary/30" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-text-muted">Total Produk</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1">{totalCount}</h3>
                </div>
                <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href={createFilterUrl("WAITING_APPROVAL")}>
          <Card className={`border-warning/50 bg-warning/5 hover:border-warning transition-colors ${statusFilter === "WAITING_APPROVAL" ? "ring-2 ring-warning/50" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-warning-dark">Perlu Verifikasi</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-warning-dark">{waitingCount}</h3>
                </div>
                <div className="h-9 w-9 bg-warning/20 rounded-full flex items-center justify-center text-warning-dark">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={createFilterUrl("ACTIVE")}>
          <Card className={`border-success/50 bg-success/5 hover:border-success transition-colors ${statusFilter === "ACTIVE" ? "ring-2 ring-success/50" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-success-dark">Produk Aktif</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-success-dark">{activeCount}</h3>
                </div>
                <div className="h-9 w-9 bg-success/20 rounded-full flex items-center justify-center text-success-dark">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={createFilterUrl("INACTIVE")}>
          <Card className={`border-slate-300 bg-slate-50 hover:border-slate-400 transition-colors ${statusFilter === "INACTIVE" ? "ring-2 ring-slate-400" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Nonaktif</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-slate-700">{inactiveCount}</h3>
                </div>
                <div className="h-9 w-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={createFilterUrl("REJECTED")} className="col-span-2 sm:col-span-1">
          <Card className={`border-danger/50 bg-danger/5 hover:border-danger transition-colors ${statusFilter === "REJECTED" ? "ring-2 ring-danger/50" : ""}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-danger">Ditolak</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-danger">{rejectedCount}</h3>
                </div>
                <div className="h-9 w-9 bg-danger/20 rounded-full flex items-center justify-center text-danger">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <Card>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-surface-bg">
          <div className="flex items-center gap-3">
            <form className="relative" method="GET" action="/admin/produk">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Cari nama produk..."
                className="pl-9 pr-4 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-[250px]"
              />
              {statusFilter !== "ALL" && <input type="hidden" name="status" value={statusFilter} />}
            </form>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <form method="GET" action="/admin/produk">
                {q && <input type="hidden" name="q" value={q} />}
                <AutoSubmitSelect 
                  name="status"
                  defaultValue={statusFilter || "ALL"}
                  className="pl-9 pr-8 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="WAITING_APPROVAL">Perlu Verifikasi</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Nonaktif</option>
                  <option value="REJECTED">Ditolak</option>
                </AutoSubmitSelect>
              </form>
            </div>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm text-left text-text-main">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg border-b border-border">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Produk</th>
                <th className="px-6 py-3.5 font-semibold">BUMDes / Toko</th>
                <th className="px-6 py-3.5 font-semibold">Harga & Satuan</th>
                <th className="px-6 py-3.5 font-semibold">Stok</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product._id.toString()} className="hover:bg-surface-bg/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-text-main">{product.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{product.category}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-primary">
                      {product.storeId?.name || "Toko Tidak Diketahui"}
                    </p>
                    {product.locationText && (
                      <p className="text-xs text-text-muted truncate max-w-[200px] mt-0.5">
                        {product.locationText}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium">{formatCurrency(product.retailPrice)}</p>
                    <p className="text-xs text-text-muted">per {product.unit}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${product.stock <= 5 ? "text-danger font-bold" : ""}`}>
                      {product.stock} {product.unit}
                    </span>
                    {product.stock <= 5 && (
                      <span className="block text-[10px] text-danger">Stok Menipis</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getProductBadgeVariant(product.status)}>
                      {getProductStatusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <ProductActionButtons 
                      productId={product._id.toString()} 
                      productName={product.name} 
                      editUrl={`/admin/produk/edit/${product._id}`} 
                      viewUrl={`/admin/produk/${product._id}`}
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
                        q || statusFilter !== "ALL"
                          ? `Tidak ada produk yang cocok dengan pencarian atau filter status "${getProductStatusLabel(statusFilter)}".`
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
      </Card>
    </div>
  );
}
