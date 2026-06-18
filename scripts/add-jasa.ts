import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import BusinessType from "../src/models/BusinessType";

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error("No MONGODB_URI");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  
  const exists = await BusinessType.findOne({ slug: "jasa-umum-layanan" });
  if (!exists) {
    await BusinessType.create({
      name: "Jasa Umum & Layanan",
      slug: "jasa-umum-layanan",
      sortOrder: 7
    });
    console.log("Berhasil menambahkan Jasa Umum & Layanan.");
  } else {
    console.log("Sudah ada.");
  }
  process.exit(0);
}

run();
