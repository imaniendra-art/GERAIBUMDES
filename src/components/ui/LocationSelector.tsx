"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Option {
  code: string;
  name: string;
}

interface LocationSelectorProps {
  onLocationChange: (location: {
    provinceCode?: string;
    provinceName?: string;
    regencyCode?: string;
    regencyName?: string;
    districtCode?: string;
    districtName?: string;
    villageCode?: string;
    villageName?: string;
  }) => void;
  initialProvinceCode?: string;
  initialRegencyCode?: string;
  initialDistrictCode?: string;
  initialVillageCode?: string;
  className?: string;
  layout?: "vertical" | "horizontal";
}

export function LocationSelector({
  onLocationChange,
  initialProvinceCode,
  initialRegencyCode,
  initialDistrictCode,
  initialVillageCode,
  className = "",
  layout = "vertical"
}: LocationSelectorProps) {
  
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [regencies, setRegencies] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);

  const [loading, setLoading] = useState({
    province: true,
    regency: false,
    district: false,
    village: false,
  });

  const [selected, setSelected] = useState({
    provinceCode: initialProvinceCode || "",
    regencyCode: initialRegencyCode || "",
    districtCode: initialDistrictCode || "",
    villageCode: initialVillageCode || "",
  });

  useEffect(() => {
    fetchOptions("province").then(data => {
      setProvinces(data);
      setLoading(prev => ({ ...prev, province: false }));
    });
  }, []);

  useEffect(() => {
    if (selected.provinceCode) {
      setLoading(prev => ({ ...prev, regency: true }));
      fetchOptions("regency", `provinceCode=${selected.provinceCode}`).then(data => {
        setRegencies(data);
        setLoading(prev => ({ ...prev, regency: false }));
      });
    } else {
      setRegencies([]);
    }
  }, [selected.provinceCode]);

  useEffect(() => {
    if (selected.regencyCode) {
      setLoading(prev => ({ ...prev, district: true }));
      fetchOptions("district", `regencyCode=${selected.regencyCode}`).then(data => {
        setDistricts(data);
        setLoading(prev => ({ ...prev, district: false }));
      });
    } else {
      setDistricts([]);
    }
  }, [selected.regencyCode]);

  useEffect(() => {
    if (selected.districtCode) {
      setLoading(prev => ({ ...prev, village: true }));
      fetchOptions("village", `districtCode=${selected.districtCode}`).then(data => {
        setVillages(data);
        setLoading(prev => ({ ...prev, village: false }));
      });
    } else {
      setVillages([]);
    }
  }, [selected.districtCode]);

  const fetchOptions = async (level: string, params = "") => {
    try {
      const res = await fetch(`/api/regions/options?level=${level}&${params}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const handleChange = (level: "province" | "regency" | "district" | "village", value: string) => {
    const newSelected = { ...selected };
    
    // Find the name for the selected code
    let selectedName = "";

    if (level === "province") {
      newSelected.provinceCode = value;
      newSelected.regencyCode = "";
      newSelected.districtCode = "";
      newSelected.villageCode = "";
      selectedName = provinces.find(p => p.code === value)?.name || "";
    } else if (level === "regency") {
      newSelected.regencyCode = value;
      newSelected.districtCode = "";
      newSelected.villageCode = "";
      selectedName = regencies.find(p => p.code === value)?.name || "";
    } else if (level === "district") {
      newSelected.districtCode = value;
      newSelected.villageCode = "";
      selectedName = districts.find(p => p.code === value)?.name || "";
    } else if (level === "village") {
      newSelected.villageCode = value;
      selectedName = villages.find(p => p.code === value)?.name || "";
    }

    setSelected(newSelected);

    // Build the full location object to pass up
    const location: any = {
      provinceCode: newSelected.provinceCode,
      provinceName: provinces.find(p => p.code === newSelected.provinceCode)?.name || "",
      regencyCode: newSelected.regencyCode,
      regencyName: regencies.find(p => p.code === newSelected.regencyCode)?.name || "",
      districtCode: newSelected.districtCode,
      districtName: districts.find(p => p.code === newSelected.districtCode)?.name || "",
      villageCode: newSelected.villageCode,
      villageName: villages.find(p => p.code === newSelected.villageCode)?.name || "",
    };

    onLocationChange(location);
  };

  const gridClass = layout === "horizontal" 
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" 
    : "flex flex-col gap-4";

  return (
    <div className={`${gridClass} ${className}`}>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-main">Provinsi</label>
        <div className="relative">
          <select 
            className="w-full h-11 px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 appearance-none text-text-main"
            value={selected.provinceCode}
            onChange={(e) => handleChange("province", e.target.value)}
            disabled={loading.province || provinces.length === 0}
            required
          >
            <option value="">Pilih Provinsi</option>
            {provinces.map(p => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
          {loading.province && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-text-muted" />}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-main">Kabupaten/Kota</label>
        <div className="relative">
          <select 
            className="w-full h-11 px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 appearance-none text-text-main"
            value={selected.regencyCode}
            onChange={(e) => handleChange("regency", e.target.value)}
            disabled={!selected.provinceCode || loading.regency || regencies.length === 0}
            required
          >
            <option value="">Pilih Kabupaten/Kota</option>
            {regencies.map(r => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
          {loading.regency && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-text-muted" />}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-main">Kecamatan</label>
        <div className="relative">
          <select 
            className="w-full h-11 px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 appearance-none text-text-main"
            value={selected.districtCode}
            onChange={(e) => handleChange("district", e.target.value)}
            disabled={!selected.regencyCode || loading.district || districts.length === 0}
            required
          >
            <option value="">Pilih Kecamatan</option>
            {districts.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
          {loading.district && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-text-muted" />}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-main">Desa/Kelurahan</label>
        <div className="relative">
          <select 
            className="w-full h-11 px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 appearance-none text-text-main"
            value={selected.villageCode}
            onChange={(e) => handleChange("village", e.target.value)}
            disabled={!selected.districtCode || loading.village || villages.length === 0}
            required
          >
            <option value="">Pilih Desa/Kelurahan</option>
            {villages.map(v => (
              <option key={v.code} value={v.code}>{v.name}</option>
            ))}
          </select>
          {loading.village && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-text-muted" />}
        </div>
      </div>
    </div>
  );
}
