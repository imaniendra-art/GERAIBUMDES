import mongoose from "mongoose";
import dotenv from "dotenv";
import BumdesProfile from "../src/models/BumdesProfile";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const profile = await BumdesProfile.findOne({ name: /Bumdes Dinaril Sudirman/i });
  console.log("Profile location:", {
    village: profile?.village,
    district: profile?.district,
    regency: profile?.regency,
    province: profile?.province
  });
  await mongoose.disconnect();
}

main().catch(console.error);
