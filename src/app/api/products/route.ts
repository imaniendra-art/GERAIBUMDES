import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BUMDES_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Check verification status
    const profile = await BumdesProfile.findOne({ userId: session.userId });
    const store = await Store.findOne({ bumdesId: profile?._id });

    if (!profile || profile.verificationStatus !== "VERIFIED" || !store || store.status !== "ACTIVE") {
      return NextResponse.json({ error: "BUMDes belum terverifikasi atau toko tidak aktif." }, { status: 403 });
    }

    const data = await req.json();

    // Basic Validation
    if (!data.name || !data.categoryId || !data.description || !data.retailPrice || !data.unit || !data.locationText) {
      return NextResponse.json({ error: "Data wajib belum diisi." }, { status: 400 });
    }

    if (data.retailPrice < 1 || data.minOrder < 1 || data.stock < 0) {
      return NextResponse.json({ error: "Harga, minimal order, atau stok tidak valid." }, { status: 400 });
    }

    if (data.isWholesaleAvailable) {
      if (!data.wholesalePriceTiers || data.wholesalePriceTiers.length === 0) {
        return NextResponse.json({ error: "Harga grosir harus memiliki minimal 1 tingkatan." }, { status: 400 });
      }
      for (const tier of data.wholesalePriceTiers) {
        if (tier.minQty < 1 || tier.price < 1) {
          return NextResponse.json({ error: "Tier grosir tidak valid." }, { status: 400 });
        }
        if (tier.maxQty && tier.maxQty < tier.minQty) {
          return NextResponse.json({ error: "Maksimal kuantitas tidak boleh kurang dari minimal kuantitas." }, { status: 400 });
        }
      }
    }

    // Generate Slug
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newProduct = await Product.create({
      storeId: store._id,
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description,
      retailPrice: data.retailPrice,
      minOrder: data.minOrder || 1,
      unit: data.unit,
      stock: data.stock || 0,
      images: data.images || [],
      isWholesaleAvailable: data.isWholesaleAvailable,
      wholesalePriceTiers: data.isWholesaleAvailable ? data.wholesalePriceTiers : [],
      locationText: data.locationText,
      shippingNotes: data.shippingNotes,
      status: "WAITING_APPROVAL",
      createdBy: session.userId,
    });

    return NextResponse.json({ message: "Produk berhasil ditambahkan dan menunggu verifikasi", productId: newProduct._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create Product Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}
