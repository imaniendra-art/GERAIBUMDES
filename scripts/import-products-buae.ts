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

const rawProductsBuae = [
  {
    targetEmail: "bumbuae@gmail.com",
    name: "Voucher WiFi Internet Desa Buae (Paket 30 Hari)",
    category: "Jasa & Penyewaan",
    description: "Voucher akses internet unlimited (tanpa kuota) dengan kecepatan stabil yang dikelola langsung oleh jaringan RT/RW Net BUMDes Buae. Solusi internet murah, cepat, dan lancar untuk mendukung belajar daring anak, hiburan keluarga, dan kelancaran bisnis online warga.",
    price: 50000,
    minOrder: 1,
    unit: "Pcs / Buah",
    stock: 500,
    location: "Loket BUMDes Buae / Beli Langsung via WhatsApp",
    isWholesale: false
  },
  {
    targetEmail: "bumbuae@gmail.com",
    name: "Kacang Tanah Kupas Kualitas Super (Per Kg)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Kacang tanah mentah kupas hasil panen pilihan dari kebun palawija warga Desa Buae. Biji kacang utuh, tua, kering maksimal, dan tidak berjamur. Sangat cocok sebagai bahan baku untuk industri roti, bumbu pecel, atau pengusaha camilan kacang goreng/sangrai.",
    price: 28000,
    minOrder: 1,
    unit: "Kg",
    stock: 100,
    location: "Gudang Hasil Bumi BUMDes Buae",
    isWholesale: true
  },
  {
    targetEmail: "bumbuae@gmail.com",
    name: "Kacang Bawang / Kacang Sangrai Khas Buae",
    category: "Manufaktur & Kerajinan", // Disesuaikan dengan enum untuk produk olahan UMKM
    description: "Camilan kacang bawang renyah dan gurih yang diolah dari kacang tanah panen terbaik Desa Buae. Digoreng dengan bumbu rempah pilihan, tidak berminyak, dan dikemas higienis. Sangat pas untuk teman minum kopi, sajian tamu, atau oleh-oleh khas daerah.",
    price: 15000,
    minOrder: 1,
    unit: "Bungkus / Pack",
    stock: 50,
    location: "Galeri Produk BUMDes Buae",
    isWholesale: true
  },
  {
    targetEmail: "bumbuae@gmail.com",
    name: "Paket Jasa Instalasi Jaringan Internet Desa (RT/RW Net)",
    category: "Jasa & Penyewaan",
    description: "Layanan lengkap pembuatan jaringan internet terpadu untuk desa/BUMDes lain yang belum terjangkau sinyal. Paket sudah termasuk biaya survei lokasi, penarikan kabel fiber optic / pemasangan tower triangle, penyediaan router/access point, injeksi bandwidth, hingga pelatihan manajemen sistem voucher bagi pengelola setempat. Solusi cerdas untuk mewujudkan desa digital.",
    price: 15000000,
    minOrder: 1,
    unit: "Pcs / Buah",
    stock: 5,
    location: "Kantor Manajemen Jaringan BUMDes Buae",
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

    for (const data of rawProductsBuae) {
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
