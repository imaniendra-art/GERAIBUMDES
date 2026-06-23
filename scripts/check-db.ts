import mongoose from "mongoose";
import dotenv from "dotenv";
import BumdesProfile from "../src/models/BumdesProfile";
import Store from "../src/models/Store";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const profile = await BumdesProfile.findOne({ name: /Bumdes Bumi Paccelekang Sejahtera/i });
  console.log("Profile businessType:", profile?.businessType);
  const store = await Store.findOne({ bumdesId: profile?._id });
  console.log("Store businessType:", (store as any)?.businessType);
  await mongoose.disconnect();
}

main().catch(console.error);
