import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

async function downloadRegions() {
  console.log("Memulai pengunduhan data wilayah Indonesia dari Emsifa API...");
  
  try {
    const finalData = [];
    
    // 1. Ambil data Provinsi
    console.log("Mengambil data Provinsi...");
    const provinces = await fetchJson(`${BASE_URL}/provinces.json`);
    console.log(`Ditemukan ${provinces.length} Provinsi.`);

    for (const province of provinces) {
      console.log(`\nMengambil Kabupaten/Kota untuk Provinsi: ${province.name}`);
      const regencies = await fetchJson(`${BASE_URL}/regencies/${province.id}.json`);
      
      for (const regency of regencies) {
        // console.log(`  Mengambil Kecamatan untuk: ${regency.name}`);
        const districts = await fetchJson(`${BASE_URL}/districts/${regency.id}.json`);
        
        // Membatasi konkurensi agar tidak membebani server/koneksi
        const batchSize = 10;
        for (let i = 0; i < districts.length; i += batchSize) {
          const districtBatch = districts.slice(i, i + batchSize);
          
          const villagePromises = districtBatch.map(async (district: any) => {
            try {
              const villages = await fetchJson(`${BASE_URL}/villages/${district.id}.json`);
              return villages.map((village: any) => ({
                provinceCode: province.id,
                provinceName: province.name,
                regencyCode: regency.id,
                regencyName: regency.name,
                districtCode: district.id,
                districtName: district.name,
                villageCode: village.id,
                villageName: village.name
              }));
            } catch (err) {
              console.error(`Gagal mengambil desa untuk kecamatan ${district.name}:`, err);
              return [];
            }
          });

          const villageResults = await Promise.all(villagePromises);
          
          villageResults.forEach(villages => {
            finalData.push(...villages);
          });
        }
      }
      console.log(`  Progres sementara: ${finalData.length} desa/kelurahan terkumpul.`);
    }

    console.log(`\nSelesai! Total desa/kelurahan: ${finalData.length}`);
    
    const outputPath = path.resolve(process.cwd(), 'data/regions.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    
    console.log(`\nData berhasil disimpan ke: ${outputPath}`);
    console.log(`Anda sekarang bisa menjalankan: npx tsx scripts/import-regions.ts`);
    
  } catch (error) {
    console.error("Terjadi kesalahan fatal:", error);
  }
}

downloadRegions();
