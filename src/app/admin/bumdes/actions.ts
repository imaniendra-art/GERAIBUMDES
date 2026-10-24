"use server";

import dbConnect from "@/lib/db";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
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

      // Bersihkan transaksi yang pernah terkait dengan toko BUMDes ini agar tidak menjadi data yatim
      await Order.deleteMany({
        $or: [
          { sellerStoreId: store._id },
          { sellerBumdesProfileId: profile._id }
        ]
      });
      
      await Store.findByIdAndDelete(store._id);
    } else {
      await Order.deleteMany({ sellerBumdesProfileId: profile._id });
    }
    
    await BumdesProfile.findByIdAndDelete(bumdesId);
    
    if (profile.userId) {
      await User.findByIdAndDelete(profile.userId);
    }

    await logAdminActivity(
      session.userId,
      "DELETE_BUMDES",
      profile.name,
      `Menghapus BUMDes beserta akun dan transaksi terkait: ${profile.name}`
    );

    revalidatePath("/admin/bumdes");
    revalidatePath("/admin/pesanan");
    revalidatePath("/admin/laporan/transaksi");
    revalidatePath("/admin");
    return { success: true, message: "BUMDes dan data terkait berhasil dihapus." };
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

export async function verifyBumdes(bumdesId: string) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    const profile = await BumdesProfile.findByIdAndUpdate(bumdesId, {
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
      verifiedBy: session.userId,
    });
    
    if (!profile) return { success: false, error: "BUMDes tidak ditemukan." };
    
    await Store.findOneAndUpdate({ bumdesId: bumdesId }, { status: "ACTIVE" });
    
    await logAdminActivity(
      session.userId,
      "VERIFY_BUMDES",
      profile.name as string,
      `BUMDes ${profile.name} diverifikasi`
    );
    
    revalidatePath("/admin/bumdes");
    revalidatePath(`/admin/bumdes/${bumdesId}`);
    return { success: true, message: "BUMDes berhasil diverifikasi dan diaktifkan." };
  } catch (error: any) {
    console.error("Error verifying BUMDes:", error);
    return { success: false, error: "Terjadi kesalahan saat memverifikasi BUMDes." };
  }
}

export async function rejectBumdes(bumdesId: string, reason: string) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }
  
  if (!reason || reason.trim() === "") {
    return { success: false, error: "Alasan penolakan wajib diisi." };
  }

  try {
    await dbConnect();
    const profile = await BumdesProfile.findByIdAndUpdate(bumdesId, {
      verificationStatus: "REJECTED",
      rejectionReason: reason,
    });
    
    if (!profile) return { success: false, error: "BUMDes tidak ditemukan." };
    
    await Store.findOneAndUpdate({ bumdesId: bumdesId }, { status: "INACTIVE" });
    
    await logAdminActivity(
      session.userId,
      "REJECT_BUMDES",
      profile.name as string,
      `BUMDes ${profile.name} ditolak. Alasan: ${reason}`
    );
    
    revalidatePath("/admin/bumdes");
    revalidatePath(`/admin/bumdes/${bumdesId}`);
    return { success: true, message: "BUMDes berhasil ditolak." };
  } catch (error: any) {
    console.error("Error rejecting BUMDes:", error);
    return { success: false, error: "Terjadi kesalahan saat menolak BUMDes." };
  }
}

export async function suspendBumdes(bumdesId: string, reason: string) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  if (!reason || reason.trim() === "") {
    return { success: false, error: "Alasan penangguhan (suspend) wajib diisi." };
  }

  try {
    await dbConnect();
    const profile = await BumdesProfile.findByIdAndUpdate(
      bumdesId,
      {
        verificationStatus: "SUSPENDED",
        suspensionReason: reason.trim(),
        suspendedAt: new Date(),
        suspendedBy: session.userId,
      },
      { new: true }
    );

    if (!profile) return { success: false, error: "BUMDes tidak ditemukan." };

    // Sembunyikan toko dari marketplace
    await Store.findOneAndUpdate({ bumdesId }, { status: "INACTIVE" });

    await logAdminActivity(
      session.userId,
      "SUSPEND_BUMDES",
      profile.name as string,
      `BUMDes ${profile.name} ditangguhkan (SUSPENDED). Alasan: ${reason}`
    );

    revalidatePath("/admin/bumdes");
    revalidatePath(`/admin/bumdes/${bumdesId}`);
    revalidatePath("/bumdes");
    return { success: true, message: `BUMDes ${profile.name} berhasil ditangguhkan.` };
  } catch (error: any) {
    console.error("Error suspending BUMDes:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat menangguhkan BUMDes." };
  }
}

export async function unsuspendBumdes(bumdesId: string) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    const profile = await BumdesProfile.findByIdAndUpdate(
      bumdesId,
      {
        verificationStatus: "VERIFIED",
        suspensionReason: "",
        suspendedAt: undefined,
        suspendedBy: undefined,
      },
      { new: true }
    );

    if (!profile) return { success: false, error: "BUMDes tidak ditemukan." };

    // Aktifkan kembali toko
    await Store.findOneAndUpdate({ bumdesId }, { status: "ACTIVE" });

    await logAdminActivity(
      session.userId,
      "UNSUSPEND_BUMDES",
      profile.name as string,
      `BUMDes ${profile.name} diaktifkan kembali dari status penangguhan.`
    );

    revalidatePath("/admin/bumdes");
    revalidatePath(`/admin/bumdes/${bumdesId}`);
    revalidatePath("/bumdes");
    return { success: true, message: `BUMDes ${profile.name} berhasil diaktifkan kembali.` };
  } catch (error: any) {
    console.error("Error unsuspending BUMDes:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat mengaktifkan kembali BUMDes." };
  }
}

export async function resetBumdesPassword(bumdesId: string, customPassword?: string) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    const profile = await BumdesProfile.findById(bumdesId);
    if (!profile || !profile.userId) {
      return { success: false, error: "Akun pengelola BUMDes tidak ditemukan." };
    }

    const passwordToSet = customPassword && customPassword.trim().length >= 6 
      ? customPassword.trim() 
      : "12345678";

    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(passwordToSet, 10);

    await User.findByIdAndUpdate(profile.userId, { passwordHash });

    await logAdminActivity(
      session.userId,
      "RESET_PASSWORD_BUMDES",
      profile.name as string,
      `Reset password pengelola BUMDes ${profile.name} menjadi ${passwordToSet}`
    );

    revalidatePath("/admin/bumdes");
    revalidatePath(`/admin/bumdes/${bumdesId}`);
    return { 
      success: true, 
      message: `Password akun pengelola berhasil direset menjadi: ${passwordToSet}` 
    };
  } catch (error: any) {
    console.error("Error resetting BUMDes password:", error);
    return { success: false, error: "Gagal mereset password akun pengelola BUMDes." };
  }
}
