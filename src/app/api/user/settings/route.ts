import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    // Validasi input dasar
    if (!body.name || !body.email || !body.phoneNumber) {
      return NextResponse.json({ error: "Nama, Email, dan No HP wajib diisi" }, { status: 400 });
    }

    // Cek apakah email sudah digunakan oleh orang lain
    if (body.email !== user.email) {
      const existingEmail = await User.findOne({ email: body.email });
      if (existingEmail) {
        return NextResponse.json({ error: "Email sudah terdaftar pada akun lain" }, { status: 400 });
      }
    }

    user.name = body.name;
    user.email = body.email;
    user.phoneNumber = body.phoneNumber;

    // Jika password diisi, hash password baru dan update
    if (body.password && body.password.trim() !== "") {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
      }
      user.passwordHash = await bcrypt.hash(body.password, 10);
    }

    await user.save();

    revalidatePath("/dashboard/pengaturan");
    revalidatePath("/admin/akun"); // Update tabel admin juga
    
    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error: any) {
    console.error("Update user settings error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
