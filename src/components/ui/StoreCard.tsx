import Link from "next/link";
import { Store as StoreIcon, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
    <div className="bg-surface rounded-2xl shadow-natural border border-border group hover-lift flex flex-col h-full overflow-hidden">
      <div className="h-28 md:h-36 relative">
        {store.bannerUrl ? (
          <img src={store.bannerUrl} alt={`${store.name} Banner`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-primary/10 to-secondary/10 group-hover:scale-105 transition-transform duration-500"></div>
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
          <div className="mt-4">
            <Badge variant="neutral">{activeProductCount} Produk Aktif</Badge>
          </div>
        )}
      </div>
      
      <div className="px-5 pb-5 mt-2">
        <Link href={`/bumdes/${store.slug}`} className="block">
          <Button variant="outline" className="w-full text-sm h-11">Kunjungi BUMDes</Button>
        </Link>
      </div>
    </div>
  );
}
