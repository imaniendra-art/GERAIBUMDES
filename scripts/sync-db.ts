import mongoose from "mongoose";
import dotenv from "dotenv";
import BumdesProfile from "../src/models/BumdesProfile";
import Store from "../src/models/Store";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const stores = await Store.find({});
  for (const store of stores) {
    if (store.businessType) {
      // clean up old commas from the broken state if they exist
      const cleanedBusinessType = store.businessType
        .split(",")
        .map(s => s.trim())
        .filter(s => s && s !== "Budidaya" && s !== "Pertanian" && s !== "Peternakan")
        .join(", ");

      await BumdesProfile.updateOne({ _id: store.bumdesId }, { $set: { businessType: cleanedBusinessType } });
    }
  }
  console.log("Synced all profiles!");
  await mongoose.disconnect();
}

main().catch(console.error);
