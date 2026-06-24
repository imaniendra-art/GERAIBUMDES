"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import Product from "@/models/Product";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAdminActivity } from "@/lib/adminLogger";

export async function resetUserPassword(userId: string) {
  const session = await getSession();
  
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    const newPasswordHash = await bcrypt.hash("12345678", 10);
    
    const user = await User.findByIdAndUpdate(userId, {
      passwordHash: newPasswordHash
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    revalidatePath("/admin/akun");
    return { success: true, message: `Password berhasil direset menjadi: 12345678` };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Gagal mereset password" };
  }
}

export async function deleteUserAccount(userId: string) {
  const session = await getSession();
  
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    
    // Temukan profil BUMDes terkait pengguna
    const profile = await BumdesProfile.findOne({ userId });
    
    if (profile) {
      // Temukan toko terkait
      const store = await Store.findOne({ bumdesId: profile._id });
      
      if (store) {
        // Hapus semua produk di toko tersebut
        await Product.deleteMany({ storeId: store._id });
        
        // Hapus toko
        await Store.findByIdAndDelete(store._id);
      }
      
      // Hapus profil BUMDes
      await BumdesProfile.findByIdAndDelete(profile._id);
    }
    
    // Akhirnya hapus akun pengguna itu sendiri
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await logAdminActivity(
      session.userId, 
      "DELETE_ACCOUNT", 
      user.email, 
      `Menghapus akun beserta data terkait: ${user.name} (${user.role})`
    );

    revalidatePath("/admin/akun");
    return { success: true, message: "Akun berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Gagal menghapus akun" };
  }
}

export async function addAdminAccount(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return { success: false, error: "Hanya SUPER_ADMIN yang dapat menambahkan admin baru." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !phoneNumber || !password || !role) {
    return { success: false, error: "Semua kolom wajib diisi." };
  }

  if (role !== "SUPER_ADMIN" && role !== "PLATFORM_ADMIN") {
    return { success: false, error: "Role tidak valid." };
  }

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      phoneNumber,
      passwordHash,
      role,
    });

    const { logAdminActivity } = await import("@/lib/adminLogger");
    await logAdminActivity(session.userId, "ADD_ADMIN", email, `Menambahkan admin baru: ${name} (${role})`);

    revalidatePath("/admin/akun");
    return { success: true, message: "Akun admin berhasil ditambahkan." };
  } catch (error: any) {
    console.error("Error adding admin:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat menambahkan admin." };
  }
}

export async function editUserAccount(userId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return { success: false, error: "Hanya SUPER_ADMIN yang dapat mengedit akun." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !phoneNumber || !role) {
    return { success: false, error: "Semua kolom wajib diisi." };
  }

  try {
    await dbConnect();

    // Pastikan email belum dipakai user lain
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return { success: false, error: "Email sudah digunakan oleh pengguna lain." };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      name,
      email,
      phoneNumber,
      role
    }, { new: true });

    if (!updatedUser) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    const { logAdminActivity } = await import("@/lib/adminLogger");
    await logAdminActivity(session.userId, "EDIT_ACCOUNT", email, `Mengubah detail akun: ${name} (${role})`);

    revalidatePath("/admin/akun");
    return { success: true, message: "Akun berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error editing account:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat memperbarui akun." };
  }
}
