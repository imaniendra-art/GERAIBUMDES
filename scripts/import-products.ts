import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User";
import BumdesProfile from "../src/models/BumdesProfile";
import Store from "../src/models/Store";
import Product from "../src/models/Product";
import Category from "../src/models/Category";

dotenv.config();

const rawProducts = [
  {
    targetEmail: "bumipaccelekang@gmail.com",
    name: "Lobster Air Tawar Segar (Konsumsi)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Lobster air tawar kualitas premium hasil budidaya langsung dari kolam BUMDes Paccelekang. Daging tebal, segar, dipelihara dengan sirkulasi air yang higienis. Sangat cocok untuk suplai restoran seafood atau konsumsi rumah tangga.",
    price: 150000,
    minOrder: 1,
    unit: "Kg",
    stock: 50,
    location: "Unit Kolam Budidaya BUMDes Paccelekang",
    isWholesale: true
  },
  {
    targetEmail: "bumipaccelekang@gmail.com",
    name: "Bola-Bola Singkong Frozen Paccelekang",
    category: "Makanan & Minuman Olahan",
    description: "Camilan bola-bola singkong asli dari kebun Desa Paccelekang yang dikemas secara frozen (beku) agar awet. Praktis tinggal goreng, tekstur krispi di luar dan lembut di dalam. Diproduksi secara higienis oleh Kelompok Wanita Tani (KWT) mitra BUMDes.",
    price: 150000,
    minOrder: 1,
    unit: "Bungkus / Pack",
    stock: 100,
    location: "Freezer GeraiBumdes Paccelekang",
    isWholesale: false
  },
  {
    targetEmail: "bumipaccelekang@gmail.com",
    name: "Telur Ayam Ras Segar (Per Rak)",
    category: "Sembako & Kebutuhan Pokok",
    description: "Telur ayam segar yang diambil langsung setiap pagi dari kandang peternakan terpadu BUMDes Paccelekang. Cangkang bersih, kualitas kuning telur terjamin, dan harga jauh lebih bersahabat untuk warga desa.",
    price: 52000,
    minOrder: 1,
    unit: "Rak",
    stock: 30,
    location: "Kandang Ayam BUMDes / Toko BUMDes",
    isWholesale: true
  },
  {
    targetEmail: "dinaril@gmail.com",
    name: "Sepatu Ecoprint Eksklusif BUMDes Dinaril",
    category: "Manufaktur & Kerajinan",
    description: "Sepatu buatan lokal dengan motif ecoprint alami dari dedaunan khas Desa Sudirman. Desainnya eksklusif (setiap produk memiliki motif berbeda), awet, dan ramah lingkungan. Sangat cocok untuk acara kasual maupun semi-formal.",
    price: 250000,
    minOrder: 1,
    unit: "Pcs / Buah",
    stock: 10,
    location: "Galeri Kerajinan BUMDes Dinaril",
    isWholesale: false
  },
  {
    targetEmail: "dinaril@gmail.com",
    name: "Nugget Jamur Tiram (Frozen)",
    category: "Makanan & Minuman Olahan",
    description: "Nugget sehat dan bergizi berbahan dasar jamur tiram murni hasil budidaya organik BUMDes Dinaril. Dikemas secara frozen (beku) tanpa bahan pengawet kimia. Sangat praktis dan cocok untuk lauk sehat anak-anak atau camilan keluarga.",
    price: 20000,
    minOrder: 1,
    unit: "Bungkus / Pack",
    stock: 50,
    location: "Freezer Galeri BUMDes Dinaril",
    isWholesale: true
  },
  {
    targetEmail: "dinaril@gmail.com",
    name: "Jamur Tiram Segar (Per Kilogram)",
    category: "Pertanian, Peternakan & Perikanan",
    description: "Jamur tiram segar kualitas super yang baru dipetik dari kumbung budidaya Desa Sudirman. Warnanya putih bersih, mekar sempurna, kenyal, dan tidak mudah layu. Ideal untuk kebutuhan suplai rumah makan, katering, atau dijual kembali di pasar tradisional.",
    price: 25000,
    minOrder: 1,
    unit: "Kg",
    stock: 15,
    location: "Kumbung Jamur BUMDes Dinaril",
    isWholesale: true
  }
];

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is undefined");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB. Starting product import...");

  for (const raw of rawProducts) {
    try {
      console.log(`\nProcessing product: ${raw.name}`);
      
      const user = await User.findOne({ email: raw.targetEmail });
      if (!user) {
        console.error(`❌ User not found for email: ${raw.targetEmail}`);
        continue;
      }

      const profile = await BumdesProfile.findOne({ userId: user._id });
      if (!profile) {
        console.error(`❌ BumdesProfile not found for userId: ${user._id}`);
        continue;
      }

      const store = await Store.findOne({ bumdesId: profile._id });
      if (!store) {
        console.error(`❌ Store not found for bumdesId: ${profile._id}`);
        continue;
      }

      // Check if product already exists in this store
      const existingProduct = await Product.findOne({ storeId: store._id, name: raw.name });
      if (existingProduct) {
        console.log(`⚠️ Product already exists in this store, skipping: ${raw.name}`);
        continue;
      }

      // Handle Category
      let category = await Category.findOne({ name: { $regex: new RegExp(`^${raw.category}$`, "i") } });
      if (!category) {
        category = new Category({
          name: raw.category,
          slug: slugify(raw.category),
        });
        await category.save();
        console.log(`Created new category: ${raw.category}`);
      }

      // Ensure unique slug
      let productSlug = slugify(raw.name);
      let counter = 1;
      while (await Product.findOne({ slug: productSlug })) {
        productSlug = `${slugify(raw.name)}-${counter}`;
        counter++;
      }

      const product = new Product({
        storeId: store._id,
        categoryId: category._id,
        name: raw.name,
        slug: productSlug,
        description: raw.description,
        retailPrice: raw.price,
        minOrder: raw.minOrder,
        unit: raw.unit,
        stock: raw.stock,
        locationText: raw.location,
        isWholesaleAvailable: raw.isWholesale,
        status: "ACTIVE",
        createdBy: user._id,
      });

      await product.save();
      console.log(`✅ Success inserting: ${raw.name} (Store: ${store.name})`);
    } catch (err: any) {
      console.error(`❌ Error inserting ${raw.name}: ${err.message}`);
    }
  }

  await mongoose.disconnect();
  console.log("\nDone! Disconnected from MongoDB");
}

main().catch(console.error);
