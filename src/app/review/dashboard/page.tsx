import { Card, CardContent } from "@/components/ui/Card";
import { mockStats, mockOrders } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, Package, ShoppingCart, Clock } from "lucide-react";

export default function MockDashboardOverview() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-8">Ikhtisar (Mock)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-text-muted mb-1">Total Pendapatan</p>
                <h3 className="text-2xl font-bold text-text-main">{formatCurrency(mockStats.totalRevenue)}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="w-5 h-5 text-primary" /></div>
            </div>
            <p className="text-xs text-success font-medium">+15% dari bulan lalu</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-text-muted mb-1">Produk Aktif</p>
                <h3 className="text-2xl font-bold text-text-main">{mockStats.activeProducts}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg"><Package className="w-5 h-5 text-primary" /></div>
            </div>
            <p className="text-xs text-text-muted">Total katalog terpublikasi</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-text-muted mb-1">Total Pesanan</p>
                <h3 className="text-2xl font-bold text-text-main">{mockStats.totalOrders}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg"><ShoppingCart className="w-5 h-5 text-primary" /></div>
            </div>
            <p className="text-xs text-success font-medium">+5 pesanan baru hari ini</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-text-muted mb-1">Menunggu Proses</p>
                <h3 className="text-2xl font-bold text-text-main">{mockStats.pendingOrders}</h3>
              </div>
              <div className="p-2 bg-warning/10 rounded-lg"><Clock className="w-5 h-5 text-warning" /></div>
            </div>
            <p className="text-xs text-warning font-medium">Perlu segera diproses</p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-bold text-text-main mb-4">Pesanan Terbaru</h2>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-bg/50">
                <th className="p-4 text-sm font-semibold text-text-muted">ID Pesanan</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Pelanggan</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Total</th>
                <th className="p-4 text-sm font-semibold text-text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map(order => (
                <tr key={order.id} className="border-b border-border hover:bg-surface-bg/50 transition-colors">
                  <td className="p-4 text-sm font-medium">{order.id}</td>
                  <td className="p-4 text-sm">{order.customer}</td>
                  <td className="p-4 text-sm font-semibold">{formatCurrency(order.total)}</td>
                  <td className="p-4 text-sm">
                    <Badge variant={order.status === 'SELESAI' ? 'success' : order.status === 'DIPROSES' ? 'primary' : 'warning'}>
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
