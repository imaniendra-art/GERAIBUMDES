"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    revalidatePath("/admin/akun");
    return { success: true, message: "Akun berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Gagal menghapus akun" };
  }
}
