import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import { createSession } from "@/lib/auth";
import { logAdminActivity } from "@/lib/adminLogger";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // Extract Client IP for Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown-ip";

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email dan kata sandi wajib diisi." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitKey = `login:${clientIp}:${normalizedEmail}`;

    // Rate Limiting: Max 5 failed attempts per 15 minutes
    const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateCheck.success) {
      const waitMinutes = Math.ceil((rateCheck.resetTime - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan masuk gagal. Silakan coba lagi dalam ${waitMinutes} menit.` },
        { status: 429 }
      );
    }

    await dbConnect();

    // Query user explicitly requesting passwordHash since select: false in schema
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

    // Generic rejection timing to prevent account enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
    }

    // 1. MUST verify password credentials first before exposing any account state
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
    }

    // 2. Only after password matches, check BUMDes verification status
    if (user.role === "BUMDES_ADMIN") {
      const profile = await BumdesProfile.findOne({
        $or: [
          { userId: user._id },
          { userId: user._id.toString() }
        ]
      });

      if (profile) {
        if (profile.verificationStatus === "PENDING_VERIFICATION") {
          return NextResponse.json(
            { error: "Pendaftaran BUMDes Anda sedang diverifikasi oleh Admin. Mohon menunggu beberapa saat untuk proses pengecekan data." },
            { status: 403 }
          );
        }
        if (profile.verificationStatus === "REJECTED") {
          return NextResponse.json(
            { error: "Pendaftaran BUMDes Anda memerlukan revisi atau ditolak. Silakan hubungi admin atau periksa menu revisi pendaftaran." },
            { status: 403 }
          );
        }
      }
    }

    // Success: Clear rate limit record
    resetRateLimit(rateLimitKey);

    // Set JWT HTTPOnly Cookie
    await createSession(user._id.toString(), user.role, user.email);

    if (user.role === "SUPER_ADMIN" || user.role === "PLATFORM_ADMIN") {
      await logAdminActivity(
        user._id.toString(),
        "LOGIN",
        user.email,
        "Admin berhasil masuk ke sistem"
      );
    }

    return NextResponse.json({ message: "Login berhasil", role: user.role });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}
