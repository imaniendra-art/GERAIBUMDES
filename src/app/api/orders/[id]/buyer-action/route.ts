import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

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
        return NextResponse.json({ error: "Pesanan belum dapat diselesaikan. Pastikan statusnya sudah dikirim atau siap diambil." }, { status: 400 });
      }

      if (!receiptProofUrl) {
        return NextResponse.json({ error: "Bukti penerimaan barang (foto) wajib diunggah." }, { status: 400 });
      }

      order.status = "COMPLETED";
      order.completedAt = new Date();
      order.receiptProofUrl = receiptProofUrl;
      await order.save();

      return NextResponse.json({ success: true, order });
    } else {
      return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Buyer action error:", error);
    return NextResponse.json({ error: "Gagal memproses aksi pembeli" }, { status: 500 });
  }
}
