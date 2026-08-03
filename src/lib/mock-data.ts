export const mockStores = [
  {
    _id: "store_1",
    slug: "bumdes-maju-bersama",
    name: "BUMDes Maju Bersama",
    description: "BUMDes terbaik dari Desa Sukamaju yang menyediakan hasil bumi berkualitas tinggi dan berbagai olahan makanan khas daerah.",
    logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200",
    bannerUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
    village: "Desa Sukamaju",
    district: "Kec. Maju",
    regency: "Kab. Bandung",
    province: "Jawa Barat",
    businessType: "Pertanian & Perdagangan",
  },
  {
    _id: "store_2",
    slug: "bumdes-karya-mandiri",
    name: "BUMDes Karya Mandiri",
    description: "Pusat kerajinan tangan lokal dan bahan baku furnitur organik.",
    logoUrl: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=200",
    bannerUrl: "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&q=80&w=1200",
    village: "Desa Karya",
    district: "Kec. Mandiri",
    regency: "Kab. Gianyar",
    province: "Bali",
    businessType: "Kerajinan Kriya",
  }
];

export const mockProducts = [
  {
    _id: "prod_1",
    slug: "beras-organik-premium",
    name: "Beras Organik Premium (Pandan Wangi)",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600"],
    isWholesaleAvailable: true,
    retailPrice: 15000,
    unit: "Kg",
    minOrder: 50,
    locationText: "Kab. Bandung, Jawa Barat",
    categoryId: { name: "Pertanian", slug: "pertanian" },
    storeId: { name: "BUMDes Maju Bersama", slug: "bumdes-maju-bersama" },
  },
  {
    _id: "prod_2",
    slug: "kopi-robusta-asli",
    name: "Biji Kopi Robusta Asli Pegunungan",
    images: ["https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=600"],
    isWholesaleAvailable: true,
    retailPrice: 45000,
    unit: "Kg",
    minOrder: 10,
    locationText: "Kab. Gianyar, Bali",
    categoryId: { name: "Perkebunan", slug: "perkebunan" },
    storeId: { name: "BUMDes Karya Mandiri", slug: "bumdes-karya-mandiri" },
  },
  {
    _id: "prod_3",
    slug: "kerajinan-anyaman-bambu",
    name: "Keranjang Anyaman Bambu Tradisional",
    images: ["https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=600"],
    isWholesaleAvailable: false,
    retailPrice: 35000,
    unit: "Pcs",
    minOrder: 5,
    locationText: "Kab. Gianyar, Bali",
    categoryId: { name: "Kerajinan", slug: "kerajinan" },
    storeId: { name: "BUMDes Karya Mandiri", slug: "bumdes-karya-mandiri" },
  },
  {
    _id: "prod_4",
    slug: "gula-aren-cair",
    name: "Gula Aren Cair 1 Liter Asli",
    images: ["https://images.unsplash.com/photo-1589367920969-ab8e050bfc60?auto=format&fit=crop&q=80&w=600"],
    isWholesaleAvailable: true,
    retailPrice: 25000,
    unit: "Botol",
    minOrder: 20,
    locationText: "Kab. Bandung, Jawa Barat",
    categoryId: { name: "Olahan Pangan", slug: "olahan-pangan" },
    storeId: { name: "BUMDes Maju Bersama", slug: "bumdes-maju-bersama" },
  }
];

export const mockOrders = [
  {
    id: "ORD-202608-001",
    customer: "Koperasi Tani Sukses",
    date: "2026-08-01",
    total: 3000000,
    status: "SELESAI",
    items: "Beras Organik Premium (200 Kg)",
  },
  {
    id: "ORD-202608-002",
    customer: "Warung Kopi Nusantara",
    date: "2026-08-02",
    total: 450000,
    status: "DIPROSES",
    items: "Biji Kopi Robusta (10 Kg)",
  },
  {
    id: "ORD-202608-003",
    customer: "BUMDes Sejahtera",
    date: "2026-08-03",
    total: 1250000,
    status: "MENUNGGU_PEMBAYARAN",
    items: "Gula Aren Cair (50 Botol)",
  }
];

export const mockStats = {
  totalRevenue: 45000000,
  activeProducts: 45,
  totalOrders: 128,
  pendingOrders: 5
};
