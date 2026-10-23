import Link from "next/link";
import { Package, Store as StoreIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/formatters";

interface ProductCardProps {
  product: {
    _id: string | any;
    slug: string;
    name: string;
    images?: string[];
    isWholesaleAvailable: boolean;
    retailPrice: number;
    unit: string;
    minOrder: number;
    locationText?: string;
    categoryId?: { name: string; slug: string };
    storeId?: { name: string; slug: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 border border-border group flex flex-col h-full overflow-hidden">
      <Link href={`/produk/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-[4/3] md:aspect-square bg-surface-bg relative flex justify-center items-center">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <Package className="h-12 w-12 text-border" />
          )}
          {product.isWholesaleAvailable && (
            <div className="absolute top-3 left-3">
              <Badge variant="warning">Grosir</Badge>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-2.5 md:p-4 flex flex-col flex-grow">
        {product.categoryId && (
          <div className="text-[10px] md:text-xs font-medium text-primary mb-1">
            {product.categoryId.name}
          </div>
        )}
        
        <Link href={`/produk/${product.slug}`} className="block mb-1 md:mb-2">
          <h3 className="font-semibold text-[13px] md:text-lg line-clamp-2 hover:text-primary transition-colors text-text-main leading-tight md:leading-normal">
            {product.name}
          </h3>
        </Link>
        
        {product.storeId && (
          <Link href={`/bumdes/${product.storeId.slug}`} className="block group/store mb-1">
            <div className="text-[10px] md:text-sm text-text-muted flex items-center group-hover/store:text-primary transition-colors">
              <StoreIcon className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{product.storeId.name}</span>
            </div>
          </Link>
        )}
        
        {product.locationText && (
          <div className="hidden md:block text-xs text-text-muted mb-2 md:mb-3 line-clamp-1">{product.locationText}</div>
        )}
        
        <div className="mt-auto pt-1.5 md:pt-4">
          <div className="font-bold text-text-main text-sm md:text-lg">
            {formatCurrency(product.retailPrice)}<span className="text-[10px] md:text-sm font-normal text-text-muted">/{product.unit}</span>
          </div>
          <div className="mt-1 md:mt-2">
            <Badge variant="success" className="text-[9px] md:text-xs py-0.5 px-1.5 md:py-1 md:px-2.5">Min. Order: {product.minOrder} {product.unit}</Badge>
          </div>
        </div>
      </div>
      
      <div className="px-2.5 pb-2.5 md:px-5 md:pb-5 mt-auto">
        <Link href={`/produk/${product.slug}`} className="block">
          <Button variant="outline" className="w-full text-xs md:text-sm h-8 md:h-10 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all font-semibold flex items-center justify-center gap-1.5">Lihat Detail <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" /></Button>
        </Link>
      </div>
    </div>
  );
}
