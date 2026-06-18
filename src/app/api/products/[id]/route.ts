import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getSession();
    if (!session || session.role !== "BUMDES_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const profile = await BumdesProfile.findOne({ userId: session.userId });
    const store = await Store.findOne({ bumdesId: profile?._id });

    if (!store) {
      return NextResponse.json({ error: "Toko tidak ditemukan." }, { status: 404 });
    }

    const product = await Product.findOne({ _id: resolvedParams.id, createdBy: session.userId });
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan atau bukan milik Anda." }, { status: 404 });
    }

    const data = await req.json();

    // If updating status to DRAFT or INACTIVE
    if (data.status) {
      if (["DRAFT", "INACTIVE"].includes(data.status)) {
        product.status = data.status;
      } else {
        // Can only resubmit for approval if it was Draft or Inactive
        product.status = "WAITING_APPROVAL";
      }
    }

    // Update other fields
    const fieldsToUpdate = [
      "name", "categoryId", "description", "retailPrice", "minOrder", 
      "unit", "stock", "images", "isWholesaleAvailable", 
      "wholesalePriceTiers", "locationText", "shippingNotes"
    ];

    for (const field of fieldsToUpdate) {
      if (data[field] !== undefined) {
        product[field] = data[field];
      }
    }

    product.updatedBy = session.userId;
    product._id = resolvedParams.id; // ensure ID is preserved
    await product.save();

    return NextResponse.json({ message: "Produk berhasil diperbarui", product });
  } catch (error: unknown) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await dbConnect();
    const product = await Product.findById(resolvedParams.id);
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
  }
}
