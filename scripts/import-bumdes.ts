import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../src/models/User";
import BumdesProfile from "../src/models/BumdesProfile";
import Store from "../src/models/Store";

dotenv.config();

const rawDataBumdes = [
  "Pemerintah Desa Sarangtiung, Kec. Pulau Laut Sigam, Kab Kota Baru, Prov Kalimantan Selatan\tMuhammad Yohanis\tSarangtiun@gmail.com",
  "Pemerintah Desa Tirawan, Kec. Pulau Laut Sigam, Kab Kota Baru, Prov Kalimantan Selatan\tSabrani\ttirawan@gmail.com",
  "Pemerintah Desa Hilir Muara, Kec. Pulau Laut Sigam, Kab Kota Baru, Prov Kalimantan Selatan\tUsman Pahero\tlinirmuara@gmail.com",
  "Bumdes Desa Jono Kalora, Kec. Parigi Barat\tHamlin, S.Pd\tjonokalora@gmail.com",
  "Bumdes Desa Gangga\tRatles Kawainda\tgangga@gmail.com",
  "Bumdes Desa Laemanta Kecamatan Kasimbar Parigi\tIsmail\tlaemanta@gmail.com",
  "Bumdes Amanah Desa Compong\tEgy Sunardi Nurdin, S.Pd., M.Si\tamanahbumdes@gmail.com",
  "Bumdes Buae\tIr. H. Laupe Umar\tbumbuae@gmail.com",
  "Bumdes Sipatokkong Padang Loang Alau\tAbdurrahman\tsipatokkong@gmail.com",
  "Bumdes Bumi Paccelekang Sejahtera\tArifin Nukman\tbumipaccelekang@gmail.com",
  "Bumdes Dinaril Desa Sudirman\tNurbaya\tdinaril@gmail.com"
];

const suffixes = ["Jaya", "Sejahtera", "Makmur", "Mandiri", "Bersama"];

// Fungsi pintar mengekstrak nama BUMDes
function extractBumdesName(rawRegion: string) {
  // Ambil teks sebelum koma pertama jika ada koma (untuk membuang teks Kec, Kab, Prov)
  let cleanName = rawRegion.split(',')[0].trim();
  
  // Buang tulisan seperti "Kecamatan...", "Kec...", "Kab...", "Prov..." ke belakang jika tidak ada koma
  cleanName = cleanName.replace(/(Kecamatan|Kec\.|Kab|Prov).*$/i, '').trim();
  
  const lowerName = cleanName.toLowerCase();
  
  // Jika teksnya sudah mengandung nama spesifik BUMDes
  if (lowerName.includes("bumdes ")) {
    // Kembalikan aslinya namun bersihkan kata "Desa" yang nyelip di tengah
    // Contoh: "Bumdes Amanah Desa Compong" -> "Bumdes Amanah Compong"
    return cleanName.replace(/\bDesa\b/ig, '').replace(/\s+/g, ' ').trim();
  }
  
  // Jika tidak ada kata Bumdes (contoh format: "Pemerintah Desa Sarangtiung")
  // Buang kata awalan administrasi
  let baseName = cleanName.replace(/^(Pemerintah\s+)?(Desa|Kelurahan|Kel\.|Ds\.)\s+/i, '').trim();
  
  // Tambahkan awalan "BUMDes" dan akhiran kata sifat acak
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `BUMDes ${baseName} ${randomSuffix}`;
}

// Helper slug generator
async function generateUniqueSlug(baseSlug: string) {
  let slug = baseSlug;
  let counter = 1;
  while (await Store.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    console.log(`Processing ${rawDataBumdes.length} rows of BUMDes data...\n`);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("bumdes123", salt);

    for (let i = 0; i < rawDataBumdes.length; i++) {
      const line = rawDataBumdes[i];
      const parts = line.split('\t');

      if (parts.length < 3) {
        console.warn(`[WARN] Row ${i + 1} skipped: Invalid format. Expected 3 columns separated by Tab.`);
        continue;
      }

      const rawLocation = parts[0].trim();
      const managerName = parts[1].trim();
      const email = parts[2].trim().toLowerCase();

      try {
        // Cek jika email sudah ada (skip)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          console.log(`[SKIP] User with email ${email} already exists.`);
          continue;
        }

        const storeName = extractBumdesName(rawLocation);
        
        // 1. Create User
        // Menggunakan role "BUMDES_ADMIN" sesuai skema Enum database
        const newUser = new User({
          name: managerName,
          email: email,
          passwordHash: passwordHash,
          phoneNumber: "-", 
          role: "BUMDES_ADMIN"
        });
        await newUser.save();

        // 2. Create BumdesProfile
        // Menggunakan verificationStatus: "VERIFIED" sesuai instruksi dan skema
        const newProfile = new BumdesProfile({
          userId: newUser._id,
          name: storeName,
          village: rawLocation.substring(0, 50), // Fallback village name
          district: "-",
          regency: "-",
          province: "-",
          businessType: "Lainnya",
          description: "Profil BUMDes dibuat melalui import massal otomatis.",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          directorName: managerName,
          contactNumber: "-"
        });
        await newProfile.save();

        // 3. Create Store
        // Menggunakan status: "ACTIVE" sesuai skema enum
        const baseSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const uniqueSlug = await generateUniqueSlug(baseSlug);

        const newStore = new Store({
          bumdesId: newProfile._id,
          name: storeName,
          slug: uniqueSlug,
          description: `Selamat datang di profil resmi ${storeName}. Kami hadir untuk memajukan ekonomi desa dan melayani kebutuhan operasional mitra B2B Anda.`,
          directorName: managerName,
          status: "ACTIVE"
        });
        await newStore.save();

        console.log(`[SUCCESS] Created: ${storeName.padEnd(40, ' ')} | Email: ${email}`);
      } catch (err) {
         console.error(`[ERROR] Failed to process row ${i+1}: ${email}`, err);
      }
    }

    console.log("\n✅ Bulk import completed successfully.");
  } catch (error) {
    console.error("Fatal error during import:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

main();
