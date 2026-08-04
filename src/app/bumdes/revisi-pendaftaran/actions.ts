"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

export async function submitRevision(formData: any) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BUMDES_ADMIN") {
      return { success: false, error: "Tidak memiliki akses." };
    }

    await dbConnect();
    
    // Validate profile exists and is REJECTED
    const profile = await BumdesProfile.findOne({ userId: session.userId });
    if (!profile) {
      return { success: false, error: "Profil BUMDes tidak ditemukan." };
    }
    if (profile.verificationStatus !== "REJECTED") {
      return { success: false, error: "Status BUMDes bukan REJECTED." };
    }

    const {
      name, // director name
      phoneNumber,
      bumdesName,
      village,
      district,
      regency,
      province,
      villageCode,
      districtCode,
      regencyCode,
      provinceCode,
      businessType,
      description,
    } = formData;

    // Basic validation
    if (!name || !phoneNumber || !bumdesName || !village || !district || !regency || !province || !businessType || !description) {
      return { success: false, error: "Pastikan semua field wajib telah diisi." };
    }

    // 1. Update User (if name or phone changed)
    await User.findByIdAndUpdate(session.userId, {
      name,
      phoneNumber
    });

    // 2. Update BumdesProfile
    await BumdesProfile.findByIdAndUpdate(profile._id, {
      name: bumdesName,
      directorName: name,
      contactNumber: phoneNumber,
      village,
      district,
      regency,
      province,
      villageCode,
      districtCode,
      regencyCode,
      provinceCode,
      businessType,
      description,
      verificationStatus: "PENDING_VERIFICATION",
      rejectionReason: "", // Clear reason
    });

    // 3. Update Store
    await Store.findOneAndUpdate(
      { bumdesId: profile._id },
      {
        name: bumdesName,
        description,
        village,
        district,
        regency,
        province,
        villageCode,
        districtCode,
        regencyCode,
        provinceCode,
        businessType
        // status remains unchanged (INACTIVE or PENDING)
      }
    );

    revalidatePath("/admin/bumdes");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: any) {
    console.error("submitRevision error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem." };
  }
}
