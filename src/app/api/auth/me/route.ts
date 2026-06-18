import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.userId).select("-passwordHash");
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // If BUMDES_ADMIN, fetch verification status
    let bumdesInfo = null;
    if (user.role === "BUMDES_ADMIN") {
      const profile = await BumdesProfile.findOne({ userId: user._id });
      if (profile) {
        bumdesInfo = {
          verificationStatus: profile.verificationStatus,
          bumdesId: profile._id,
        };
      }
    }

    return NextResponse.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...bumdesInfo,
      } 
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}
