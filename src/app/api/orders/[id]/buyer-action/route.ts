import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, receiptProofUrl } = body;

    await dbConnect();

    const order = await Order.findOne({ _id: resolvedParams.id, buyerId: session.userId });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (action === "MARK_COMPLETED") {
      if (!["READY_TO_PICKUP", "SHIPPED_MANUAL"].includes(order.status)) {
        return NextResponse.json({ 
          error: "Pesanan belum dapat diselesaikan. Pastikan statusnya sudah dikirim atau siap diambil." 
        }, { status: 400 });
      }

      if (!receiptProofUrl) {
        return NextResponse.json({ error: "Bukti penerimaan barang (foto) wajib diunggah." }, { status: 400 });
      }

      order.status = "COMPLETED";
      order.completedAt = new Date();
      order.receiptProofUrl = receiptProofUrl;
      await order.save();

      return NextResponse.json({ success: true, order });
    } 
    else if (action === "CANCEL_ORDER") {
      // Buyer can only cancel before payment is submitted
      if (!["WAITING_SELLER_CONFIRMATION", "WAITING_PAYMENT"].includes(order.status)) {
        return NextResponse.json({ 
          error: "Pesanan yang sedang diverifikasi atau sudah diproses tidak dapat dibatalkan langsung." 
        }, { status: 400 });
      }

      // Restore stock back to products
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        }).catch(err => console.error("Error restoring stock on buyer cancel:", err));
      }

      order.status = "CANCELLED";
      order.buyerNote = (order.buyerNote ? order.buyerNote + " | " : "") + "Dibatalkan oleh pembeli.";
      await order.save();

      return NextResponse.json({ success: true, order });
    } 
    else {
      return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Buyer action error:", error);
    return NextResponse.json({ error: "Gagal memproses aksi pembeli" }, { status: 500 });
  }
}
