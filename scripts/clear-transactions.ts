import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../src/models/User";
import Store from "../src/models/Store";
import BumdesProfile from "../src/models/BumdesProfile";
import Product from "../src/models/Product";
import Order from "../src/models/Order";

async function clearTransactions() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Clearing collections...");
    
    const userResult = await User.deleteMany({});
    console.log(`Deleted ${userResult.deletedCount} Users`);
    
    const storeResult = await Store.deleteMany({});
    console.log(`Deleted ${storeResult.deletedCount} Stores`);

    const bumdesResult = await BumdesProfile.deleteMany({});
    console.log(`Deleted ${bumdesResult.deletedCount} BumdesProfiles`);

    const productResult = await Product.deleteMany({});
    console.log(`Deleted ${productResult.deletedCount} Products`);

    const orderResult = await Order.deleteMany({});
    console.log(`Deleted ${orderResult.deletedCount} Orders`);

    // We do not have a Cart model in src/models
    console.log(`Skipped Cart (model not found)`);

    console.log("Collections cleared successfully.");
    console.log("NOTE: Region and BusinessType/Category collections were NOT touched.");

    console.log("Re-creating Super Admin...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt);

    const superAdmin = new User({
      name: "Super Admin",
      email: "admin@geraibumdes.com",
      passwordHash,
      phoneNumber: "000000000000",
      role: "SUPER_ADMIN"
    });

    await superAdmin.save();
    console.log("Super Admin 'admin@geraibumdes.com' created successfully.");

  } catch (error) {
    console.error("Error clearing transactions:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from Database.");
  }
}

clearTransactions();
