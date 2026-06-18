"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MasterWilayahPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    provinceCode: "",
    provinceName: "",
    regencyCode: "",
    regencyName: "",
    districtCode: "",
    districtName: "",
    villageCode: "",
    villageName: "",
    sortOrder: 0,
    isActive: true,
  });

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/regions?admin=true");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching items", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenForm = (item?: any) => {
    if (item) {
      setEditingId(item._id);
      setFormData({
        provinceCode: item.provinceCode || "",
        provinceName: item.provinceName || item.province || "",
        regencyCode: item.regencyCode || "",
        regencyName: item.regencyName || item.regency || "",
        districtCode: item.districtCode || "",
        districtName: item.districtName || item.district || "",
        villageCode: item.villageCode || "",
        villageName: item.villageName || item.village || "",
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive !== undefined ? item.isActive : true,
      });
    } else {
      setEditingId(null);
      setFormData({ 
        provinceCode: "", provinceName: "", 
        regencyCode: "", regencyName: "", 
        districtCode: "", districtName: "", 
        villageCode: "", villageName: "", 
        sortOrder: 0, isActive: true 
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/regions/${editingId}` : "/api/regions";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        handleCloseForm();
        fetchItems();
      } else {
        const error = await res.json();
        alert(error.error || "Terjadi kesalahan");
      }
    } catch (error) {
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus wilayah ini?")) return;
    try {
      const res = await fetch(`/api/regions/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchItems();
      } else {
        alert("Gagal menghapus data");
      }
    } catch (error) {
      alert("Gagal menghapus data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Master Wilayah Sederhana</h1>
          <p className="text-text-muted">Kelola data wilayah operasional BUMDes.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Tambah Wilayah
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-bg border-b border-border">
                <tr>
                  <th className="p-4 font-semibold text-text-main">No</th>
                  <th className="p-4 font-semibold text-text-main">Provinsi</th>
                  <th className="p-4 font-semibold text-text-main">Kabupaten/Kota</th>
                  <th className="p-4 font-semibold text-text-main">Kecamatan</th>
                  <th className="p-4 font-semibold text-text-main">Desa/Kel.</th>
                  <th className="p-4 font-semibold text-text-main">Status</th>
                  <th className="p-4 font-semibold text-text-main text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-muted">Memuat data...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <EmptyState 
                        title="Tidak Ada Wilayah" 
                        description="Belum ada data wilayah." 
                        icon="database" 
                        className="border-0 rounded-none bg-transparent py-12"
                      />
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item._id} className="border-b border-border hover:bg-surface-bg/50">
                      <td className="p-4">{index + 1}</td>
                      <td className="p-4 font-medium text-text-main">{item.provinceName || item.province} <br/><span className="text-xs text-text-muted">{item.provinceCode}</span></td>
                      <td className="p-4 text-text-main">{item.regencyName || item.regency} <br/><span className="text-xs text-text-muted">{item.regencyCode}</span></td>
                      <td className="p-4 text-text-muted">{item.districtName || item.district || "-"} <br/><span className="text-xs text-text-muted">{item.districtCode}</span></td>
                      <td className="p-4 text-text-muted">{item.villageName || item.village || "-"} <br/><span className="text-xs text-text-muted">{item.villageCode}</span></td>
                      <td className="p-4">
                        <Badge variant={item.isActive ? "success" : "danger"}>
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenForm(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-danger border-danger hover:bg-danger/10" onClick={() => handleDelete(item._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">{editingId ? "Edit Wilayah" : "Tambah Wilayah"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kode Provinsi</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={formData.provinceCode} onChange={(e) => setFormData({ ...formData, provinceCode: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Provinsi *</label>
                  <input required type="text" className="w-full border rounded px-3 py-2 text-sm" value={formData.provinceName} onChange={(e) => setFormData({ ...formData, provinceName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kode Kab/Kota</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={formData.regencyCode} onChange={(e) => setFormData({ ...formData, regencyCode: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Kab/Kota *</label>
                  <input required type="text" className="w-full border rounded px-3 py-2 text-sm" value={formData.regencyName} onChange={(e) => setFormData({ ...formData, regencyName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kode Kecamatan</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={formData.districtCode} onChange={(e) => setFormData({ ...formData, districtCode: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Kecamatan</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={formData.districtName} onChange={(e) => setFormData({ ...formData, districtName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kode Desa</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={formData.villageCode} onChange={(e) => setFormData({ ...formData, villageCode: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Desa</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={formData.villageName} onChange={(e) => setFormData({ ...formData, villageName: e.target.value })} />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Urutan</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={handleCloseForm}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
