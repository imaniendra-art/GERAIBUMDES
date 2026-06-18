import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Region from "@/models/Region";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get("admin") === "true";

    let query = {};
    if (!admin) {
      query = { isActive: true };
    }

    const regions = await Region.find(query).sort({ sortOrder: 1, province: 1, regency: 1 });
    return NextResponse.json(regions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch regions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const region = await Region.create(body);
    return NextResponse.json(region, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create region" }, { status: 500 });
  }
}
