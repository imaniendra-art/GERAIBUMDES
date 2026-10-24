"use server";

import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAdminActivity } from "@/lib/adminLogger";

export async function deleteOrder(orderId: string) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
    return { success: false, error: "Unauthorized. Anda tidak memiliki akses untuk menghapus transaksi." };
  }

  try {
    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    const orderNumber = order.orderNumber;
    const orderTotal = order.total;

    await Order.findByIdAndDelete(orderId);

    await logAdminActivity(
      session.userId,
      "DELETE_ORDER",
      orderNumber,
      `Menghapus transaksi pesanan ${orderNumber} (Total: Rp ${orderTotal?.toLocaleString("id-ID") || 0})`
    );

    revalidatePath("/admin/pesanan");
    revalidatePath("/admin/laporan/transaksi");
    revalidatePath("/admin");
    return { success: true, message: `Pesanan ${orderNumber} berhasil dihapus.` };
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat menghapus pesanan." };
  }
}
