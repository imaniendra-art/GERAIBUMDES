import fs from 'fs';
import path from 'path';

async function fetchJSON(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
}

async function run() {
  const BASE_URL = "https://emsifa.github.io/api-wilayah-indonesia/api";
  try {
    console.log("Fetching provinces...");
    const provinces = await fetchJSON(`${BASE_URL}/provinces.json`);
    const sulsel = provinces.find((p: any) => p.name.includes("SULAWESI SELATAN"));
    
    if (!sulsel) throw new Error("Sulsel not found");
    
    console.log(`Found Sulsel: ${sulsel.id}`);
    
    const regencies = await fetchJSON(`${BASE_URL}/regencies/${sulsel.id}.json`);
    console.log(`Found ${regencies.length} regencies.`);
    
    const results = [];
    
    for (const regency of regencies) {
      console.log(`Fetching districts for ${regency.name}...`);
      const districts = await fetchJSON(`${BASE_URL}/districts/${regency.id}.json`);
      
      for (const district of districts) {
        const villages = await fetchJSON(`${BASE_URL}/villages/${district.id}.json`);
        
        for (const village of villages) {
          results.push({
            provinceCode: sulsel.id,
            province: "Sulawesi Selatan",
            regencyCode: regency.id,
            regency: regency.name,
            districtCode: district.id,
            district: district.name,
            villageCode: village.id,
            village: village.name,
          });
        }
      }
    }
    
    console.log(`Total regions compiled: ${results.length}`);
    const filePath = path.join(process.cwd(), 'data', 'regions.sulsel.json');
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`Saved to ${filePath}`);
    
  } catch(e) {
    console.error(e);
  }
}

run();
