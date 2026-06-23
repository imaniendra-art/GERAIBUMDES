import mongoose from "mongoose";
import dotenv from "dotenv";
import BumdesProfile from "../src/models/BumdesProfile";
import Store from "../src/models/Store";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const correctLocation = {
    village: "SUDIRMAN",
    district: "TANRALILI",
    regency: "KABUPATEN MAROS",
    province: "SULAWESI SELATAN"
  };

  const profile = await BumdesProfile.findOneAndUpdate(
    { name: /Bumdes Dinaril Sudirman/i },
    { $set: correctLocation },
    { new: true }
  );

  if (profile) {
    await Store.findOneAndUpdate(
      { bumdesId: profile._id },
      { $set: correctLocation }
    );
    console.log("Successfully updated location for Dinaril:", correctLocation);
  } else {
    console.log("Profile not found!");
  }

  await mongoose.disconnect();
}

main().catch(console.error);
