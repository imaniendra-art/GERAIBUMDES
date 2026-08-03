import { Card } from "@/components/ui/Card";

export default function MockDashboardProducts() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-8">Manajemen Produk (Mock)</h1>
      <Card className="p-16 text-center text-text-muted">
        <p>Halaman ini menampilkan simulasi tabel manajemen produk.</p>
        <p className="mt-2">Dalam produksi, halaman ini menggunakan data asli dari MongoDB.</p>
      </Card>
    </div>
  );
}
