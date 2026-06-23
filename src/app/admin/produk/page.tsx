import { Card } from "@/components/ui/Card";
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

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  await dbConnect();
  
  const statusFilter = resolvedSearchParams.status || "ALL";
  const query = statusFilter !== "ALL" ? { status: statusFilter } : {};

  // Fetch products and populate store details
  const products = await Product.find(query)
    .populate({ path: "storeId", model: Store, select: "name" })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Verifikasi Produk BUMDes</h1>
        
        <div className="flex bg-surface rounded-md border border-border p-1">
          <Link href="/admin/produk" className={`px-3 py-1.5 text-sm font-medium rounded-sm ${statusFilter === "ALL" ? "bg-primary/10 text-primary-dark" : "text-text-muted hover:text-text-main"}`}>
            Semua
          </Link>
          <Link href="/admin/produk?status=WAITING_APPROVAL" className={`px-3 py-1.5 text-sm font-medium rounded-sm ${statusFilter === "WAITING_APPROVAL" ? "bg-warning/20 text-warning-dark" : "text-text-muted hover:text-text-main"}`}>
            Menunggu Verifikasi
          </Link>
          <Link href="/admin/produk?status=ACTIVE" className={`px-3 py-1.5 text-sm font-medium rounded-sm ${statusFilter === "ACTIVE" ? "bg-success/20 text-success-dark" : "text-text-muted hover:text-text-main"}`}>
            Aktif
          </Link>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm text-left text-text-main">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg">
              <tr>
                <th className="px-6 py-3">Produk</th>
                <th className="px-6 py-3">Toko / BUMDes</th>
                <th className="px-6 py-3">Harga & Stok</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id.toString()} className="border-b border-border hover:bg-surface-bg/50">
                  <td className="px-6 py-4">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-text-muted">{product.category}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-primary">
                    {product.storeId?.name || "Toko Tidak Diketahui"}
                  </td>
                  <td className="px-6 py-4">
                    <p>{formatCurrency(product.retailPrice)} / {product.unit}</p>
                    <p className="text-xs text-text-muted">Stok: {product.stock}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getProductBadgeVariant(product.status)}>
                      {getProductStatusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
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
                  <td colSpan={5} className="p-0">
                    <EmptyState 
                      title="Tidak Ada Produk" 
                      description={`Tidak ada produk yang ditemukan untuk status "${statusFilter}".`}
                      icon="package" 
                      className="border-0 rounded-none bg-transparent py-12"
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
