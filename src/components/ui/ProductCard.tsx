import Link from "next/link";
import { Package, Store as StoreIcon } from "lucide-react";
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
    <div className="bg-surface rounded-2xl shadow-natural border border-border group hover-lift flex flex-col h-full overflow-hidden">
      <Link href={`/produk/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-surface-bg relative flex justify-center items-center">
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
      
      <div className="p-4 flex flex-col flex-grow">
        {product.categoryId && (
          <div className="text-xs font-medium text-primary mb-1">
            {product.categoryId.name}
          </div>
        )}
        
        <Link href={`/produk/${product.slug}`} className="block mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors text-text-main">
            {product.name}
          </h3>
        </Link>
        
        {product.storeId && (
          <Link href={`/bumdes/${product.storeId.slug}`} className="block group/store mb-1">
            <div className="text-sm text-text-muted flex items-center group-hover/store:text-primary transition-colors">
              <StoreIcon className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{product.storeId.name}</span>
            </div>
          </Link>
        )}
        
        {product.locationText && (
          <div className="text-xs text-text-muted mb-3 line-clamp-1">{product.locationText}</div>
        )}
        
        <div className="mt-auto pt-4">
          <div className="font-bold text-text-main text-lg">
            {formatCurrency(product.retailPrice)}<span className="text-sm font-normal text-text-muted">/{product.unit}</span>
          </div>
          <div className="mt-2">
            <Badge variant="success">Min. Order: {product.minOrder} {product.unit}</Badge>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-5 mt-auto">
        <Link href={`/produk/${product.slug}`} className="block">
          <Button variant="outline" className="w-full text-sm h-11">Lihat Detail</Button>
        </Link>
      </div>
    </div>
  );
}
