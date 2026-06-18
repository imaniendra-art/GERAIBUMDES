import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { FolderTree, Briefcase, MapPin } from "lucide-react";

export default function MasterDataDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">Master Data</h1>
        <p className="text-text-muted">Kelola data dasar untuk operasional BUMDesmart.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/master/kategori">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <FolderTree className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-lg font-bold mb-2">Kategori Produk</h2>
              <p className="text-sm text-text-muted">Kelola pengelompokan produk yang akan tampil di marketplace.</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/master/jenis-usaha">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Briefcase className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-lg font-bold mb-2">Jenis Usaha</h2>
              <p className="text-sm text-text-muted">Kelola daftar klasifikasi tipe usaha BUMDes.</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/master/wilayah">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-lg font-bold mb-2">Wilayah Operasional</h2>
              <p className="text-sm text-text-muted">Kelola data provinsi, kabupaten/kota, hingga kecamatan/desa.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
