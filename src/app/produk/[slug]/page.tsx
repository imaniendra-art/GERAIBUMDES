import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Store from "@/models/Store";
import Category from "@/models/Category";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Package, Store as StoreIcon, MapPin, ChevronRight, Truck } from "lucide-react";
import AddToCartActions from "@/components/cart/AddToCartActions";
import { formatCurrency } from "@/lib/utils/formatters";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await dbConnect();

  const product = await Product.findOne({ slug: resolvedParams.slug, status: "ACTIVE" })
    .populate({ path: "storeId", model: Store, select: "name slug status description" })
    .populate({ path: "categoryId", model: Category, select: "name" })
    .lean();

  if (!product || !product.storeId || product.storeId.status !== "ACTIVE") {
    notFound();
  }

  return (
    <div className="bg-surface-bg min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full px-4 sm:px-8 lg:px-24">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/produk" className="hover:text-primary">Produk</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-text-main">{product.name}</span>
        </div>

        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="flex flex-col md:flex-row">
            
            {/* Product Image */}
            <div className="w-full md:w-2/5 lg:w-1/2 bg-surface-bg p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-border">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full max-w-md h-auto object-contain mix-blend-multiply" />
              ) : (
                <Package className="h-32 w-32 text-border" />
              )}
            </div>

            {/* Product Info */}
            <div className="w-full md:w-3/5 lg:w-1/2 p-6 md:p-8 flex flex-col">
              <div className="mb-4">
                <span className="text-xs font-semibold tracking-wider text-primary uppercase mb-2 block">{product.categoryId?.name}</span>
                <h1 className="text-2xl md:text-3xl font-bold text-text-main mb-2">{product.name}</h1>
                <div className="flex items-center text-sm text-text-muted space-x-4">
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {product.locationText}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-earth">{formatCurrency(product.retailPrice)}</p>
                <p className="text-sm text-text-muted mt-1">Eceran (Minimal {product.minOrder} {product.unit})</p>
              </div>

              {/* Wholesale Pricing */}
              {product.isWholesaleAvailable && product.wholesalePriceTiers?.length > 0 && (
                <div className="mb-6 bg-surface-bg p-4 rounded-lg border border-secondary/30">
                  <h3 className="font-bold text-sm mb-3 flex items-center">
                    <span className="bg-secondary text-surface text-xs px-2 py-0.5 rounded mr-2">GROSIR</span> 
                    Harga BUMDes
                  </h3>
                  <div className="space-y-2">
                    {product.wholesalePriceTiers.map((tier: { minQty: number; maxQty?: number; price: number }, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-text-muted">
                          {tier.maxQty 
                            ? `${tier.minQty} - ${tier.maxQty} ${product.unit}`
                            : `≥ ${tier.minQty} ${product.unit}`
                          }
                        </span>
                        <span className="font-semibold text-text-main">{formatCurrency(tier.price)} / {product.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 flex-grow">
                <h3 className="font-semibold text-text-main mb-2">Deskripsi Produk</h3>
                <p className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
                
                {product.shippingNotes && (
                  <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded text-sm text-text-main">
                    <span className="font-semibold block mb-1">Catatan Pengiriman:</span>
                    {product.shippingNotes}
                  </div>
                )}
              </div>

              {/* Store & CTA */}
              <div className="mt-auto pt-6 border-t border-border flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
                <Link href={`/bumdes/${product.storeId?.slug}`} className="flex items-center w-full xl:w-auto hover:bg-surface-bg p-2 rounded-lg transition-colors -ml-2">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                    <StoreIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main">{product.storeId?.name}</p>
                    <p className="text-xs text-text-muted line-clamp-1">{product.storeId?.description || "Kunjungi Toko"}</p>
                  </div>
                </Link>
                
                <div className="flex flex-col w-full xl:w-auto mt-4 xl:mt-0 space-y-4">
                  <div className="bg-primary/5 border border-primary/10 rounded p-3 text-xs text-text-muted flex items-start">
                    <Truck className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                    <p>Ongkos kirim akan dikonfirmasi secara manual oleh BUMDes penjual setelah pesanan dibuat.</p>
                  </div>
                  
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
