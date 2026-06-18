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

async function resetDb() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Clearing all collections...");
    await User.deleteMany({});
    await BumdesProfile.deleteMany({});
    await Store.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await BusinessType.deleteMany({});
    await Region.deleteMany({});
    console.log("Collections cleared.");

    console.log("Creating Admin Account...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminRole = "SUPER_ADMIN";
    
    await User.create({
      name: "Super Admin Geraibumdes",
      email: "admin@geraibumdes.com",
      phoneNumber: "080000000000",
      passwordHash: adminPassword,
      role: adminRole,
    });
    
    console.log(`Successfully created admin account with role: ${adminRole}`);
    console.log("Database reset completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

resetDb();
