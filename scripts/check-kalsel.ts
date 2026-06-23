import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import Region from "../src/models/Region";

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const villages = await Region.find({ villageName: { $regex: /BAHARU/i } });
  villages.forEach(v => {
    console.log("Found:", v.villageName, "in", v.districtName, "in", v.regencyName);
  });
  
  process.exit(0);
}

check();
