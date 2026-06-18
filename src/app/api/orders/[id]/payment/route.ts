import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { paymentProofUrl } = body;

    if (!paymentProofUrl) {
      return NextResponse.json({ error: "URL bukti pembayaran diperlukan" }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findOne({ _id: resolvedParams.id, buyerId: session.userId });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.status !== "WAITING_PAYMENT" && order.paymentStatus !== "REJECTED") {
      return NextResponse.json({ error: "Status pesanan tidak mengizinkan unggah bukti bayar saat ini." }, { status: 400 });
    }

    order.paymentProofUrl = paymentProofUrl;
    order.paymentProofUploadedAt = new Date();
    order.paymentStatus = "WAITING_REVIEW";
    order.status = "PAYMENT_REVIEW";

    await order.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Upload payment proof error:", error);
    return NextResponse.json({ error: "Gagal mengunggah bukti pembayaran" }, { status: 500 });
  }
}
