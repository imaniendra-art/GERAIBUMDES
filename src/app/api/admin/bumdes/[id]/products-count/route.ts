import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import Product from "@/models/Product";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const resolvedParams = await params;
    const bumdesId = resolvedParams.id;

    const store = await Store.findOne({ bumdesId });
    if (!store) {
      return NextResponse.json({ count: 0 });
    }

    const count = await Product.countDocuments({ storeId: store._id });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching products count:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
