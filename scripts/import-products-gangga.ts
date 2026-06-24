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

const rawProductsGangga = [
  {
    targetEmail: "gangga@gmail.com",
    name: "Biji Kakao Kering (Standard Mutu Ekspor)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Biji kakao pilihan dari petani Desa Gangga yang telah diproses fermentasi dan pengeringan alami. Kualitas biji bersih, kadar air rendah (7-8%), dan terjamin mutu fisiknya. Sangat layak untuk disuplai ke industri cokelat skala nasional maupun mitra pengepul besar di tingkat provinsi.",
    price: 85000,
    minOrder: 20,
    unit: "Kg",
    stock: 500,
    location: "Gudang Pengumpul BUMDes Gangga",
    isWholesale: true
  },
  {
    targetEmail: "gangga@gmail.com",
    name: "Ikan Teri Kering Kualitas Super",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Ikan teri segar hasil tangkapan nelayan pesisir Desa Gangga yang diproses pengeringan alami tanpa bahan pengawet kimia. Tekstur renyah, bersih, dan rasa gurih alami khas laut Teluk Tomini. Sangat cocok untuk konsumsi rumah tangga atau dipasarkan sebagai oleh-oleh khas daerah.",
    price: 70000,
    minOrder: 1,
    unit: "Kg",
    stock: 50,
    location: "Galeri Produk Perikanan BUMDes Gangga",
    isWholesale: true
  },
  {
    targetEmail: "gangga@gmail.com",
    name: "Pupuk Organik Padat (Kemasan 20kg)",
    category: "Perdagangan & Pasar Desa",
    description: "Pupuk organik ramah lingkungan untuk meningkatkan produktivitas kebun kakao dan kelapa warga. Stok selalu tersedia di toko BUMDes dengan harga bersaing untuk mendukung keberlanjutan pertanian warga Desa Gangga.",
    price: 150000,
    minOrder: 1,
    unit: "Bungkus / Pack",
    stock: 200,
    location: "Toko Saprodi BUMDes Gangga",
    isWholesale: false
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

    for (const data of rawProductsGangga) {
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
