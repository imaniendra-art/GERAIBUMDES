import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import BumdesProfile from "../src/models/BumdesProfile";
import Store from "../src/models/Store";
import Category from "../src/models/Category";
import Product from "../src/models/Product";
import Order from "../src/models/Order";
import BusinessType from "../src/models/BusinessType";
import Region from "../src/models/Region";

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await BumdesProfile.deleteMany({});
    await Store.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await BusinessType.deleteMany({});
    await Region.deleteMany({});

    console.log("Creating SUPER_ADMIN...");
    const superAdminPassword = await bcrypt.hash("admin123", 10);
    const superAdmin = await User.create({
      name: "Super Admin",
      email: "admin@geraibumdes.com",
      phoneNumber: "080000000000",
      passwordHash: superAdminPassword,
      role: "SUPER_ADMIN",
    });

    console.log("Creating Categories...");
    const categoriesData = [
      { name: "Pertanian", slug: "pertanian", description: "Hasil bumi pertanian", sortOrder: 1 },
      { name: "Perikanan", slug: "perikanan", description: "Hasil perikanan laut dan tawar", sortOrder: 2 },
      { name: "Peternakan", slug: "peternakan", description: "Hasil peternakan", sortOrder: 3 },
      { name: "Sembako dan Kebutuhan Pokok", slug: "sembako", description: "Kebutuhan pokok sembako", sortOrder: 4 },
      { name: "Produk Olahan Desa", slug: "produk-olahan", description: "Produk olahan kemasan", sortOrder: 5 },
      { name: "Kerajinan Desa", slug: "kerajinan", description: "Kerajinan tangan lokal", sortOrder: 6 },
      { name: "Perkebunan", slug: "perkebunan", description: "Hasil perkebunan desa", sortOrder: 7 },
      { name: "Bahan Bangunan", slug: "bahan-bangunan", description: "Material alam dan bangunan", sortOrder: 8 },
      { name: "Alat Pertanian", slug: "alat-pertanian", description: "Alat bantu tani", sortOrder: 9 },
      { name: "Jasa Desa", slug: "jasa", description: "Layanan jasa BUMDes", sortOrder: 10 },
    ];
    const categories = await Category.insertMany(categoriesData);
    const catMap = categories.reduce((acc: any, cat: any) => {
      acc[cat.slug] = cat._id;
      return acc;
    }, {});

    console.log("Creating Business Types...");
    const businessTypesData = [
      { name: "Pertanian", slug: "pertanian", sortOrder: 1 },
      { name: "Perikanan", slug: "perikanan", sortOrder: 2 },
      { name: "Peternakan", slug: "peternakan", sortOrder: 3 },
      { name: "Sembako dan Kebutuhan Pokok", slug: "sembako", sortOrder: 4 },
      { name: "Produk Olahan Desa", slug: "produk-olahan", sortOrder: 5 },
      { name: "Perkebunan", slug: "perkebunan", sortOrder: 6 },
      { name: "Perdagangan Umum", slug: "perdagangan-umum", sortOrder: 7 },
      { name: "Jasa Desa", slug: "jasa-desa", sortOrder: 8 },
      { name: "Kerajinan Desa", slug: "kerajinan-desa", sortOrder: 9 }
    ];
    await BusinessType.insertMany(businessTypesData);

    console.log("Creating Regions...");
    const regionsData = [
      { province: "Sulawesi Selatan", regency: "Sidrap", sortOrder: 1 },
      { province: "Sulawesi Selatan", regency: "Gowa", sortOrder: 2 },
      { province: "Sulawesi Selatan", regency: "Maros", sortOrder: 3 },
      { province: "Sulawesi Selatan", regency: "Pinrang", sortOrder: 4 },
      { province: "Sulawesi Tengah", regency: "Parigi Moutong", sortOrder: 5 },
      { province: "Kalimantan Selatan", regency: "Kotabaru", sortOrder: 6 },
    ];
    await Region.insertMany(regionsData);

    console.log("Creating Dummy BUMDes...");
    const bumdesPassword = await bcrypt.hash("bumdes123", 10);

    const dummyBumdes = [
      // 1. Sidrap Maju
      {
        user: { name: "Pengelola Sidrap", email: "sidrap@bumdes.id" },
        profile: {
          name: "BUMDes Sidrap Maju",
          village: "Tanete", district: "Maritengngae", cityOrRegency: "Sidrap", regency: "Sidrap", province: "Sulawesi Selatan",
          businessType: "Pertanian dan Sembako", description: "Pusat pasokan beras dan sembako Sidrap.",
          verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedBy: superAdmin._id
        },
        store: { 
          name: "BUMDes Sidrap Maju", slug: "bumdes-sidrap-maju", status: "ACTIVE",
          bankAccount: { bankName: "BRI", bankAccountNumber: "1234567890", bankAccountHolderName: "BUMDes Sidrap Maju" }
        },
        products: [
          { name: "Beras Premium Sidrap", slug: "beras-premium-sidrap", categoryId: catMap["sembako"], retailPrice: 14000, minOrder: 5, unit: "karung", stock: 1000, locationText: "Tanete, Sidrap", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: 20, price: 13500 }, { minQty: 21, maxQty: null, price: 13000 }] },
          { name: "Beras Medium Sidrap", slug: "beras-medium-sidrap", categoryId: catMap["sembako"], retailPrice: 12000, minOrder: 5, unit: "karung", stock: 2000, locationText: "Tanete, Sidrap", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: 50, price: 11500 }, { minQty: 51, maxQty: null, price: 11000 }] },
          { name: "Beras Kepala Super", slug: "beras-kepala-super", categoryId: catMap["sembako"], retailPrice: 15000, minOrder: 5, unit: "karung", stock: 500, locationText: "Tanete, Sidrap", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: null, price: 14500 }] },
          { name: "Gabah Kering Panen", slug: "gabah-kering-panen", categoryId: catMap["pertanian"], retailPrice: 7000, minOrder: 10, unit: "karung", stock: 5000, locationText: "Tanete, Sidrap", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: 100, price: 6800 }, { minQty: 101, maxQty: null, price: 6500 }] },
          { name: "Dedak Padi", slug: "dedak-padi", categoryId: catMap["peternakan"], retailPrice: 3000, minOrder: 10, unit: "karung", stock: 3000, locationText: "Tanete, Sidrap", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Telur Ayam Ras Sidrap", slug: "telur-ayam-ras-sidrap", categoryId: catMap["peternakan"], retailPrice: 50000, minOrder: 5, unit: "rak", stock: 500, locationText: "Tanete, Sidrap", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Paket Sembako Beras", slug: "paket-sembako-beras", categoryId: catMap["sembako"], retailPrice: 100000, minOrder: 5, unit: "paket", stock: 200, locationText: "Tanete, Sidrap", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: null, price: 95000 }] }
        ]
      },
      // 2. Gowa Sejahtera
      {
        user: { name: "Pengelola Gowa", email: "gowa@bumdes.id" },
        profile: {
          name: "BUMDes Gowa Sejahtera",
          village: "Taeng", district: "Pallangga", cityOrRegency: "Gowa", regency: "Gowa", province: "Sulawesi Selatan",
          businessType: "Pertanian dan Produk Olahan Desa", description: "Hasil bumi segar dan olahan langsung dari Gowa.",
          verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedBy: superAdmin._id
        },
        store: { 
          name: "BUMDes Gowa Sejahtera", slug: "bumdes-gowa-sejahtera", status: "ACTIVE",
          bankAccount: { bankName: "Bank Sulselbar", bankAccountNumber: "2345678901", bankAccountHolderName: "BUMDes Gowa Sejahtera" }
        },
        products: [
          { name: "Sayur Segar Gowa", slug: "sayur-segar-gowa", categoryId: catMap["pertanian"], retailPrice: 15000, minOrder: 5, unit: "kg", stock: 100, locationText: "Taeng, Gowa", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: null, price: 14000 }] },
          { name: "Cabai Rawit Segar", slug: "cabai-rawit-segar", categoryId: catMap["pertanian"], retailPrice: 40000, minOrder: 5, unit: "kg", stock: 50, locationText: "Taeng, Gowa", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: null, price: 38000 }] },
          { name: "Pisang Kepok", slug: "pisang-kepok", categoryId: catMap["pertanian"], retailPrice: 20000, minOrder: 5, unit: "tandan", stock: 100, locationText: "Taeng, Gowa", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: null, price: 18000 }] },
          { name: "Keripik Pisang Gowa", slug: "keripik-pisang-gowa", categoryId: catMap["produk-olahan"], retailPrice: 15000, minOrder: 1, unit: "pcs", stock: 200, locationText: "Taeng, Gowa", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Gula Merah Aren", slug: "gula-merah-aren", categoryId: catMap["produk-olahan"], retailPrice: 25000, minOrder: 1, unit: "kg", stock: 100, locationText: "Taeng, Gowa", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Jahe Merah", slug: "jahe-merah", categoryId: catMap["pertanian"], retailPrice: 30000, minOrder: 1, unit: "kg", stock: 150, locationText: "Taeng, Gowa", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Paket Sayur Harian", slug: "paket-sayur-harian", categoryId: catMap["pertanian"], retailPrice: 50000, minOrder: 5, unit: "paket", stock: 50, locationText: "Taeng, Gowa", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: null, price: 45000 }] }
        ]
      },
      // 3. Maros Mandiri
      {
        user: { name: "Pengelola Maros", email: "maros@bumdes.id" },
        profile: {
          name: "BUMDes Maros Mandiri",
          village: "Moncongloe", district: "Moncongloe", cityOrRegency: "Maros", regency: "Maros", province: "Sulawesi Selatan",
          businessType: "Produk Olahan Desa", description: "Pusat jajanan dan olahan sehat khas Maros.",
          verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedBy: superAdmin._id
        },
        store: { 
          name: "BUMDes Maros Mandiri", slug: "bumdes-maros-mandiri", status: "ACTIVE",
          bankAccount: { bankName: "BNI", bankAccountNumber: "3456789012", bankAccountHolderName: "BUMDes Maros Mandiri" }
        },
        products: [
          { name: "Keripik Pisang Maros", slug: "keripik-pisang-maros", categoryId: catMap["produk-olahan"], retailPrice: 12000, minOrder: 5, unit: "pcs", stock: 500, locationText: "Moncongloe, Maros", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: null, price: 10000 }] },
          { name: "Abon Ikan", slug: "abon-ikan", categoryId: catMap["produk-olahan"], retailPrice: 35000, minOrder: 5, unit: "pcs", stock: 200, locationText: "Moncongloe, Maros", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: null, price: 32000 }] },
          { name: "Kue Tradisional Kemasan", slug: "kue-tradisional-kemasan", categoryId: catMap["produk-olahan"], retailPrice: 20000, minOrder: 5, unit: "pcs", stock: 300, locationText: "Moncongloe, Maros", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Madu Hutan Maros", slug: "madu-hutan-maros", categoryId: catMap["produk-olahan"], retailPrice: 85000, minOrder: 1, unit: "botol", stock: 100, locationText: "Moncongloe, Maros", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Beras Kemasan 5 Kg", slug: "beras-kemasan-5kg-maros", categoryId: catMap["sembako"], retailPrice: 65000, minOrder: 5, unit: "pak", stock: 200, locationText: "Moncongloe, Maros", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: null, price: 62000 }] },
          { name: "Kerupuk Udang", slug: "kerupuk-udang", categoryId: catMap["produk-olahan"], retailPrice: 15000, minOrder: 5, unit: "pcs", stock: 400, locationText: "Moncongloe, Maros", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Minyak Kelapa Desa", slug: "minyak-kelapa-desa", categoryId: catMap["produk-olahan"], retailPrice: 25000, minOrder: 5, unit: "botol", stock: 150, locationText: "Moncongloe, Maros", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: null, price: 23000 }] }
        ]
      },
      // 4. Pinrang Berdaya
      {
        user: { name: "Pengelola Pinrang", email: "pinrang@bumdes.id" },
        profile: {
          name: "BUMDes Pinrang Berdaya",
          village: "Mattiro Ade", district: "Patampanua", cityOrRegency: "Pinrang", regency: "Pinrang", province: "Sulawesi Selatan",
          businessType: "Pertanian dan Perikanan", description: "Menyediakan hasil laut dan bumi dari Pinrang.",
          verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedBy: superAdmin._id
        },
        store: { 
          name: "BUMDes Pinrang Berdaya", slug: "bumdes-pinrang-berdaya", status: "ACTIVE",
          bankAccount: { bankName: "Mandiri", bankAccountNumber: "4567890123", bankAccountHolderName: "BUMDes Pinrang Berdaya" }
        },
        products: [
          { name: "Beras Pinrang", slug: "beras-pinrang", categoryId: catMap["sembako"], retailPrice: 13500, minOrder: 5, unit: "karung", stock: 1000, locationText: "Mattiro Ade, Pinrang", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: 50, price: 13000 }, { minQty: 51, maxQty: null, price: 12500 }] },
          { name: "Jagung Pipil Kering", slug: "jagung-pipil-kering", categoryId: catMap["pertanian"], retailPrice: 5000, minOrder: 10, unit: "karung", stock: 2000, locationText: "Mattiro Ade, Pinrang", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: 100, price: 4800 }, { minQty: 101, maxQty: null, price: 4500 }] },
          { name: "Telur Ayam Ras", slug: "telur-ayam-ras-pinrang", categoryId: catMap["peternakan"], retailPrice: 48000, minOrder: 5, unit: "rak", stock: 300, locationText: "Mattiro Ade, Pinrang", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Ikan Kering", slug: "ikan-kering-pinrang", categoryId: catMap["perikanan"], retailPrice: 60000, minOrder: 10, unit: "kg", stock: 500, locationText: "Mattiro Ade, Pinrang", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: null, price: 55000 }] },
          { name: "Pupuk Kompos Desa", slug: "pupuk-kompos-desa", categoryId: catMap["pertanian"], retailPrice: 20000, minOrder: 1, unit: "karung", stock: 1000, locationText: "Mattiro Ade, Pinrang", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Gabah Kering", slug: "gabah-kering-pinrang", categoryId: catMap["pertanian"], retailPrice: 6500, minOrder: 10, unit: "karung", stock: 3000, locationText: "Mattiro Ade, Pinrang", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: 100, price: 6300 }, { minQty: 101, maxQty: null, price: 6000 }] },
          { name: "Paket Pangan Desa", slug: "paket-pangan-desa", categoryId: catMap["sembako"], retailPrice: 80000, minOrder: 5, unit: "paket", stock: 100, locationText: "Mattiro Ade, Pinrang", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: null, price: 75000 }] }
        ]
      },
      // 5. Parigi Makmur
      {
        user: { name: "Pengelola Parigi", email: "parigi@bumdes.id" },
        profile: {
          name: "BUMDes Parigi Makmur",
          village: "Sumber Sari", district: "Parigi", cityOrRegency: "Parigi Moutong", regency: "Parigi Moutong", province: "Sulawesi Tengah",
          businessType: "Perkebunan dan Perdagangan Umum", description: "Menyediakan hasil bumi perkebunan Parigi Moutong.",
          verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedBy: superAdmin._id
        },
        store: { 
          name: "BUMDes Parigi Makmur", slug: "bumdes-parigi-makmur", status: "ACTIVE",
          bankAccount: { bankName: "BSI", bankAccountNumber: "5678901234", bankAccountHolderName: "BUMDes Parigi Makmur" }
        },
        products: [
          { name: "Kopra Kering", slug: "kopra-kering", categoryId: catMap["perkebunan"], retailPrice: 10000, minOrder: 10, unit: "kg", stock: 5000, locationText: "Sumber Sari, Parigi", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: 100, price: 9500 }, { minQty: 101, maxQty: null, price: 9000 }] },
          { name: "Cengkeh Kering", slug: "cengkeh-kering", categoryId: catMap["perkebunan"], retailPrice: 120000, minOrder: 10, unit: "kg", stock: 1000, locationText: "Sumber Sari, Parigi", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: 50, price: 115000 }, { minQty: 51, maxQty: null, price: 110000 }] },
          { name: "Kakao Fermentasi", slug: "kakao-fermentasi", categoryId: catMap["perkebunan"], retailPrice: 45000, minOrder: 10, unit: "kg", stock: 2000, locationText: "Sumber Sari, Parigi", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: 100, price: 43000 }, { minQty: 101, maxQty: null, price: 40000 }] },
          { name: "Minyak Kelapa Desa", slug: "minyak-kelapa-desa-parigi", categoryId: catMap["produk-olahan"], retailPrice: 24000, minOrder: 1, unit: "botol", stock: 500, locationText: "Sumber Sari, Parigi", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Paket Sembako Desa", slug: "paket-sembako-desa-parigi", categoryId: catMap["sembako"], retailPrice: 120000, minOrder: 5, unit: "paket", stock: 100, locationText: "Sumber Sari, Parigi", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: null, price: 110000 }] },
          { name: "Pisang Olahan Parigi", slug: "pisang-olahan-parigi", categoryId: catMap["produk-olahan"], retailPrice: 15000, minOrder: 1, unit: "pcs", stock: 200, locationText: "Sumber Sari, Parigi", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Gula Kelapa", slug: "gula-kelapa-parigi", categoryId: catMap["produk-olahan"], retailPrice: 20000, minOrder: 5, unit: "kg", stock: 300, locationText: "Sumber Sari, Parigi", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: null, price: 18000 }] },
          { name: "Kopi Bubuk Desa", slug: "kopi-bubuk-desa", categoryId: catMap["produk-olahan"], retailPrice: 50000, minOrder: 1, unit: "kg", stock: 100, locationText: "Sumber Sari, Parigi", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] }
        ]
      },
      // 6. Pulau Laut Sigam Bersama
      {
        user: { name: "Pengelola Pulau Laut", email: "pulaulaut@bumdes.id" },
        profile: {
          name: "BUMDes Pulau Laut Sigam Bersama",
          village: "Hilir Muara", district: "Pulau Laut Sigam", cityOrRegency: "Kotabaru", regency: "Kotabaru", province: "Kalimantan Selatan",
          businessType: "Perdagangan Umum dan Perikanan", description: "Penyedia hasil laut Pesisir Kotabaru.",
          verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedBy: superAdmin._id
        },
        store: { 
          name: "BUMDes Pulau Laut Sigam Bersama", slug: "bumdes-pulau-laut-sigam", status: "ACTIVE",
          bankAccount: { bankName: "Bank Kalsel", bankAccountNumber: "6789012345", bankAccountHolderName: "BUMDes Pulau Laut Sigam Bersama" }
        },
        products: [
          { name: "Ikan Asin Laut", slug: "ikan-asin-laut", categoryId: catMap["perikanan"], retailPrice: 50000, minOrder: 10, unit: "kg", stock: 1000, locationText: "Hilir Muara, Kotabaru", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: 50, price: 48000 }, { minQty: 51, maxQty: null, price: 45000 }] },
          { name: "Udang Kering", slug: "udang-kering", categoryId: catMap["perikanan"], retailPrice: 120000, minOrder: 10, unit: "kg", stock: 500, locationText: "Hilir Muara, Kotabaru", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: 50, price: 115000 }, { minQty: 51, maxQty: null, price: 110000 }] },
          { name: "Kerupuk Ikan", slug: "kerupuk-ikan-sigam", categoryId: catMap["produk-olahan"], retailPrice: 20000, minOrder: 5, unit: "pcs", stock: 300, locationText: "Hilir Muara, Kotabaru", status: "ACTIVE", isWholesaleAvailable: false, wholesalePriceTiers: [] },
          { name: "Paket Sembako Pesisir", slug: "paket-sembako-pesisir", categoryId: catMap["sembako"], retailPrice: 150000, minOrder: 5, unit: "paket", stock: 100, locationText: "Hilir Muara, Kotabaru", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 5, maxQty: null, price: 140000 }] },
          { name: "Air Minum Galon Desa", slug: "air-minum-galon-desa", categoryId: catMap["sembako"], retailPrice: 18000, minOrder: 5, unit: "galon", stock: 200, locationText: "Hilir Muara, Kotabaru", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: null, price: 15000 }] },
          { name: "Rumput Laut Kering", slug: "rumput-laut-kering", categoryId: catMap["perikanan"], retailPrice: 25000, minOrder: 10, unit: "kg", stock: 1000, locationText: "Hilir Muara, Kotabaru", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: 100, price: 23000 }, { minQty: 101, maxQty: null, price: 20000 }] },
          { name: "Ikan Beku Lokal", slug: "ikan-beku-lokal", categoryId: catMap["perikanan"], retailPrice: 35000, minOrder: 10, unit: "kg", stock: 500, locationText: "Hilir Muara, Kotabaru", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: null, price: 32000 }] },
          { name: "Garam Konsumsi Pesisir", slug: "garam-konsumsi-pesisir", categoryId: catMap["sembako"], retailPrice: 5000, minOrder: 10, unit: "kg", stock: 2000, locationText: "Hilir Muara, Kotabaru", status: "ACTIVE", isWholesaleAvailable: true, wholesalePriceTiers: [{ minQty: 10, maxQty: null, price: 4500 }] }
        ]
      }
    ];

    for (const b of dummyBumdes) {
      const user = await User.create({
        name: b.user.name,
        email: b.user.email,
        phoneNumber: "08111111111",
        passwordHash: bumdesPassword,
        role: "BUMDES_ADMIN",
      });

      const profile = await BumdesProfile.create({
        userId: user._id,
        directorName: b.user.name,
        contactNumber: "08111111111",
        ...b.profile
      });

      const store = await Store.create({
        bumdesId: profile._id,
        description: b.profile.description,
        ...b.store
      });

      for (const p of b.products) {
        await Product.create({
          storeId: store._id,
          description: `Deskripsi resmi untuk ${p.name}`,
          createdBy: user._id,
          ...p
        });
      }
    }

    console.log("Creating Dummy Orders...");
    const buyerProfile = await User.findOne({ email: "pulaulaut@bumdes.id" });
    const sellerStore = await Store.findOne({ slug: "bumdes-sidrap-maju" });
    const sellerBumdes = await BumdesProfile.findById(sellerStore?.bumdesId);
    const product = await Product.findOne({ slug: "beras-premium-sidrap" });
    const product2 = await Product.findOne({ slug: "telur-ayam-ras-sidrap" });

    if (buyerProfile && sellerStore && product && product2 && sellerBumdes) {
      // Order 1: WAITING_PAYMENT
      await Order.create({
        orderNumber: `INV-${Date.now()}-001`,
        buyerId: buyerProfile._id,
        buyerRole: buyerProfile.role,
        buyerName: buyerProfile.name,
        buyerPhone: buyerProfile.phoneNumber,
        buyerAddress: "Kantor BUMDes Pulau Laut Sigam, Kotabaru, Kalsel",
        sellerStoreId: sellerStore._id,
        sellerBumdesProfileId: sellerBumdes._id,
        items: [{
          productId: product._id,
          productNameSnapshot: product.name,
          productSlugSnapshot: product.slug,
          storeId: sellerStore._id,
          quantity: 50,
          unit: product.unit,
          price: 13500,
          appliedPriceType: "WHOLESALE",
          subtotal: 50 * 13500
        }],
        subtotal: 50 * 13500,
        shippingCost: 50000,
        total: (50 * 13500) + 50000,
        status: "WAITING_PAYMENT",
        paymentStatus: "UNPAID",
        buyerNote: "Mohon diinfokan ongkir ke pelabuhan.",
        sellerPaymentInstructions: `Silakan transfer ke ${sellerStore.bankAccount?.bankName} ${sellerStore.bankAccount?.bankAccountNumber} a.n ${sellerStore.bankAccount?.bankAccountHolderName}`
      });

      // Order 2: PROCESSING
      await Order.create({
        orderNumber: `INV-${Date.now()}-002`,
        buyerId: buyerProfile._id,
        buyerRole: buyerProfile.role,
        buyerName: buyerProfile.name,
        buyerPhone: buyerProfile.phoneNumber,
        buyerAddress: "Kantor BUMDes Pulau Laut Sigam, Kotabaru, Kalsel",
        sellerStoreId: sellerStore._id,
        sellerBumdesProfileId: sellerBumdes._id,
        items: [{
          productId: product2._id,
          productNameSnapshot: product2.name,
          productSlugSnapshot: product2.slug,
          storeId: sellerStore._id,
          quantity: 10,
          unit: product2.unit,
          price: 50000,
          appliedPriceType: "RETAIL",
          subtotal: 10 * 50000
        }],
        subtotal: 10 * 50000,
        shippingCost: 20000,
        total: (10 * 50000) + 20000,
        status: "PROCESSING",
        paymentStatus: "PAID",
        paymentProofUrl: "/uploads/dummy-proof.jpg",
        paymentMethod: "MANUAL_TRANSFER",
        paidAt: new Date(),
        buyerNote: "Kirim besok pagi ya",
      });

      // Order 3: SHIPPED_MANUAL
      await Order.create({
        orderNumber: `INV-${Date.now()}-003`,
        buyerId: buyerProfile._id,
        buyerRole: buyerProfile.role,
        buyerName: buyerProfile.name,
        buyerPhone: buyerProfile.phoneNumber,
        buyerAddress: "Kantor BUMDes Pulau Laut Sigam, Kotabaru, Kalsel",
        sellerStoreId: sellerStore._id,
        sellerBumdesProfileId: sellerBumdes._id,
        items: [{
          productId: product._id,
          productNameSnapshot: product.name,
          productSlugSnapshot: product.slug,
          storeId: sellerStore._id,
          quantity: 20,
          unit: product.unit,
          price: 13500,
          appliedPriceType: "WHOLESALE",
          subtotal: 20 * 13500
        }],
        subtotal: 20 * 13500,
        shippingCost: 25000,
        total: (20 * 13500) + 25000,
        status: "SHIPPED_MANUAL",
        paymentStatus: "PAID",
        paymentProofUrl: "/uploads/dummy-proof.jpg",
        paymentMethod: "MANUAL_TRANSFER",
        paidAt: new Date(Date.now() - 86400000), // 1 hari lalu
        shippedAt: new Date(),
        shippingProvider: "Kurir Lokal",
        trackingNumber: "RESI-123",
        manualShippingNote: "Dikirim via kapal feri",
      });

      // Order 4: COMPLETED
      await Order.create({
        orderNumber: `INV-${Date.now()}-004`,
        buyerId: buyerProfile._id,
        buyerRole: buyerProfile.role,
        buyerName: buyerProfile.name,
        buyerPhone: buyerProfile.phoneNumber,
        buyerAddress: "Kantor BUMDes Pulau Laut Sigam, Kotabaru, Kalsel",
        sellerStoreId: sellerStore._id,
        sellerBumdesProfileId: sellerBumdes._id,
        items: [{
          productId: product._id,
          productNameSnapshot: product.name,
          productSlugSnapshot: product.slug,
          storeId: sellerStore._id,
          quantity: 100,
          unit: product.unit,
          price: 13000,
          appliedPriceType: "WHOLESALE",
          subtotal: 100 * 13000
        }],
        subtotal: 100 * 13000,
        shippingCost: 100000,
        total: (100 * 13000) + 100000,
        status: "COMPLETED",
        paymentStatus: "PAID",
        paymentProofUrl: "/uploads/dummy-proof.jpg",
        paymentMethod: "MANUAL_TRANSFER",
        paidAt: new Date(Date.now() - 172800000), // 2 hari lalu
        shippedAt: new Date(Date.now() - 86400000), // 1 hari lalu
        completedAt: new Date(),
        shippingProvider: "Kargo Darat",
        trackingNumber: "RESI-999",
        manualShippingNote: "Sudah sampai",
      });
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
