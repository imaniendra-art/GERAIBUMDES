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

async function seedKalsel() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // SANGAT PENTING: JANGAN MENGGUNAKAN deleteMany agar data Sulsel tidak hilang
    console.log("Fetching South Kalimantan (63) data from GitHub...");
    const provinceId = "63";
    const provinceName = "KALIMANTAN SELATAN";

    const regencies = await fetchJson(`${API_BASE_URL}/regencies/${provinceId}.json`);
    console.log(`Found ${regencies.length} regencies in Kalsel.`);

    const regionDocuments: any[] = [];

    for (const regency of regencies) {
      console.log(`Fetching districts for regency: ${regency.name}`);
      const districts = await fetchJson(`${API_BASE_URL}/districts/${regency.id}.json`);
      
      // Manual Injection for Kotabaru (6302)
      if (regency.id === "6302") {
        const sigamExists = districts.some((d: any) => d.name.toUpperCase() === "PULAU LAUT SIGAM");
        if (!sigamExists) {
          console.log("Injecting PULAU LAUT SIGAM manually...");
          districts.push({ id: "630299", name: "PULAU LAUT SIGAM" });
        }
      }

      for (const district of districts) {
        let villages: any[] = [];
        
        // Avoid fetching for manual district
        if (district.id !== "630299") {
          try {
            villages = await fetchJson(`${API_BASE_URL}/villages/${district.id}.json`);
          } catch (e) {
            console.warn(`Could not fetch villages for district ${district.id}`);
          }
        }
        
        // Manual Injection for Pulau Laut Sigam Villages
        if (district.name.toUpperCase() === "PULAU LAUT SIGAM") {
          const manualVillages = [
            { id: `${district.id}2001`, name: "BAHARU UTARA" },
            { id: `${district.id}2002`, name: "SEBATUNG" },
            { id: `${district.id}2003`, name: "GEDAMBAAN" },
            { id: `${district.id}2004`, name: "BATUAH" },
            { id: `${district.id}2005`, name: "SARANGTIUNG" },
            { id: `${district.id}2006`, name: "TIRAWAN" },
            { id: `${district.id}2007`, name: "HILIR MUARA" }
          ];

          for (const mv of manualVillages) {
            const exists = villages.some((v: any) => v.name.toUpperCase() === mv.name);
            if (!exists) {
              console.log(`Injecting ${mv.name} manually...`);
              villages.push(mv);
            }
          }
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

    console.log("Seeding Kalsel regions completed successfully!");
    
    // Verifikasi "Desa Baharu Utara"
    console.log("\nMemverifikasi data spesifik (Desa Baharu Utara)...");
    const checkVillage = await Region.findOne({ 
      villageName: { $regex: /BAHARU UTARA/i }, 
      districtName: { $regex: /PULAU LAUT SIGAM/i },
      regencyName: { $regex: /KOTABARU/i }
    });
    
    if (checkVillage) {
      console.log("VERIFICATION SUCCESS: Ditemukan!");
      console.log(`- Desa: ${checkVillage.villageName}`);
      console.log(`- Kecamatan: ${checkVillage.districtName}`);
      console.log(`- Kabupaten: ${checkVillage.regencyName}`);
      console.log(`- Provinsi: ${checkVillage.provinceName}`);
    } else {
      console.log("VERIFICATION WARNING: Tidak dapat menemukan Desa Baharu Utara di DB.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding Kalsel regions:", error);
    process.exit(1);
  }
}

seedKalsel();
