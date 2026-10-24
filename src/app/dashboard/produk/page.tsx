import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import Product from "@/models/Product";
import BumdesProfile from "@/models/BumdesProfile";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Package, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/formatters";
import { getProductStatusLabel, getProductBadgeVariant } from "@/lib/utils/status";
import { ProductActionButtons } from "@/components/products/ProductActionButtons";
import { SuccessToast } from "@/components/products/SuccessToast";

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

  const rawProducts = await Product.find({ storeId: store._id }).lean();
  
  // Sorting: WAITING_APPROVAL > REJECTED > ACTIVE > others. Inside groups, sort by createdAt DESC.
  const statusOrder: Record<string, number> = {
    WAITING_APPROVAL: 1,
    REJECTED: 2,
    ACTIVE: 3,
  };

  const products = [...rawProducts].sort((a, b) => {
    const orderA = statusOrder[a.status] || 99;
    const orderB = statusOrder[b.status] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "ACTIVE").length;
  const waitingProducts = products.filter(p => p.status === "WAITING_APPROVAL").length;
  const rejectedProducts = products.filter(p => p.status === "REJECTED").length;

  const hasWaitingApproval = waitingProducts > 0;
  const showOnboardingPanel = totalProducts > 0 && activeProducts === 0;

  return (
    <div className="space-y-6">
      <SuccessToast />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Kelola Produk</h1>
          <p className="text-text-muted mt-1.5 font-medium">Kelola seluruh produk yang dijual melalui GeraiBUMDes.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Link href="/dashboard/produk/tambah" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto flex items-center shadow-sm h-11 rounded-xl font-semibold transition-colors duration-200">
              <Plus className="h-5 w-5 mr-2" /> Tambah Produk
            </Button>
          </Link>
        </div>
      </div>

      {hasWaitingApproval && (
        <div className="mb-6 bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start sm:items-center gap-3">
          <Clock className="h-5 w-5 text-warning-dark mt-0.5 flex-shrink-0" />
          <p className="text-sm text-warning-dark">
            <span className="font-semibold">Produk Anda sedang menunggu proses verifikasi Admin.</span> Setelah disetujui, produk akan otomatis tampil di Marketplace GeraiBUMDes. Tidak diperlukan tindakan tambahan dari Anda.
          </p>
        </div>
      )}

      {showOnboardingPanel && (
        <div className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-primary/10 flex-shrink-0 z-10">
            <span className="text-2xl">🎉</span>
          </div>
          <div className="flex-1 text-center sm:text-left z-10">
            <h3 className="text-lg font-bold text-primary-dark mb-2">Produk Anda berhasil dikirim.</h3>
            <p className="text-sm text-text-muted mb-4 max-w-2xl">
              Produk akan diverifikasi oleh Admin sebelum tampil di Marketplace. Sambil menunggu Anda dapat:
            </p>
            <ul className="text-sm text-text-muted mb-6 space-y-2 inline-block sm:block text-left">
              <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary/60"></div> Menambahkan produk lainnya</li>
              <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary/60"></div> Melengkapi Profil BUMDes</li>
              <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary/60"></div> Melengkapi Data Rekening</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/produk/tambah">
                <Button className="w-full sm:w-auto h-10 rounded-xl font-semibold shadow-sm">
                  Tambah Produk Lagi
                </Button>
              </Link>
              <Link href="/dashboard/toko/edit">
                <Button variant="outline" className="w-full sm:w-auto h-10 rounded-xl font-semibold">
                  Lengkapi Profil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {totalProducts > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-surface-bg flex items-center justify-center">
                  <Package className="h-4 w-4 text-text-muted" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-text-muted">Total Produk</p>
              </div>
              <p className="text-2xl font-bold text-text-main">{totalProducts}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-success-dark" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-text-muted">Produk Aktif</p>
              </div>
              <p className="text-2xl font-bold text-text-main">{activeProducts}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-warning-dark" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-text-muted">Menunggu</p>
              </div>
              <p className="text-2xl font-bold text-text-main">{waitingProducts}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-danger/10 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-danger-dark" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-text-muted">Ditolak</p>
              </div>
              <p className="text-2xl font-bold text-text-main">{rejectedProducts}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden mb-8 transition-shadow duration-300 hover:shadow-md">
        <div className="overflow-x-auto p-1 sm:p-2">
          <table className="w-full text-sm text-left text-text-main">
            <thead className="text-xs text-text-muted uppercase bg-surface-bg/80 border-b border-border font-semibold">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-xl">Nama Produk</th>
                <th scope="col" className="px-6 py-4">Harga Eceran</th>
                <th scope="col" className="px-6 py-4">Grosir</th>
                <th scope="col" className="px-6 py-4">Stok</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right rounded-tr-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id.toString()} className="bg-surface border-b border-border/50 hover:bg-surface-bg/50 transition-colors duration-200 group">
                  <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-surface-bg rounded-xl flex items-center justify-center mr-4 text-text-muted border border-border/50 shadow-sm group-hover:shadow transition-shadow duration-200 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6" />
                        )}
                      </div>
                      <span className="group-hover:text-primary transition-colors duration-200">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(product.retailPrice)} <span className="text-xs text-text-muted font-normal">/{product.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    {product.isWholesaleAvailable ? (
                      <span className="text-success-dark bg-success/10 text-xs font-semibold px-2.5 py-1 rounded-lg">Tersedia</span>
                    ) : (
                      <span className="text-text-muted text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{product.stock}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getProductBadgeVariant(product.status)} className="rounded-lg px-2.5 py-1">
                      {getProductStatusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ProductActionButtons 
                      productId={product._id.toString()} 
                      productName={product.name} 
                      editUrl={`/dashboard/produk/${product._id}/edit`} 
                      status={product.status}
                    />
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 min-h-[400px]">
                      <div className="w-24 h-24 bg-surface-bg rounded-3xl flex items-center justify-center mb-6 border border-border shadow-sm hover:scale-105 transition-transform duration-300">
                        <Package className="h-12 w-12 text-text-muted" />
                      </div>
                      <h3 className="text-xl font-bold text-text-main mb-2">Belum ada produk.</h3>
                      <p className="text-text-muted text-center max-w-md mb-8">
                        Tambahkan produk pertama Anda untuk mulai memperkenalkan potensi BUMDes kepada pembeli.
                      </p>
                      <Link href="/dashboard/produk/tambah">
                        <Button className="w-full sm:w-auto shadow-sm h-11 rounded-xl font-semibold transition-colors duration-200 bg-orange-500 hover:bg-orange-600 text-white">
                          Tambahkan Produk Pertama
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
