import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Store from "@/models/Store";
import Category from "@/models/Category";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Package, Store as StoreIcon, MapPin, ChevronRight, Truck, ShieldCheck, CheckCircle2, Info } from "lucide-react";
import AddToCartActions from "@/components/cart/AddToCartActions";
import { formatCurrency } from "@/lib/utils/formatters";
import { ProductCard } from "@/components/ui/ProductCard";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await dbConnect();

  const product = await Product.findOne({ slug: resolvedParams.slug, status: "ACTIVE" })
    .populate({ path: "storeId", model: Store, select: "name slug status description village district province logoUrl" })
    .populate({ path: "categoryId", model: Category, select: "name" })
    .lean();

  if (!product || !product.storeId || product.storeId.status !== "ACTIVE") {
    notFound();
  }

  // Fetch related products (same store, different product, active)
  const relatedProducts = await Product.find({
    storeId: product.storeId._id,
    _id: { $ne: product._id },
    status: "ACTIVE"
  })
    .populate({ path: "categoryId", model: Category, select: "name slug" })
    .populate({ path: "storeId", model: Store, select: "name slug" })
    .limit(4)
    .lean();

  return (
    <div className="bg-surface-bg min-h-screen pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center text-sm text-text-muted mb-8 gap-y-2">
          <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
          <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
          <Link href="/produk" className="hover:text-primary transition-colors">Produk</Link>
          <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
          <span className="text-text-main font-medium line-clamp-1">{product.name}</span>
        </div>

        {/* 3-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-10">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="sticky top-24">
              <div className="bg-surface rounded-2xl border border-border overflow-hidden p-6 flex flex-col gap-4">
                {/* Main Square Image */}
                <div className="aspect-square bg-surface-bg rounded-xl flex items-center justify-center overflow-hidden w-full relative group">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                  ) : (
                    <Package className="h-24 w-24 text-border" />
                  )}
                  {product.isWholesaleAvailable && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="warning" className="shadow-sm">Grosir</Badge>
                    </div>
                  )}
                </div>
                
                {/* Thumbnails (Future-proofed) */}
                <div className="flex gap-4 overflow-x-auto pt-2 pb-1 hide-scrollbar">
                  {/* Current Image Thumbnail */}
                  <div className="w-24 h-24 rounded-lg border-2 border-primary overflow-hidden flex-shrink-0 cursor-pointer">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="Thumb" className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full bg-surface-bg flex items-center justify-center"><Package className="h-6 w-6 text-border" /></div>
                    )}
                  </div>
                  {/* Dummy Placeholders to show capability */}
                  <div className="w-24 h-24 rounded-lg border border-border bg-surface-bg/50 opacity-40 flex-shrink-0 cursor-not-allowed"></div>
                  <div className="w-24 h-24 rounded-lg border border-border bg-surface-bg/50 opacity-40 flex-shrink-0 cursor-not-allowed"></div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE: Product Information */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="pb-8 border-b border-border">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-primary uppercase">{product.categoryId?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-main mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-center text-sm text-text-muted mb-6">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-primary" /> {product.locationText}</span>
              </div>

              <div className="mb-8">
                <div className="text-sm text-text-muted mb-2">Harga B2B</div>
                <div className="text-5xl font-black text-earth flex items-end gap-2">
                  {formatCurrency(product.retailPrice)}
                  <span className="text-xl font-medium text-text-muted mb-1.5">/{product.unit}</span>
                </div>
              </div>

              <div className="mb-8 flex gap-3">
                <Badge variant="success" className="px-3 py-1.5 text-sm font-medium">Min. Order: {product.minOrder} {product.unit}</Badge>
                <Badge variant="neutral" className="px-3 py-1.5 text-sm font-medium">Stok Tersedia</Badge>
              </div>

              {/* Wholesale Pricing */}
              {product.isWholesaleAvailable && product.wholesalePriceTiers?.length > 0 && (
                <div className="mb-6 bg-surface p-5 rounded-xl border border-secondary/20 shadow-sm">
                  <h3 className="font-bold text-sm mb-4 flex items-center">
                    <span className="bg-secondary text-surface text-xs px-2 py-0.5 rounded mr-2 font-bold uppercase tracking-wide">GROSIR</span> 
                    Harga BUMDes Berjenjang
                  </h3>
                  <div className="space-y-3">
                    {product.wholesalePriceTiers.map((tier: { minQty: number; maxQty?: number; price: number }, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-text-muted">
                          Beli {tier.maxQty 
                            ? `${tier.minQty} - ${tier.maxQty} ${product.unit}`
                            : `≥ ${tier.minQty} ${product.unit}`
                          }
                        </span>
                        <span className="font-bold text-text-main">{formatCurrency(tier.price)} / {product.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Desc Preview */}
              <div className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-6 mt-4">
                {product.description}
              </div>
            </div>

            {/* Full Description Section */}
            <div className="pt-8">
              <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Detail & Deskripsi
              </h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-text-muted leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          </div>

          {/* RIGHT: Purchase Panel & Trust */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              
              {/* Purchase Panel */}
              <div className="bg-surface rounded-2xl shadow-natural border border-border p-6">
                <h3 className="font-bold text-lg text-text-main mb-5 border-b border-border pb-4">Atur Pesanan</h3>
                
                <div className="mb-6">
                  <AddToCartActions 
                    product={{
                      _id: product._id.toString(),
                      name: product.name,
                      slug: product.slug,
                      retailPrice: product.retailPrice,
                      minOrder: product.minOrder,
                      unit: product.unit,
                      isWholesaleAvailable: product.isWholesaleAvailable,
                      wholesalePriceTiers: product.wholesalePriceTiers || [],
                      images: product.images
                    }}
                    store={{
                      _id: product.storeId?._id.toString(),
                      name: product.storeId?.name,
                      slug: product.storeId?.slug
                    }}
                  />
                </div>

                {/* Shipping Info Grouped */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-xs text-text-muted">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-text-main mb-1">Informasi Pengiriman</p>
                      <p className="leading-relaxed">Biaya logistik B2B akan dihitung manual oleh BUMDes setelah checkout.</p>
                      {product.shippingNotes && (
                        <p className="mt-2 text-primary font-medium">{product.shippingNotes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Section */}
              <div className="bg-surface rounded-2xl shadow-natural border border-border p-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300">
                  <ShieldCheck className="w-32 h-32 text-success" />
                </div>
                
                <h3 className="font-bold text-lg text-text-main mb-5 relative z-10">Informasi Pemasok</h3>
                
                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-surface-bg border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.storeId?.logoUrl ? (
                      <img src={product.storeId.logoUrl} alt={product.storeId.name} className="w-full h-full object-cover" />
                    ) : (
                      <StoreIcon className="w-6 h-6 text-text-muted" />
                    )}
                  </div>
                  <div>
                    <Link href={`/bumdes/${product.storeId?.slug}`} className="font-bold text-text-main hover:text-primary transition-colors flex items-center gap-1 line-clamp-1">
                      {product.storeId?.name}
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    </Link>
                    <div className="text-xs text-text-muted flex items-center gap-1 mt-1 line-clamp-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {product.storeId?.village || 'Desa'}, {product.storeId?.district || 'Kecamatan'}
                    </div>
                  </div>
                </div>
                
                <Link href={`/bumdes/${product.storeId?.slug}`} className="block relative z-10">
                  <Button variant="outline" className="w-full text-sm">Kunjungi Toko BUMDes</Button>
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold text-text-main mb-8">Produk Lain dari BUMDes Ini</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductCard key={relatedProduct._id.toString()} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
