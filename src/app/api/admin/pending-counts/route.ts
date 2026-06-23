import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const [bumdesCount, productCount] = await Promise.all([
      BumdesProfile.countDocuments({ verificationStatus: "PENDING_VERIFICATION" }),
      Product.countDocuments({ status: "WAITING_APPROVAL" })
    ]);

    return NextResponse.json({ bumdesCount, productCount });
  } catch (error) {
    console.error("Error fetching pending counts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
