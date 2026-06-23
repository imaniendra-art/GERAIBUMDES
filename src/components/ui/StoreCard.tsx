import Link from "next/link";
import { Store as StoreIcon, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StoreCardProps {
  store: {
    _id: string | any;
    slug: string;
    name: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    village?: string;
    district?: string;
    regency?: string;
    province?: string;
    businessType?: string;
  };
  activeProductCount?: number;
}

export function StoreCard({ store, activeProductCount }: StoreCardProps) {
  const locationParts = [store.village, store.district, store.regency, store.province].filter(Boolean);
  const shortLocation = locationParts.slice(0, 2).join(", "); // e.g. "Desa Sukamaju, Kec. Maju"

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border group hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
      <div className="h-24 md:h-32 relative">
        {store.bannerUrl ? (
          <img src={store.bannerUrl} alt={`${store.name} Banner`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-green-100 to-green-200"></div>
        )}
        <div className="absolute -bottom-8 left-4">
          <div className="h-16 w-16 bg-surface rounded-full border-4 border-surface shadow-sm flex items-center justify-center overflow-hidden">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <StoreIcon className="h-8 w-8 text-primary" />
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 pt-10 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/bumdes/${store.slug}`} className="block flex-1">
            <h3 className="font-bold text-lg hover:text-primary transition-colors text-text-main line-clamp-2">
              {store.name}
            </h3>
          </Link>
          <div className="flex-shrink-0 ml-2 mt-1" title="BUMDes Terverifikasi">
            <ShieldCheck className="h-5 w-5 text-secondary" />
          </div>
        </div>
        
        {store.businessType && (
          <div className="text-xs font-semibold text-primary mb-2">
            {store.businessType}
          </div>
        )}

        {shortLocation && (
          <div className="text-xs text-text-muted flex items-center mb-2 line-clamp-1">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{shortLocation}</span>
          </div>
        )}
        
        {store.description ? (
          <p className="text-sm text-text-muted line-clamp-2 mt-auto">
            {store.description}
          </p>
        ) : (
          <p className="text-sm text-text-muted italic mt-auto">
            Belum ada deskripsi.
          </p>
        )}

        {typeof activeProductCount === "number" && (
          <div className="mt-3 text-xs font-medium text-text-main bg-surface-bg inline-block px-2 py-1 rounded w-fit">
            {activeProductCount} Produk Aktif
          </div>
        )}
      </div>
      
      <div className="px-4 pb-4 mt-2">
        <Link href={`/bumdes/${store.slug}`} className="block">
          <Button variant="outline" className="w-full text-sm h-9">Kunjungi BUMDes</Button>
        </Link>
      </div>
    </div>
  );
}
