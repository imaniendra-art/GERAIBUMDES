"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import { getSession } from "@/lib/auth";

export async function addBumdesAccount(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
      return { success: false, error: "Tidak memiliki otorisasi." };
    }

    await dbConnect();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;
    const bumdesName = formData.get("bumdesName") as string;

    if (!name || !email || !phoneNumber || !password || !bumdesName) {
      return { success: false, error: "Harap lengkapi semua kolom yang wajib diisi." };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar di sistem." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate slug
    const baseSlug = bumdesName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    
    while (await Store.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 1. Create User
    const user = await User.create({
      name,
      email,
      phoneNumber,
      passwordHash,
      role: "BUMDES_ADMIN",
    });

    // 2. Create BumdesProfile with placeholder data
    const bumdesProfile = await BumdesProfile.create({
      userId: user._id,
      name: bumdesName,
      directorName: name,
      contactNumber: phoneNumber,
      province: "-",
      regency: "-",
      district: "-",
      village: "-",
      businessType: "Belum diatur",
      description: "Profil belum dilengkapi oleh pengelola.",
      verificationStatus: "VERIFIED",
    });

    // 3. Create Store
    await Store.create({
      bumdesId: bumdesProfile._id,
      name: bumdesName,
      slug,
      description: "Profil toko belum dilengkapi oleh pengelola.",
      status: "ACTIVE",
    });

    revalidatePath("/admin/akun");
    return { success: true };
  } catch (error: any) {
    console.error("Add BUMDes Account error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem." };
  }
}
