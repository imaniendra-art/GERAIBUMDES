import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { type, ...data } = body;

    // Common Validation
    if (!data.name || !data.email || !data.password || !data.phoneNumber) {
      return NextResponse.json({ error: "Kolom wajib belum diisi." }, { status: 400 });
    }

    if (data.password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    if (type === "CUSTOMER") {
      const user = await User.create({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        address: data.address,
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
         return NextResponse.json({ error: "Data BUMDes tidak lengkap." }, { status: 400 });
      }

      // Generate base slug
      const baseSlug = bumdesName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let slug = baseSlug;
      let counter = 1;
      
      while (await Store.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create User
      const user = await User.create({
        name: data.name, // Nama pengelola
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        role: "BUMDES_ADMIN",
      });

      // Create BumdesProfile
      const bumdesProfile = await BumdesProfile.create({
        userId: user._id,
        name: bumdesName,
        directorName: data.name,
        contactNumber: data.phoneNumber,
        village,
        district,
        regency,
        province,
        businessType,
        description,
        verificationStatus: "PENDING_VERIFICATION",
      });

      // Create Store
      await Store.create({
        bumdesId: bumdesProfile._id,
        name: bumdesName,
        slug,
        description,
        status: "PENDING",
      });

      return NextResponse.json({ message: "Registrasi BUMDes berhasil, menunggu verifikasi." }, { status: 201 });
      
    } else {
      return NextResponse.json({ error: "Tipe registrasi tidak valid." }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}
