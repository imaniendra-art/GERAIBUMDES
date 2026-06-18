import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Package, Search, Filter, Store as StoreIcon } from "lucide-react";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ProductCard } from "@/components/ui/ProductCard";
import { FilterLocation } from "@/components/ui/FilterLocation";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; wholesale?: string; province?: string; regency?: string; sort?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  await dbConnect();

  // Build Query
  const query: Record<string, unknown> = { status: "ACTIVE" };
  
  if (resolvedSearchParams.q) {
    query.name = { $regex: resolvedSearchParams.q, $options: "i" };
  }

  if (resolvedSearchParams.wholesale === "true") {
    query.isWholesaleAvailable = true;
  }

  if (resolvedSearchParams.category && resolvedSearchParams.category !== "Semua") {
    const cat = await Category.findOne({ name: resolvedSearchParams.category });
    if (cat) {
      query.categoryId = cat._id;
    }
  }

  // Store Matching for location filters
  const storeMatch: Record<string, any> = { status: "ACTIVE" };
  if (resolvedSearchParams.province) {
    storeMatch.province = { $regex: resolvedSearchParams.province, $options: "i" };
  }
  if (resolvedSearchParams.regency) {
    storeMatch.regency = { $regex: resolvedSearchParams.regency, $options: "i" };
  }

  // Sorting
  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (resolvedSearchParams.sort === "lowest_price") {
    sortOption = { retailPrice: 1 };
  } else if (resolvedSearchParams.sort === "highest_price") {
    sortOption = { retailPrice: -1 };
  }

  // Fetch only active stores' active products
  const products = await Product.find(query)
    .populate({ path: "storeId", match: storeMatch, select: "name slug village district regency province" })
    .populate({ path: "categoryId", select: "name slug" })
    .sort(sortOption)
    .lean();

  // Filter out products whose store is not active/matched, and map locationText
  const availableProducts = products
    .filter((p: any) => p.storeId != null)
    .map((p: any) => {
      const loc = [p.storeId.regency, p.storeId.province].filter(Boolean).join(", ");
      return { ...p, locationText: loc };
    });

  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });

  const renderFilters = () => (
    <form>
      {resolvedSearchParams.q && <input type="hidden" name="q" value={resolvedSearchParams.q} />}
      <div className="mb-6">
        <h3 className="font-semibold text-text-main mb-3 flex items-center">
          <Filter className="h-4 w-4 mr-2" /> Kategori
        </h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="radio" name="category" value="Semua" defaultChecked={!resolvedSearchParams.category || resolvedSearchParams.category === "Semua"} className="text-primary focus:ring-primary mr-2" />
            <span className="text-sm text-text-muted">Semua Kategori</span>
          </label>
          {categories.map((cat) => (
            <label key={cat._id.toString()} className="flex items-center">
              <input type="radio" name="category" value={cat.name} defaultChecked={resolvedSearchParams.category === cat.name} className="text-primary focus:ring-primary mr-2" />
              <span className="text-sm text-text-muted">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold text-text-main mb-3">Lokasi (Opsional)</h3>
        <FilterLocation 
          initialProvince={resolvedSearchParams.province} 
          initialRegency={resolvedSearchParams.regency} 
        />
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-text-main mb-3">Tipe Pembelian</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" name="wholesale" value="true" defaultChecked={resolvedSearchParams.wholesale === "true"} className="rounded text-primary focus:ring-primary mr-2" />
            <span className="text-sm text-text-muted">Harga Grosir</span>
          </label>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-text-main mb-3">Urutkan</h3>
        <select name="sort" defaultValue={resolvedSearchParams.sort || "newest"} className="w-full text-sm border border-border rounded px-2 py-2 focus:ring-primary bg-surface">
          <option value="newest">Terbaru</option>
          <option value="lowest_price">Harga Terendah</option>
          <option value="highest_price">Harga Tertinggi</option>
        </select>
      </div>

      <Button type="submit" className="w-full">Terapkan Filter</Button>
    </form>
  );

  return (
    <div className="bg-surface-bg min-h-screen">
      {/* Left-Aligned Slim Hero */}
      <div className="bg-primary text-surface py-8 border-b border-primary-dark">
        <div className="w-full px-4 sm:px-8 lg:px-24 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Marketplace Antar-BUMDes</h1>
            <p className="text-surface/80 text-base max-w-xl">
              Eksplorasi komoditas dan pasokan unggulan dari berbagai desa.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link href="/toko">
              <Button variant="outline" className="h-10 px-6 border-surface text-surface bg-surface/10 hover:bg-surface/20 font-semibold w-full md:w-auto">
                Cari BUMDes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
        <div className="flex items-center text-text-main font-semibold mb-6">
          {availableProducts.length} Produk Ditemukan
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            {/* Mobile Filter (Collapsible) */}
            <details className="md:hidden group bg-surface rounded-lg border border-border mb-6">
              <summary className="flex items-center justify-between p-4 font-bold cursor-pointer list-none">
                <div className="flex items-center"><Filter className="h-5 w-5 mr-2" /> Filter Pencarian</div>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 border-t border-border">
                {renderFilters()}
              </div>
            </details>

            {/* Desktop Filter */}
            <div className="hidden md:block">
              <Card>
                <CardContent className="p-5">
                  {renderFilters()}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {availableProducts.map((product) => (
                <ProductCard key={product._id.toString()} product={product} />
              ))}
            </div>

            {availableProducts.length === 0 && (
              <div className="text-center py-20 bg-surface rounded-lg border border-border">
                <Package className="h-16 w-16 text-border mx-auto mb-4" />
                <h2 className="text-xl font-bold text-text-main">Tidak Ada Produk</h2>
                <p className="text-text-muted mt-2">Coba gunakan kata kunci atau filter lain.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
