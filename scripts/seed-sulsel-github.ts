import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import Region from "../src/models/Region";

const API_BASE_URL = "https://emsifa.github.io/api-wilayah-indonesia/api";

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

async function seedSulsel() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Clearing existing Region data...");
    await Region.deleteMany({});
    console.log("Region collection cleared.");

    console.log("Fetching South Sulawesi (73) data from GitHub...");
    const provinceId = "73";
    const provinceName = "SULAWESI SELATAN";

    const regencies = await fetchJson(`${API_BASE_URL}/regencies/${provinceId}.json`);
    console.log(`Found ${regencies.length} regencies in Sulsel.`);

    const regionDocuments: any[] = [];

    for (const regency of regencies) {
      console.log(`Fetching districts for regency: ${regency.name}`);
      const districts = await fetchJson(`${API_BASE_URL}/districts/${regency.id}.json`);
      
      for (const district of districts) {
        const villages = await fetchJson(`${API_BASE_URL}/villages/${district.id}.json`);
        
        for (const village of villages) {
          regionDocuments.push({
            provinceCode: provinceId,
            provinceName: provinceName,
            regencyCode: regency.id,
            regencyName: regency.name,
            districtCode: district.id,
            districtName: district.name,
            villageCode: village.id,
            villageName: village.name,
            isActive: true
          });
        }
      }
    }

    console.log(`Total regions (villages) to insert: ${regionDocuments.length}`);
    
    const batchSize = 1000;
    for (let i = 0; i < regionDocuments.length; i += batchSize) {
      const batch = regionDocuments.slice(i, i + batchSize);
      await Region.insertMany(batch);
      console.log(`Inserted batch ${i / batchSize + 1}`);
    }

    console.log("Seeding Sulsel regions completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Sulsel regions:", error);
    process.exit(1);
  }
}

seedSulsel();
