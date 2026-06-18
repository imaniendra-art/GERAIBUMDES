import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BusinessType from "@/models/BusinessType";
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

    const businessTypes = await BusinessType.find(query).sort({ sortOrder: 1, name: 1 });
    return NextResponse.json(businessTypes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch business types" }, { status: 500 });
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
    
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const businessType = await BusinessType.create(body);
    return NextResponse.json(businessType, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create business type" }, { status: 500 });
  }
}
