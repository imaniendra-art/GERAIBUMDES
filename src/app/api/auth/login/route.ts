import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
    }

    // Cek status verifikasi untuk BUMDes Admin (sebelum cek password agar lebih informatif)
    if (user.role === "BUMDES_ADMIN") {
      const profile = await BumdesProfile.findOne({ 
        $or: [
          { userId: user._id },
          { userId: user._id.toString() }
        ]
      });
      if (profile) {
        if (profile.verificationStatus === "PENDING_VERIFICATION") {
          return NextResponse.json({ error: "Pendaftaran BUMDes Anda sedang diverifikasi oleh Admin. Mohon menunggu beberapa saat untuk proses pengecekan data." }, { status: 403 });
        }
        if (profile.verificationStatus === "REJECTED") {
          return NextResponse.json({ error: `Pendaftaran BUMDes Anda ditolak. ${profile.rejectionReason ? `Alasan: ${profile.rejectionReason}` : 'Silakan hubungi Admin untuk informasi lebih lanjut.'}` }, { status: 403 });
        }
      }
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
    }

    // Set JWT HTTPOnly Cookie
    await createSession(user._id.toString(), user.role, user.email);

    return NextResponse.json({ message: "Login berhasil", role: user.role });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}
