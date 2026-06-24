import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../src/models/User";
import BumdesProfile from "../src/models/BumdesProfile";
import Store from "../src/models/Store";
import Category from "../src/models/Category";
import Product from "../src/models/Product";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

const rawProductsLaemanta = [
  {
    targetEmail: "laemanta@gmail.com",
    name: "Biji Kakao Kering Fermentasi (Grade A)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Biji kakao pilihan dari kebun petani Desa Laemanta yang telah melalui proses fermentasi dan penjemuran optimal. Kadar air rendah, bersih dari kotoran, dan tidak berjamur. Memenuhi standar kualitas untuk suplai industri pengolahan cokelat dalam partai besar.",
    price: 95000,
    minOrder: 50,
    unit: "Kg",
    stock: 500,
    location: "Gudang Pengeringan BUMDes Laemanta",
    isWholesale: true
  },
  {
    targetEmail: "laemanta@gmail.com",
    name: "Kopra Putih / Kering (Bahan Baku Minyak Kelapa)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Kopra berkualitas tinggi hasil penjemuran matahari pesisir Teluk Tomini dan pengasapan terstandar. Daging kelapa tebal, kering maksimal, dan memiliki kandungan minyak yang tinggi. Ideal untuk disuplai ke pabrik minyak goreng kelapa maupun industri kosmetik.",
    price: 12000,
    minOrder: 100,
    unit: "Kg",
    stock: 1000,
    location: "Sentra Kopra BUMDes Laemanta",
    isWholesale: true
  },
  {
    targetEmail: "laemanta@gmail.com",
    name: "Ikan Asap Cakalang Khas Kasimbar",
    category: "Manufaktur & Kerajinan",
    description: "Ikan cakalang segar tangkapan nelayan Teluk Tomini yang diasap secara tradisional menggunakan sabut kelapa pilihan, menghasilkan aroma smokey yang khas dan daging yang gurih. Dikemas higienis dengan sistem vakum sehingga awet dikirim ke seluruh Indonesia. Sangat cocok dimasak rica-rica atau disuwir.",
    price: 35000,
    minOrder: 1,
    unit: "Pcs / Buah",
    stock: 100,
    location: "Galeri Nelayan BUMDes Laemanta",
    isWholesale: true
  }
];

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') + '-' + Math.random().toString(36).substring(2, 6);
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Terhubung ke MongoDB...");

    let successCount = 0;
    let failCount = 0;

    for (const data of rawProductsLaemanta) {
      try {
        console.log(`\nMemproses produk: ${data.name}...`);

        // 1. Cari User
        const user = await User.findOne({ email: data.targetEmail });
        if (!user) {
          throw new Error(`User dengan email ${data.targetEmail} tidak ditemukan.`);
        }

        // 2. Cari BumdesProfile
        const profile = await BumdesProfile.findOne({ userId: user._id });
        if (!profile) {
          throw new Error(`BumdesProfile untuk user ${data.targetEmail} tidak ditemukan.`);
        }

        // 3. Cari Store
        const store = await Store.findOne({ bumdesId: profile._id });
        if (!store) {
          throw new Error(`Store untuk BUMDes ${profile.name} tidak ditemukan.`);
        }

        // 4. Cari Category
        let category = await Category.findOne({ name: data.category });
        if (!category) {
          // Buat kategori jika belum ada
          category = await Category.create({
            name: data.category,
            slug: generateSlug(data.category),
            description: `Kategori ${data.category}`,
            isActive: true
          });
          console.log(`  -> Kategori baru dibuat: ${category.name}`);
        }

        // 5. Cek apakah produk sudah ada (mencegah duplikasi nama yang persis sama di toko ini)
        const existingProduct = await Product.findOne({ storeId: store._id, name: data.name });
        if (existingProduct) {
          console.log(`  -> Produk "${data.name}" sudah ada. Melewati proses insert.`);
          continue;
        }

        // 6. Insert Product
        const newProduct = await Product.create({
          storeId: store._id,
          categoryId: category._id,
          name: data.name,
          slug: generateSlug(data.name),
          description: data.description,
          retailPrice: data.price,
          minOrder: data.minOrder,
          unit: data.unit,
          stock: data.stock,
          locationText: data.location,
          isWholesaleAvailable: data.isWholesale,
          status: "ACTIVE", // Langsung aktif sesuai permintaan
          createdBy: user._id,
          images: [], // Bisa diperbarui nanti lewat UI
        });

        console.log(`  ✅ Berhasil menyimpan produk: ${newProduct.name}`);
        successCount++;

      } catch (err: any) {
        console.error(`  ❌ Gagal memproses ${data.name}: ${err.message}`);
        failCount++;
      }
    }

    console.log(`\n--- RINGKASAN IMPORT ---`);
    console.log(`Total Berhasil: ${successCount}`);
    console.log(`Total Gagal: ${failCount}`);

  } catch (error) {
    console.error("Koneksi database gagal:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Koneksi MongoDB ditutup.");
    process.exit(0);
  }
}

main();
