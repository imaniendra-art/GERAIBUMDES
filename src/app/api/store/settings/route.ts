import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BUMDES_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Verify BumdesProfile
    const profile = await BumdesProfile.findOne({ userId: session.userId });
    if (!profile || profile.verificationStatus !== "VERIFIED") {
      return NextResponse.json({ error: "BUMDes profile not verified" }, { status: 403 });
    }

    // Find Store
    const store = await Store.findOne({ bumdesId: profile._id });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const body = await req.json();
    console.log("BODY DARI CLIENT:", body);
    console.log("Google Maps URL dari client:", body.googleMapsUrl);

    // Basic Validation
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Nama toko wajib diisi" }, { status: 400 });
    }

    // Bank Validation
    if (body.bankAccount?.bankAccountNumber) {
      if (body.bankAccount.bankAccountNumber.length < 5) {
        return NextResponse.json({ error: "Nomor rekening minimal 5 digit" }, { status: 400 });
      }
      if (!body.bankAccount.bankName || body.bankAccount.bankName.trim() === "") {
        return NextResponse.json({ error: "Nama bank wajib diisi jika nomor rekening diisi" }, { status: 400 });
      }
      if (!body.bankAccount.bankAccountHolderName || body.bankAccount.bankAccountHolderName.trim() === "") {
        return NextResponse.json({ error: "Nama pemilik rekening wajib diisi jika nomor rekening diisi" }, { status: 400 });
      }
    }

    // Update Store fields
    store.name = body.name;
    if (body.description !== undefined) store.description = body.description;
    if (body.logoUrl !== undefined) store.logoUrl = body.logoUrl;
    if (body.bannerUrl !== undefined) store.bannerUrl = body.bannerUrl;
    if (body.phoneNumber !== undefined) store.phoneNumber = body.phoneNumber;
    if (body.whatsappNumber !== undefined) store.whatsappNumber = body.whatsappNumber;
    if (body.address !== undefined) store.address = body.address;
    if (body.googleMapsUrl !== undefined) store.googleMapsUrl = body.googleMapsUrl;
    if (body.directorName !== undefined) store.directorName = body.directorName;
    if (body.villageHeadName !== undefined) store.villageHeadName = body.villageHeadName;
    if (body.nib !== undefined) store.nib = body.nib;
    if (body.village !== undefined) store.village = body.village;
    if (body.villageCode !== undefined) store.villageCode = body.villageCode;
    if (body.district !== undefined) store.district = body.district;
    if (body.districtCode !== undefined) store.districtCode = body.districtCode;
    if (body.regency !== undefined) store.regency = body.regency;
    if (body.regencyCode !== undefined) store.regencyCode = body.regencyCode;
    if (body.province !== undefined) store.province = body.province;
    if (body.provinceCode !== undefined) store.provinceCode = body.provinceCode;
    if (body.businessType !== undefined) store.businessType = body.businessType;
    if (body.operationalHours !== undefined) store.operationalHours = body.operationalHours;
    if (body.paymentInstructions !== undefined) store.paymentInstructions = body.paymentInstructions;

    // Update Bank Account
    if (body.bankAccount) {
      store.bankAccount = {
        bankName: body.bankAccount.bankName,
        bankAccountNumber: body.bankAccount.bankAccountNumber,
        bankAccountHolderName: body.bankAccount.bankAccountHolderName,
        paymentNote: body.bankAccount.paymentNote,
      };
    }

    await store.save();

    // Pastikan konsistensi koleksi data
    if (profile.name !== body.name) {
      profile.name = body.name;
      await profile.save();
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/bumdes");
    revalidatePath("/admin/akun");
    revalidatePath("/dashboard/toko/edit");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, store });
  } catch (error: any) {
    console.error("Update store settings error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
