import { Search, Filter, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import Product from "@/models/Product";
import BusinessType from "@/models/BusinessType";
import { StoreCard } from "@/components/ui/StoreCard";
import { FilterLocation } from "@/components/ui/FilterLocation";

export default async function TokoDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; province?: string; regency?: string; businessType?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  await dbConnect();

  // Build Query
  const query: Record<string, any> = { status: "ACTIVE" };

  if (resolvedSearchParams.q) {
    query.name = { $regex: resolvedSearchParams.q, $options: "i" };
  }
  if (resolvedSearchParams.province) {
    query.province = { $regex: resolvedSearchParams.province, $options: "i" };
  }
  if (resolvedSearchParams.regency) {
    query.regency = { $regex: resolvedSearchParams.regency, $options: "i" };
  }
  if (resolvedSearchParams.businessType) {
    query.businessType = { $regex: resolvedSearchParams.businessType, $options: "i" };
  }

  // Fetch active stores
  const stores = await Store.find(query).sort({ createdAt: -1 }).lean();

  // For each store, we might want to get the active product count
  // This could be heavy if there are many stores, but for MVP it's fine.
  const storeIds = stores.map(s => s._id);
  const activeProducts = await Product.aggregate([
    { $match: { storeId: { $in: storeIds }, status: "ACTIVE" } },
    { $group: { _id: "$storeId", count: { $sum: 1 } } }
  ]);

  const productCountMap: Record<string, number> = {};
  activeProducts.forEach(ap => {
    productCountMap[ap._id.toString()] = ap.count;
  });

  const businessTypes = await BusinessType.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });

  const renderFilters = () => (
    <form>
      {resolvedSearchParams.q && <input type="hidden" name="q" value={resolvedSearchParams.q} />}
      <div className="mb-6">
        <h3 className="font-semibold text-text-main mb-3">Lokasi BUMDes</h3>
        <FilterLocation 
          initialProvince={resolvedSearchParams.province} 
          initialRegency={resolvedSearchParams.regency} 
        />
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-text-main mb-3">Jenis Usaha</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          <label className="flex items-center">
            <input type="radio" name="businessType" value="" defaultChecked={!resolvedSearchParams.businessType} className="text-primary focus:ring-primary mr-2" />
            <span className="text-sm text-text-muted">Semua Jenis</span>
          </label>
          {businessTypes.map((bt) => (
            <label key={bt._id.toString()} className="flex items-center">
              <input type="radio" name="businessType" value={bt.name} defaultChecked={resolvedSearchParams.businessType === bt.name} className="text-primary focus:ring-primary mr-2" />
              <span className="text-sm text-text-muted">{bt.name}</span>
            </label>
          ))}
        </div>
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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Direktori BUMDes</h1>
            <p className="text-surface/80 text-base max-w-xl">
              Temukan berbagai Badan Usaha Milik Desa terverifikasi dari seluruh Indonesia.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="/produk">
              <Button variant="outline" className="h-10 px-6 border-surface text-surface bg-surface/10 hover:bg-surface/20 font-semibold w-full md:w-auto">
                Cari Produk
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
        <div className="flex items-center text-text-main font-semibold mb-6">
          {stores.length} BUMDes Ditemukan
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

          {/* Store Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <StoreCard 
                  key={store._id.toString()} 
                  store={store as any} 
                  activeProductCount={productCountMap[store._id.toString()] || 0} 
                />
              ))}
            </div>

            {stores.length === 0 && (
              <div className="text-center py-20 bg-surface rounded-lg border border-border">
                <StoreIcon className="h-16 w-16 text-border mx-auto mb-4" />
                <h2 className="text-xl font-bold text-text-main">Tidak Ada BUMDes Ditemukan</h2>
                <p className="text-text-muted mt-2">Coba gunakan kata kunci atau filter lokasi yang berbeda.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
