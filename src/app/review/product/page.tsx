import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { mockProducts, mockStores } from "@/lib/mock-data";
import { Store, MapPin, ShoppingCart, Info, ShieldCheck } from "lucide-react";

export default function MockProductPage() {
  const product = mockProducts[0];
  const store = mockStores[0];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-surface rounded-2xl shadow-natural border border-border p-6 md:p-10 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <div className="rounded-2xl overflow-hidden border border-border bg-surface-bg flex items-center justify-center aspect-square">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{product.categoryId.name}</span>
              {product.isWholesaleAvailable && <Badge variant="warning">Grosir Tersedia</Badge>}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 text-sm text-text-muted mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-1.5"><Store className="w-4 h-4" /> {store.name}</div>
              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {store.district}, {store.province}</div>
            </div>
            
            <div className="mb-8">
              <div className="text-sm text-text-muted mb-1">Harga B2B</div>
              <div className="text-4xl font-black text-cta">
                Rp 15.000<span className="text-lg font-medium text-text-muted">/{product.unit}</span>
              </div>
              <div className="mt-2 text-sm bg-success/10 text-success inline-flex px-3 py-1.5 rounded-lg font-medium">
                Minimal Order: {product.minOrder} {product.unit}
              </div>
            </div>
            
            <div className="mt-auto flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" className="w-full sm:flex-1 h-14 text-lg flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Masukkan Keranjang
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 text-lg">
                Tanya Penjual
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl shadow-natural border border-border p-6 md:p-8">
            <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Info className="w-6 h-6 text-primary" /> Deskripsi Produk
            </h2>
            <div className="prose prose-sm sm:prose-base max-w-none text-text-muted">
              <p>Beras Organik Premium (Pandan Wangi) ditanam tanpa menggunakan bahan kimia sintetis seperti pestisida dan pupuk buatan. Dihasilkan langsung dari petani lokal BUMDes Maju Bersama, beras ini menjamin kesehatan dan kualitas nasi yang pulen, harum, serta aman dikonsumsi seluruh anggota keluarga.</p>
              <ul>
                <li><strong>Kualitas:</strong> Premium Grade A</li>
                <li><strong>Sertifikasi:</strong> Organik Nasional</li>
                <li><strong>Pengemasan:</strong> Karung 50kg, siap untuk didistribusikan ulang.</li>
                <li><strong>Ketahanan:</strong> Mampu disimpan hingga 6 bulan di tempat kering.</li>
              </ul>
              <p>Sangat cocok untuk kebutuhan pasokan BUMDes lain, katering, restoran, dan toko kelontong di wilayah perkotaan yang mencari pasokan beras organik dengan harga tangan pertama.</p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl shadow-natural border border-border p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="w-24 h-24 text-success" /></div>
             <h3 className="font-bold text-lg text-text-main mb-4">Informasi BUMDes</h3>
             <div className="flex items-center gap-4 mb-4">
               <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                 <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
               </div>
               <div>
                 <div className="font-bold text-text-main">{store.name}</div>
                 <div className="text-sm text-text-muted">{store.village}</div>
               </div>
             </div>
             <Button variant="outline" className="w-full mt-2">Kunjungi Profil Toko</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
