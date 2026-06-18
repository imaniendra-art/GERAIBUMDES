import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Region from "@/models/Region";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const region = await Region.findByIdAndUpdate(params.id, body, { new: true });
    if (!region) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(region);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update region" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const region = await Region.findByIdAndDelete(params.id);
    if (!region) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Region deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete region" }, { status: 500 });
  }
}
