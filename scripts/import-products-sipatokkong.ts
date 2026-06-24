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

const rawProductsSipatokkong = [
  {
    targetEmail: "sipatokkong@gmail.com",
    name: "Beras Premium Padangloang Alau (Kemasan 10 Kg)",
    category: "Sembako & Kebutuhan Pokok",
    description: "Beras kualitas premium asli hasil panen petani Desa Padangloang Alau. Diproses tanpa pemutih dan pengawet, menghasilkan nasi yang putih, pulen, dan wangi. Sangat cocok untuk konsumsi rumah tangga harian atau suplai katering dan rumah makan.",
    price: 140000,
    minOrder: 1,
    unit: "Karung / Sak",
    stock: 100,
    location: "Gudang Pangan BUMDes Sipatokkong",
    isWholesale: true
  },
  {
    targetEmail: "sipatokkong@gmail.com",
    name: "Buah Jambu Citra Segar Grade A (Per Kg)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Jambu Citra segar kualitas super asli dari lahan produktif warga Padangloang Alau. Ukuran buah besar, warna merah merona, tekstur renyah, dan rasanya sangat manis menyegarkan. Dipetik langsung dan disortir ketat pada hari pengiriman.",
    price: 35000,
    minOrder: 1,
    unit: "Kg",
    stock: 50,
    location: "Pusat Pengepulan BUMDes Sipatokkong",
    isWholesale: true
  },
  {
    targetEmail: "sipatokkong@gmail.com",
    name: "Telur Ayam Ras Grade A (Per Rak)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Telur ayam segar ukuran besar yang disuplai langsung setiap hari dari kandang peternak mitra BUMDes Sipatokkong. Cangkang bersih, tebal, dan kualitas isinya terjamin. Pilihan tepat dan ekonomis untuk kebutuhan protein rumah tangga maupun bahan baku UMKM kuliner.",
    price: 55000,
    minOrder: 1,
    unit: "Rak",
    stock: 150,
    location: "Unit Distribusi BUMDes Sipatokkong",
    isWholesale: true
  },
  {
    targetEmail: "sipatokkong@gmail.com",
    name: "Bebek Karkas Potong Bersih (Siap Masak)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Daging bebek utuh (karkas) segar yang sudah dipotong dan dibersihkan higienis secara syariat. Berasal dari peternakan bebek lokal Sidrap yang kualitas dagingnya terkenal tebal dan gurih. Sangat praktis dan siap diolah menjadi masakan Nasu Palekko, bebek goreng, atau bebek bakar.",
    price: 55000,
    minOrder: 1,
    unit: "Ekor",
    stock: 50,
    location: "Cold Storage / Kemitraan Peternak BUMDes Sipatokkong",
    isWholesale: true
  },
  {
    targetEmail: "sipatokkong@gmail.com",
    name: "Telur Bebek Angon Segar (Per Rak)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Telur bebek segar hasil dari peternakan sistem angon di areal persawahan Padangloang Alau. Memiliki ciri khas kuning telur yang masir dan kaya protein. Merupakan bahan baku wajib dan terbaik untuk para pengusaha martabak telur, warung jamu, maupun industri rumahan telur asin.",
    price: 75000,
    minOrder: 1,
    unit: "Rak",
    stock: 100,
    location: "Sentra Peternakan BUMDes Sipatokkong",
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

    for (const data of rawProductsSipatokkong) {
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
