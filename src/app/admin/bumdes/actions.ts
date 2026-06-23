"use server";

import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import Product from "@/models/Product";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAdminActivity } from "@/lib/adminLogger";

export async function deleteBumdesProfile(bumdesId: string) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    
    const profile = await BumdesProfile.findById(bumdesId);
    if (!profile) {
      return { success: false, error: "BUMDes tidak ditemukan." };
    }

    const store = await Store.findOne({ bumdesId });
    if (store) {
      const productCount = await Product.countDocuments({ storeId: store._id });
      if (productCount > 0) {
        return { success: false, error: `BUMDes masih memiliki ${productCount} produk aktif. Harap hapus produk terlebih dahulu.` };
      }
      
      await Store.findByIdAndDelete(store._id);
    }
    
    await BumdesProfile.findByIdAndDelete(bumdesId);
    
    if (profile.userId) {
      await User.findByIdAndDelete(profile.userId);
    }

    await logAdminActivity(
      session.userId,
      "DELETE_BUMDES",
      profile.name,
      `Menghapus BUMDes beserta akun pengelolanya: ${profile.name}`
    );

    revalidatePath("/admin/bumdes");
    return { success: true, message: "BUMDes dan akun terkait berhasil dihapus." };
  } catch (error: any) {
    console.error("Error deleting BUMDes:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat menghapus BUMDes." };
  }
}

export async function updateBumdesProfile(bumdesId: string, formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    
    const name = formData.get("name") as string;
    const directorName = formData.get("directorName") as string;
    const contactNumber = formData.get("contactNumber") as string;
    const description = formData.get("description") as string;

    const profile = await BumdesProfile.findByIdAndUpdate(
      bumdesId,
      {
        name,
        directorName,
        contactNumber,
        description
      },
      { new: true }
    );

    if (!profile) {
      return { success: false, error: "BUMDes tidak ditemukan." };
    }

    await logAdminActivity(
      session.userId,
      "UPDATE_BUMDES",
      profile.name,
      `Memperbarui profil BUMDes: ${profile.name}`
    );

    revalidatePath("/admin/bumdes");
    revalidatePath(`/admin/bumdes/${bumdesId}`);
    return { success: true, message: "Profil BUMDes berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updating BUMDes:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat memperbarui BUMDes." };
  }
}
