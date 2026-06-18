import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BusinessType from "@/models/BusinessType";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    const businessType = await BusinessType.findByIdAndUpdate(params.id, body, { new: true });
    if (!businessType) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(businessType);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update business type" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const businessType = await BusinessType.findByIdAndDelete(params.id);
    if (!businessType) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Business type deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete business type" }, { status: 500 });
  }
}
