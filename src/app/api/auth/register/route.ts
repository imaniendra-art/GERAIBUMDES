import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import { checkRateLimit } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("62")) {
    cleaned = "0" + cleaned.substring(2);
  }
  return cleaned;
}

export async function POST(req: Request) {
  try {
    // Rate Limiting on Registration: Max 10 per hour per IP
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown-ip";
    
    const rateCheck = checkRateLimit(`register:${clientIp}`, 10, 60 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan pendaftaran dari perangkat ini. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const { type, ...data } = body;

    // Common Validation
    if (!data.name || !data.email || !data.password || !data.phoneNumber) {
      return NextResponse.json({ error: "Kolom wajib belum diisi." }, { status: 400 });
    }

    const normalizedEmail = String(data.email).trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json({ error: "Format alamat email tidak valid." }, { status: 400 });
    }

    if (typeof data.password !== "string" || data.password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    // 1. Email Uniqueness Check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk menggunakan akun Anda." }, { status: 400 });
    }

    // 2. Phone Number / WhatsApp Uniqueness Check
    const trimmedPhone = String(data.phoneNumber).trim();
    const cleanPhone = normalizePhone(trimmedPhone);
    const existingPhone = await User.findOne({
      phoneNumber: {
        $in: [
          trimmedPhone,
          cleanPhone,
          `62${cleanPhone.replace(/^0/, "")}`,
          `+62${cleanPhone.replace(/^0/, "")}`,
        ],
      },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          error: `Nomor telepon/WhatsApp (${trimmedPhone}) sudah terdaftar pada akun lain. Silakan gunakan nomor aktif lainnya atau masuk ke akun Anda.`,
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const trimmedName = String(data.name).trim();
    const trimmedAddress = data.address ? String(data.address).trim() : "";

    if (type === "CUSTOMER") {
      const user = await User.create({
        name: trimmedName,
        email: normalizedEmail,
        phoneNumber: trimmedPhone,
        passwordHash,
        address: trimmedAddress,
        role: "CUSTOMER",
      });

      return NextResponse.json({ message: "Registrasi customer berhasil", userId: user._id }, { status: 201 });
      
    } else if (type === "BUMDES_ADMIN") {
      // Validate BUMDes specific fields
      const {
        bumdesName,
        village,
        district,
        regency,
        province,
        businessType,
        description,
      } = data;

      if (!bumdesName || !village || !district || !regency || !province || !businessType || !description) {
         return NextResponse.json({ error: "Data profil BUMDes tidak lengkap." }, { status: 400 });
      }

      const trimmedBumdesName = String(bumdesName).trim();
      const normVillage = String(village).trim();
      const normDistrict = String(district).trim();
      const normRegency = String(regency).trim();
      const normProvince = String(province).trim();

      // 3. "1 Desa 1 BUMDes" Legal Rule Check (Peraturan Pemerintah/UU Desa)
      const existingVillageBumdes = await BumdesProfile.findOne({
        village: { $regex: new RegExp(`^${normVillage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        district: { $regex: new RegExp(`^${normDistrict.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        regency: { $regex: new RegExp(`^${normRegency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        verificationStatus: { $ne: "REJECTED" },
      });

      if (existingVillageBumdes) {
        if (existingVillageBumdes.verificationStatus === "PENDING_VERIFICATION") {
          return NextResponse.json(
            {
              error: `BUMDes untuk Desa/Kelurahan ${normVillage} (${existingVillageBumdes.name}) sudah terdaftar dan saat ini sedang menunggu verifikasi Admin. Anda tidak perlu mendaftar ulang.`,
            },
            { status: 409 }
          );
        }
        if (existingVillageBumdes.verificationStatus === "VERIFIED") {
          return NextResponse.json(
            {
              error: `BUMDes untuk Desa/Kelurahan ${normVillage} sudah aktif terdaftar di GeraiBumdes. Silakan masuk dengan akun pengelola desa Anda atau hubungi layanan bantuan jika Anda pengurus resmi yang baru.`,
            },
            { status: 409 }
          );
        }
      }

      // 4. Same BUMDes Name in the Same Regency Check
      const existingNameInRegency = await BumdesProfile.findOne({
        name: { $regex: new RegExp(`^${trimmedBumdesName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        regency: { $regex: new RegExp(`^${normRegency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        verificationStatus: { $ne: "REJECTED" },
      });

      if (existingNameInRegency) {
        return NextResponse.json(
          {
            error: `BUMDes dengan nama "${trimmedBumdesName}" sudah terdaftar di ${normRegency}. Mohon gunakan nama resmi BUMDes Anda atau periksa kembali data pendaftaran.`,
          },
          { status: 409 }
        );
      }

      // 5. Store Slug Uniqueness (No silent -1 counter)
      const baseSlug = trimmedBumdesName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const existingStore = await Store.findOne({ slug: baseSlug });
      if (existingStore) {
        return NextResponse.json(
          {
            error: `Toko/BUMDes dengan nama serupa ("${trimmedBumdesName}") sudah ada di platform. Harap tambahkan nama spesifik desa Anda (contoh: "${trimmedBumdesName} ${normVillage}").`,
          },
          { status: 409 }
        );
      }

      // Create User
      const user = await User.create({
        name: trimmedName,
        email: normalizedEmail,
        phoneNumber: trimmedPhone,
        passwordHash,
        role: "BUMDES_ADMIN",
      });

      // Create BumdesProfile
      const bumdesProfile = await BumdesProfile.create({
        userId: user._id,
        name: trimmedBumdesName,
        directorName: trimmedName,
        contactNumber: trimmedPhone,
        village: normVillage,
        district: normDistrict,
        regency: normRegency,
        province: normProvince,
        businessType,
        description: String(description).trim(),
        verificationStatus: "PENDING_VERIFICATION",
      });

      // Create Store
      await Store.create({
        bumdesId: bumdesProfile._id,
        name: trimmedBumdesName,
        slug: baseSlug,
        description: String(description).trim(),
        status: "PENDING",
      });

      return NextResponse.json({ message: "Registrasi BUMDes berhasil, menunggu verifikasi." }, { status: 201 });
      
    } else {
      return NextResponse.json({ error: "Tipe registrasi tidak valid." }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem saat mendaftar." }, { status: 500 });
  }
}
