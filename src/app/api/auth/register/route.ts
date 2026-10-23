import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import { checkRateLimit } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const trimmedName = String(data.name).trim();
    const trimmedPhone = String(data.phoneNumber).trim();
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

      // Generate base slug
      const baseSlug = trimmedBumdesName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let slug = baseSlug;
      let counter = 1;
      
      while (await Store.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
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
        village: String(village).trim(),
        district: String(district).trim(),
        regency: String(regency).trim(),
        province: String(province).trim(),
        businessType,
        description: String(description).trim(),
        verificationStatus: "PENDING_VERIFICATION",
      });

      // Create Store
      await Store.create({
        bumdesId: bumdesProfile._id,
        name: trimmedBumdesName,
        slug,
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
