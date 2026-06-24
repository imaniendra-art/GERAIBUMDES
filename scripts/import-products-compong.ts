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

const rawProductsCompong = [
  {
    targetEmail: "amanahbumdes@gmail.com",
    name: "Biji Kemiri Kupas Super (Kering)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Kemiri bulat kupas kualitas super asli dari perkebunan dataran tinggi Desa Compong. Disortir dengan teliti, utuh (tidak pecah), warna cerah, dan dikeringkan secara optimal sehingga tidak mudah berjamur. Sangat cocok untuk suplai bumbu pasar tradisional maupun industri makanan.",
    price: 45000,
    minOrder: 1,
    unit: "Kg",
    stock: 200,
    location: "Gudang Hasil Bumi BUMDes Amanah",
    isWholesale: true
  },
  {
    targetEmail: "amanahbumdes@gmail.com",
    name: "Gula Aren Cetak Asli Compong",
    category: "Makanan & Minuman Olahan",
    description: "Gula aren murni tanpa campuran bahan kimia atau pemanis buatan, diolah secara tradisional oleh petani aren Desa Compong. Aromanya khas, teksturnya legit, dan sangat cocok digunakan sebagai bahan baku kedai kopi (es kopi susu aren), pembuatan kue tradisional, atau pemanis herbal.",
    price: 30000,
    minOrder: 1,
    unit: "Ikat",
    stock: 50,
    location: "Etalase GeraiBumdes Amanah",
    isWholesale: true
  },
  {
    targetEmail: "amanahbumdes@gmail.com",
    name: "Jasa Angkut Hasil Panen (Sewa Pick-Up)",
    category: "Jasa & Penyewaan",
    description: "Layanan penyewaan mobil bak terbuka (pick-up) lengkap dengan tenaga supir untuk mengangkut hasil panen (kemiri, cengkeh, kakao, pisang) dari Desa Compong menuju pusat pasar Pangkajene atau daerah sekitarnya. Solusi logistik aman dan terjangkau bagi para petani.",
    price: 250000,
    minOrder: 1,
    unit: "Pcs / Buah",
    stock: 5,
    location: "Kantor BUMDes Amanah Desa Compong",
    isWholesale: false
  },
  {
    targetEmail: "amanahbumdes@gmail.com",
    name: "Ikan Nila Segar (Budidaya Bioflok)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Ikan nila segar berukuran konsumsi hasil budidaya sistem bioflok BUMDes Amanah. Dipelihara di kolam terpal dengan sirkulasi air yang higienis, sehingga menghasilkan ikan yang sehat, daging lebih tebal, dan dijamin tidak bau tanah/lumpur. Siap disuplai ke warung makan atau untuk lauk keluarga.",
    price: 35000,
    minOrder: 1,
    unit: "Kg",
    stock: 50,
    location: "Area Kolam Bioflok BUMDes Amanah Compong",
    isWholesale: true
  },
  {
    targetEmail: "amanahbumdes@gmail.com",
    name: "Tiket Masuk Wisata Air Terjun Compong",
    category: "Pariwisata & Ekonomi Kreatif",
    description: "Tiket resmi masuk ke kawasan wisata alam Air Terjun Desa Compong. Nikmati keindahan air terjun alami yang asri, udara pegunungan Pituriase yang sejuk, lengkap dengan fasilitas jalan setapak yang aman, area parkir, dan tempat istirahat (gazebo). Sangat cocok untuk tujuan healing bersama teman dan keluarga di akhir pekan.",
    price: 10000,
    minOrder: 1,
    unit: "Pcs / Buah",
    stock: 1000,
    location: "Loket Masuk Wisata Air Terjun Compong",
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

    for (const data of rawProductsCompong) {
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
