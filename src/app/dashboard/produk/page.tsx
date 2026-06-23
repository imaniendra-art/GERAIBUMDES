import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import Product from "@/models/Product";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Package, Plus, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils/formatters";
import { getProductStatusLabel, getProductBadgeVariant } from "@/lib/utils/status";
import { ProductActionButtons } from "@/components/products/ProductActionButtons";

export default async function BUMDesProductsPage() {
  const session = await getSession();
  if (!session || session.role !== "BUMDES_ADMIN") {
    redirect("/login");
  }

  await dbConnect();
  
  const profile = await BumdesProfile.findOne({ userId: session.userId });
  if (!profile || profile.verificationStatus !== "VERIFIED") {
    redirect("/dashboard");
  }

  const store = await Store.findOne({ bumdesId: profile._id });
  if (!store || store.status !== "ACTIVE") {
    redirect("/dashboard");
  }

  const products = await Product.find({ storeId: store._id }).sort({ createdAt: -1 });

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Dashboard
          </span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Kelola Produk</h1>
          <p className="text-text-muted text-sm mt-1">Daftar produk yang Anda tawarkan ke BUMDes lain atau masyarakat.</p>
        </div>
        <Link href="/dashboard/produk/tambah">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Tambah Produk
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-text-main">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg/50">
              <tr>
                <th scope="col" className="px-6 py-3">Nama Produk</th>
                <th scope="col" className="px-6 py-3">Harga Eceran</th>
                <th scope="col" className="px-6 py-3">Grosir</th>
                <th scope="col" className="px-6 py-3">Stok</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id.toString()} className="bg-surface border-b border-border hover:bg-surface-bg/50">
                  <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-surface-bg rounded flex items-center justify-center mr-3 text-text-muted">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </div>
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {formatCurrency(product.retailPrice)} <span className="text-xs text-text-muted">/{product.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    {product.isWholesaleAvailable ? (
                      <span className="text-success text-xs font-medium border border-success/30 px-2 py-0.5 rounded-full">Tersedia</span>
                    ) : (
                      <span className="text-text-muted text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getProductBadgeVariant(product.status)}>
                      {getProductStatusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ProductActionButtons 
                      productId={product._id.toString()} 
                      productName={product.name} 
                      editUrl={`/dashboard/produk/${product._id}/edit`} 
                    />
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState 
                      title="Belum ada produk" 
                      description="Mulai tambahkan produk unggulan BUMDes Anda." 
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
