"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Loader2, Truck, CheckCircle, XCircle, PackageCheck, LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

export function SetShippingForm({ orderId, currentSubtotal }: { orderId: string, currentSubtotal: number }) {
  const [shippingCost, setShippingCost] = useState("");
  const [shippingNote, setShippingNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/seller-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "SET_SHIPPING", 
          shippingCost: Number(shippingCost),
          manualShippingNote: shippingNote
        }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate ongkir");
      
      alert("Ongkos kirim berhasil diatur. Pesanan diteruskan ke pembeli untuk pembayaran.");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Nominal Ongkos Kirim (Rp) <span className="text-danger">*</span></label>
        <input 
          type="number" 
          required 
          min="0"
          value={shippingCost} 
          onChange={(e) => setShippingCost(e.target.value)}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:ring-primary text-text-main"
          placeholder="Contoh: 50000"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Info Pengiriman (Opsional)</label>
        <textarea 
          rows={2}
          value={shippingNote} 
          onChange={(e) => setShippingNote(e.target.value)}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:ring-primary text-text-main"
          placeholder="Contoh: Dikirim dengan mobil BUMDes besok pagi"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full text-sm h-auto py-2.5">
        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2 flex-shrink-0" /> : <Truck className="h-4 w-4 mr-2 flex-shrink-0" />}
        <span className="whitespace-normal text-left">Konfirmasi Stok & Ongkir</span>
      </Button>
    </form>
  );
}

export function VerifyPaymentForm({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleVerify = async (status: "APPROVE" | "REJECT") => {
    setLoading(status);
    try {
      const res = await fetch(`/api/orders/${orderId}/seller-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_PAYMENT", verificationStatus: status }),
      });

      if (!res.ok) throw new Error("Gagal memverifikasi pembayaran");
      
      alert(`Pembayaran berhasil ${status === "APPROVE" ? "disetujui" : "ditolak"}.`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Button 
        onClick={() => handleVerify("APPROVE")} 
        disabled={loading !== null} 
        className="w-full bg-success hover:bg-success-dark text-surface text-sm"
      >
        {loading === "APPROVE" ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
        Terima & Proses Pesanan
      </Button>
      <Button 
        onClick={() => handleVerify("REJECT")} 
        disabled={loading !== null} 
        variant="outline" 
        className="w-full text-danger border-danger hover:bg-danger/10 text-sm"
      >
        {loading === "REJECT" ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
        Tolak Pembayaran
      </Button>
    </div>
  );
}

export function UpdateStatusForm({ orderId, nextAction, label, iconName }: { orderId: string, nextAction: string, label: string, iconName?: keyof typeof Icons }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const Icon = iconName ? Icons[iconName] as LucideIcon : null;

  const handleUpdate = async () => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status pesanan menjadi ${label}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/seller-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_STATUS", nextStatus: nextAction }),
      });

      if (!res.ok) throw new Error("Gagal update status");
      
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleUpdate} disabled={loading} className="w-full text-sm h-auto py-2.5">
      {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2 flex-shrink-0" /> : Icon && <Icon className="h-4 w-4 mr-2 flex-shrink-0" />}
      <span className="whitespace-normal text-left">{label}</span>
    </Button>
  );
}

export function ShipManualForm({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    shippingProvider: "",
    trackingNumber: "",
    shippingContact: "",
    shippingProofUrl: "",
    manualShippingNote: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Apakah Anda yakin ingin menandai pesanan ini sebagai telah dikirim?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/seller-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "UPDATE_STATUS", 
          nextStatus: "SHIPPED_MANUAL",
          ...formData
        }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate status pengiriman");
      
      alert("Pesanan berhasil ditandai sebagai dikirim.");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full bg-earth hover:bg-earth/90 text-surface">
        <Truck className="h-4 w-4 mr-2" />
        Kirim Manual
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-surface-bg border border-border p-4 rounded-md">
      <h4 className="font-bold text-sm mb-2 text-text-main flex items-center">
        <Truck className="h-4 w-4 mr-2 text-primary" /> Detail Pengiriman Manual
      </h4>
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Kurir / Jasa / Kendaraan</label>
        <input 
          type="text" 
          value={formData.shippingProvider} 
          onChange={(e) => setFormData({...formData, shippingProvider: e.target.value})}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:ring-primary text-text-main text-sm"
          placeholder="Misal: Kurir BUMDes, Sopir Pak Budi"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">No. Resi / Plat Kendaraan</label>
        <input 
          type="text" 
          value={formData.trackingNumber} 
          onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:ring-primary text-text-main text-sm"
          placeholder="Opsional"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Kontak Pengirim (HP/WA)</label>
        <input 
          type="text" 
          value={formData.shippingContact} 
          onChange={(e) => setFormData({...formData, shippingContact: e.target.value})}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:ring-primary text-text-main text-sm"
          placeholder="Opsional"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Catatan Tambahan</label>
        <textarea 
          rows={2}
          value={formData.manualShippingNote} 
          onChange={(e) => setFormData({...formData, manualShippingNote: e.target.value})}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:ring-primary text-text-main text-sm"
          placeholder="Misal: Titip di pos satpam jika tidak ada orang."
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">URL Bukti Pengiriman / Resi (Opsional)</label>
        <input 
          type="text" 
          value={formData.shippingProofUrl} 
          onChange={(e) => setFormData({...formData, shippingProofUrl: e.target.value})}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 focus:ring-primary text-text-main text-sm"
          placeholder="https://..."
        />
      </div>

      <div className="flex flex-col gap-2.5 pt-2">
        <Button type="submit" size="sm" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          Kirim Sekarang
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={loading} className="w-full text-text-muted">
          Batal
        </Button>
      </div>
    </form>
  );
}
