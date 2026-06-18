import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";

import Region from "../src/models/Region";
import BusinessType from "../src/models/BusinessType";

async function seedData() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Clearing existing Region and BusinessType data...");
    await Region.deleteMany({});
    await BusinessType.deleteMany({});

    console.log("Seeding Business Types...");
    const businessTypes = [
      { name: "Jasa Keuangan (Simpan Pinjam)", slug: "jasa-keuangan", sortOrder: 1 },
      { name: "Perdagangan & Pasar Desa", slug: "perdagangan-pasar-desa", sortOrder: 2 },
      { name: "Pertanian, Peternakan & Perikanan", slug: "pertanian-peternakan-perikanan", sortOrder: 3 },
      { name: "Pariwisata & Hiburan (Wisata Desa)", slug: "pariwisata-hiburan", sortOrder: 4 },
      { name: "Penyewaan Barang & Logistik", slug: "penyewaan-barang-logistik", sortOrder: 5 },
      { name: "Manufaktur & Kerajinan Lokal", slug: "manufaktur-kerajinan-lokal", sortOrder: 6 },
      { name: "Jasa Umum & Layanan", slug: "jasa-umum-layanan", sortOrder: 7 }
    ];
    await BusinessType.insertMany(businessTypes);
    console.log(`Inserted ${businessTypes.length} Business Types.`);

    console.log("Seeding Regions (Sulawesi Selatan)...");
    const regions = [
      // Makassar
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7371", regencyName: "KOTA MAKASSAR", districtCode: "737101", districtName: "MARISO", villageCode: "7371011001", villageName: "BONTOMAKKIO" },
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7371", regencyName: "KOTA MAKASSAR", districtCode: "737102", districtName: "MAMAJANG", villageCode: "7371021001", villageName: "MAMAJANG LUAR" },
      // Gowa
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7306", regencyName: "KAB. GOWA", districtCode: "730608", districtName: "SOMBOUA", villageCode: "7306081001", villageName: "SUNGGUMINASA" },
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7306", regencyName: "KAB. GOWA", districtCode: "730609", districtName: "PALLANGGA", villageCode: "7306092001", villageName: "TAENG" },
      // Maros
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7309", regencyName: "KAB. MAROS", districtCode: "730901", districtName: "MANDAI", villageCode: "7309012001", villageName: "TENRIGANGKAE" },
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7309", regencyName: "KAB. MAROS", districtCode: "730902", districtName: "MONCONGLOE", villageCode: "7309022001", villageName: "MONCONGLOE" },
      // Pangkep
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7310", regencyName: "KAB. PANGKAJENE DAN KEPULAUAN", districtCode: "731001", districtName: "PANGKAJENE", villageCode: "7310011001", villageName: "TUMAMPUA" },
      // Bone
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7311", regencyName: "KAB. BONE", districtCode: "731101", districtName: "TANETE RIATTANG", villageCode: "7311011001", villageName: "BIRU" },
      // Palopo
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7373", regencyName: "KOTA PALOPO", districtCode: "737301", districtName: "WARA", villageCode: "7373011001", villageName: "BINTING" },
      // Parepare
      { provinceCode: "73", provinceName: "SULAWESI SELATAN", regencyCode: "7372", regencyName: "KOTA PAREPARE", districtCode: "737201", districtName: "BACUKIKI", villageCode: "7372011001", villageName: "LOMPOE" },
    ];
    await Region.insertMany(regions);
    console.log(`Inserted ${regions.length} Region nodes.`);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
