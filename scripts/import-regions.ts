import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local if available
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import Region from "../src/models/Region";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

async function importRegions() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected successfully.\n");

    const dataPath = path.resolve(process.cwd(), "data");
    let targetFile = path.join(dataPath, "regions.json");

    if (!fs.existsSync(targetFile)) {
      console.log("data/regions.json not found. Falling back to data/regions.sulsel.json...");
      targetFile = path.join(dataPath, "regions.sulsel.json");
      if (!fs.existsSync(targetFile)) {
        console.error("Neither regions.json nor regions.sulsel.json was found.");
        process.exit(1);
      }
    }

    console.log(`Reading data from ${targetFile}...`);
    const fileContent = fs.readFileSync(targetFile, "utf-8");
    const regionsData = JSON.parse(fileContent);

    if (!Array.isArray(regionsData)) {
      console.error("Data should be a JSON array.");
      process.exit(1);
    }

    console.log(`Found ${regionsData.length} records. Starting import...`);

    let inserted = 0;
    let updated = 0;

    for (const data of regionsData) {
      // Compatibility fields mapping
      const mappedData = {
        ...data,
        province: data.provinceName || data.province,
        regency: data.regencyName || data.regency,
        district: data.districtName || data.district,
        village: data.villageName || data.village,
        isActive: true
      };

      if (data.villageCode) {
        // Upsert by villageCode
        const result = await Region.updateOne(
          { villageCode: data.villageCode },
          { $set: mappedData },
          { upsert: true }
        );
        if (result.upsertedCount > 0) inserted++;
        else if (result.modifiedCount > 0) updated++;
      } else if (mappedData.villageName && mappedData.districtName && mappedData.regencyName) {
        // Upsert by name combination if code is missing
        const result = await Region.updateOne(
          { 
            villageName: mappedData.villageName,
            districtName: mappedData.districtName,
            regencyName: mappedData.regencyName 
          },
          { $set: mappedData },
          { upsert: true }
        );
        if (result.upsertedCount > 0) inserted++;
        else if (result.modifiedCount > 0) updated++;
      }
    }

    console.log("\nImport Summary:");
    console.log(`Total processed: ${regionsData.length}`);
    console.log(`Newly inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log("\nImport completed successfully.");

  } catch (error) {
    console.error("Error during import:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

importRegions();
