import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import mongoose from "mongoose";
import Region from "../src/models/Region";

const API_BASE_URL = "https://emsifa.github.io/api-wilayah-indonesia/api";

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

async function seedSulteng() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env");
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // SANGAT PENTING: JANGAN MENGGUNAKAN deleteMany agar data yang sudah ada tidak hilang
    console.log("Fetching Sulawesi Tengah (72) data from GitHub...");
    const provinceId = "72";
    const provinceName = "SULAWESI TENGAH";

    const regencies = await fetchJson(`${API_BASE_URL}/regencies/${provinceId}.json`);
    console.log(`Found ${regencies.length} regencies in Sulteng.`);

    const regionDocuments: any[] = [];

    for (const regency of regencies) {
      console.log(`Fetching districts for regency: ${regency.name}`);
      const districts = await fetchJson(`${API_BASE_URL}/districts/${regency.id}.json`);
      
      for (const district of districts) {
        let villages: any[] = [];
        
        try {
          villages = await fetchJson(`${API_BASE_URL}/villages/${district.id}.json`);
        } catch (e) {
          console.warn(`Could not fetch villages for district ${district.id}`);
        }
        
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
            // Legacy fields to be safe
            province: provinceName,
            regency: regency.name,
            district: district.name,
            village: village.name,
            isActive: true
          });
        }
      }
    }

    console.log(`Total regions (villages) to insert: ${regionDocuments.length}`);
    
    // Gunakan bulkWrite dengan upsert untuk insert yang aman tanpa menghapus
    const batchSize = 1000;
    for (let i = 0; i < regionDocuments.length; i += batchSize) {
      const batch = regionDocuments.slice(i, i + batchSize);
      
      const operations = batch.map(doc => ({
        updateOne: {
          filter: { villageCode: doc.villageCode },
          update: { $set: doc },
          upsert: true
        }
      }));

      await Region.bulkWrite(operations, { ordered: false });
      console.log(`Inserted/Updated batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(regionDocuments.length / batchSize)}`);
    }

    console.log("Seeding Sulteng regions completed successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Sulteng regions:", error);
    process.exit(1);
  }
}

seedSulteng();
