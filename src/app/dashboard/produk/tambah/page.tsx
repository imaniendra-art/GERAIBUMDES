"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Trash2, ChevronLeft } from "lucide-react";

export default function TambahProdukPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);

  useEffect(() => {
    // Fetch categories on load
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    retailPrice: "",
    unit: "kg",
    minOrder: "1",
    stock: "0",
    locationText: "",
    shippingNotes: "",
    imageUrl: "",
    isWholesaleAvailable: false,
    wholesalePriceTiers: [{ minQty: 10, maxQty: "", price: "" }]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleTierChange = (index: number, field: string, value: string) => {
    const newTiers = [...formData.wholesalePriceTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setFormData({ ...formData, wholesalePriceTiers: newTiers });
  };

  const addTier = () => {
    if (formData.wholesalePriceTiers.length < 5) {
      setFormData({
        ...formData,
        wholesalePriceTiers: [...formData.wholesalePriceTiers, { minQty: 0, maxQty: "", price: "" }]
      });
    }
  };

  const removeTier = (index: number) => {
    const newTiers = formData.wholesalePriceTiers.filter((_, i) => i !== index);
    setFormData({ ...formData, wholesalePriceTiers: newTiers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        retailPrice: Number(formData.retailPrice),
        minOrder: Number(formData.minOrder),
        stock: Number(formData.stock),
        images: formData.imageUrl ? [formData.imageUrl] : [],
        wholesalePriceTiers: formData.isWholesaleAvailable 
          ? formData.wholesalePriceTiers.map(t => ({
              minQty: Number(t.minQty),
              maxQty: t.maxQty ? Number(t.maxQty) : undefined,
              price: Number(t.price)
            }))
          : []
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan produk.");
      } else {
        router.push("/dashboard/produk");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-24 py-8">
      <div className="mb-6">
        <Link href="/dashboard/produk">
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border hover:bg-surface-bg hover:text-text-main h-10 py-2 px-4 bg-surface text-text-main">
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Produk
          </span>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-main">Tambah Produk Baru</h1>
      </div>

      {error && (
        <div className="mb-4 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-bold border-b pb-2">Informasi Dasar</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Nama Produk *</label>
                <input name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-surface" placeholder="Contoh: Beras Premium Sidrap" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Kategori *</label>
                <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-surface">
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL Gambar (Opsional)</label>
                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-surface" placeholder="https://example.com/image.jpg" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Deskripsi Produk *</label>
                <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-surface" />
              </div>
            </div>

            <h3 className="text-lg font-bold border-b pb-2 pt-4">Harga & Stok</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Harga Eceran (Rp) *</label>
                <input name="retailPrice" type="number" min="1" required value={formData.retailPrice} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-surface" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimal Order *</label>
                <input name="minOrder" type="number" min="1" required value={formData.minOrder} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-surface" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Satuan *</label>
                <select name="unit" required value={formData.unit} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-surface">
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gram">Gram</option>
                  <option value="liter">Liter</option>
                  <option value="pcs">Pcs / Buah</option>
                  <option value="karung">Karung</option>
                  <option value="kardus">Kardus / Dus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stok Tersedia *</label>
                <input name="stock" type="number" min="0" required value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-surface" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Lokasi Produk (Teks) *</label>
                <input name="locationText" required value={formData.locationText} onChange={handleChange} className="w-full px-3 py-2 border rounded bg-surface" placeholder="Contoh: Gudang BUMDes Sidrap" />
              </div>
            </div>

            <h3 className="text-lg font-bold border-b pb-2 pt-4">Harga Grosir (Opsional)</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="isWholesaleAvailable" checked={formData.isWholesaleAvailable} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Tersedia Harga Grosir Bertingkat untuk BUMDes Pembeli</span>
              </label>

              {formData.isWholesaleAvailable && (
                <div className="bg-surface-bg p-4 rounded-md border border-border">
                  <p className="text-xs text-text-muted mb-4">Tambahkan hingga 5 tingkatan harga grosir. Kosongkan &quot;Max Qty&quot; untuk tier tertinggi (contoh: 50+ pcs).</p>
                  
                  {formData.wholesalePriceTiers.map((tier, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end mb-3 pb-3 border-b border-border last:border-0">
                      <div className="flex-1 min-w-[100px]">
                        <label className="block text-xs font-medium mb-1">Min Qty *</label>
                        <input type="number" required min="1" value={tier.minQty} onChange={(e) => handleTierChange(index, "minQty", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded bg-surface" />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <label className="block text-xs font-medium mb-1">Max Qty</label>
                        <input type="number" value={tier.maxQty} onChange={(e) => handleTierChange(index, "maxQty", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded bg-surface" placeholder="Tak Terhingga" />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-medium mb-1">Harga Satuan (Rp) *</label>
                        <input type="number" required min="1" value={tier.price} onChange={(e) => handleTierChange(index, "price", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded bg-surface" />
                      </div>
                      {formData.wholesalePriceTiers.length > 1 && (
                        <button type="button" onClick={() => removeTier(index)} className="p-2 text-danger hover:bg-danger/10 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {formData.wholesalePriceTiers.length < 5 && (
                    <Button type="button" variant="outline" size="sm" onClick={addTier} className="mt-2 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Tambah Tier
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Produk & Ajukan Verifikasi"}
              </Button>
              <p className="text-xs text-center text-text-muted mt-3">Produk baru harus disetujui oleh Admin sebelum tampil di Marketplace.</p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
