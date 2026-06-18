import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Store from "@/models/Store";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";

export default async function AdminProductDetail({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;
  const product = await Product.findById(resolvedParams.id)
    .populate({ path: "storeId", model: Store, select: "name status slug" })
    .populate({ path: "categoryId", model: Category, select: "name" })
    .lean();
  
  if (!product) {
    return <div>Produk tidak ditemukan.</div>;
  }

  // Server action for verification
  async function verifyProduct() {
    "use server";
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) return;

    await dbConnect();
    await Product.findByIdAndUpdate(resolvedParams.id, {
      status: "ACTIVE",
    });
    redirect("/admin/produk?status=WAITING_APPROVAL");
  }

  // Server action for rejection
  async function rejectProduct() {
    "use server";
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) return;
    
    await dbConnect();
    await Product.findByIdAndUpdate(resolvedParams.id, {
      status: "REJECTED",
    });
    redirect("/admin/produk?status=WAITING_APPROVAL");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detail Produk</h1>
        <Link href="/admin/produk">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                  <p className="text-primary font-medium mt-1">Toko: {product.storeId?.name}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                    product.status === 'ACTIVE' ? 'bg-success/20 text-success-dark' : 
                    product.status === 'REJECTED' ? 'bg-danger/20 text-danger-dark' : 
                    product.status === 'WAITING_APPROVAL' ? 'bg-warning/20 text-warning-dark' :
                    'bg-surface-bg text-text-muted'
                  }`}>
                  {product.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 bg-surface-bg/50 p-4 rounded-md">
                <div>
                  <p className="text-sm text-text-muted">Kategori</p>
                  <p className="font-medium">{product.categoryId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Lokasi</p>
                  <p className="font-medium">{product.locationText}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Harga Eceran</p>
                  <p className="font-medium text-lg">Rp {product.retailPrice.toLocaleString('id-ID')} <span className="text-sm font-normal text-text-muted">/ {product.unit}</span></p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Stok Tersedia</p>
                  <p className="font-medium">{product.stock} {product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Minimal Order</p>
                  <p className="font-medium">{product.minOrder} {product.unit}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Deskripsi Produk</h3>
                <p className="text-text-main whitespace-pre-wrap">{product.description}</p>
              </div>

              {product.isWholesaleAvailable && (
                <div className="mt-8">
                  <h3 className="font-bold mb-3">Tingkatan Harga Grosir</h3>
                  <table className="w-full text-sm text-left border">
                    <thead className="bg-surface-bg text-text-muted">
                      <tr>
                        <th className="px-4 py-2 border-b">Min Qty</th>
                        <th className="px-4 py-2 border-b">Max Qty</th>
                        <th className="px-4 py-2 border-b">Harga Satuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.wholesalePriceTiers.map((tier: { minQty: number; maxQty?: number; price: number }, i: number) => (
                        <tr key={i} className="border-b">
                          <td className="px-4 py-2">{tier.minQty} {product.unit}</td>
                          <td className="px-4 py-2">{tier.maxQty ? `${tier.maxQty} ${product.unit}` : 'Tak Terhingga'}</td>
                          <td className="px-4 py-2 font-medium">Rp {tier.price.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {(product.status === "WAITING_APPROVAL" || product.status === "REJECTED") && (
            <Card className="border-primary">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Aksi Verifikasi</h3>
                
                <form action={verifyProduct} className="mb-3">
                  <Button type="submit" className="w-full bg-success hover:bg-success/90">
                    Setujui & Aktifkan Produk
                  </Button>
                </form>

                {product.status === "WAITING_APPROVAL" && (
                  <form action={rejectProduct}>
                    <Button type="submit" variant="danger" className="w-full">
                      Tolak Produk
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-3">Gambar Produk</h3>
              {product.images && product.images.length > 0 && product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-auto rounded-md border" />
              ) : (
                <div className="w-full aspect-square bg-surface-bg border border-border flex items-center justify-center rounded-md text-text-muted">
                  Tidak Ada Gambar
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
