import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import Category from "../src/models/Category";

async function seedProductCategories() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // The user mentioned the category collection was cleared. Let's make sure it's clear.
    console.log("Clearing existing Category data...");
    await Category.deleteMany({});

    console.log("Seeding Product Categories...");
    const categoriesData = [
      { name: "Sembako & Kebutuhan Pokok", slug: "sembako-kebutuhan-pokok", sortOrder: 1 },
      { name: "Hasil Pertanian & Perkebunan", slug: "hasil-pertanian-perkebunan", sortOrder: 2 },
      { name: "Peternakan & Perikanan", slug: "peternakan-perikanan", sortOrder: 3 },
      { name: "Makanan & Minuman Olahan", slug: "makanan-minuman-olahan", sortOrder: 4 },
      { name: "Kerajinan Tangan & Kriya", slug: "kerajinan-tangan-kriya", sortOrder: 5 },
      { name: "Jasa & Penyewaan Barang", slug: "jasa-penyewaan-barang", sortOrder: 6 },
      { name: "Pariwisata & Tiket", slug: "pariwisata-tiket", sortOrder: 7 }
    ];

    await Category.insertMany(categoriesData);
    console.log(`Inserted ${categoriesData.length} Categories.`);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding product categories:", error);
    process.exit(1);
  }
}

seedProductCategories();
