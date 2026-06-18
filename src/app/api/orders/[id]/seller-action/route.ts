import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import BumdesProfile from "@/models/BumdesProfile";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getSession();
    if (!session || session.role !== "BUMDES_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      action, 
      shippingCost, 
      manualShippingNote, 
      verificationStatus, 
      nextStatus,
      shippingProvider,
      trackingNumber,
      shippingContact,
      shippingProofUrl
    } = body;

    await dbConnect();

    // Verify Seller Store
    const profile = await BumdesProfile.findOne({ userId: session.userId });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 403 });

    const store = await Store.findOne({ bumdesId: profile._id });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 403 });

    const order = await Order.findOne({ _id: resolvedParams.id, sellerStoreId: store._id });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (action === "SET_SHIPPING") {
      if (order.status !== "WAITING_SELLER_CONFIRMATION") {
        return NextResponse.json({ error: "Status pesanan tidak valid untuk tindakan ini." }, { status: 400 });
      }
      
      if (typeof shippingCost !== "number" || shippingCost < 0) {
        return NextResponse.json({ error: "Nominal ongkir tidak valid." }, { status: 400 });
      }

      order.shippingCost = shippingCost;
      order.total = order.subtotal + shippingCost;
      order.manualShippingNote = manualShippingNote || "";
      
      order.status = "WAITING_PAYMENT";
      order.confirmedAt = new Date();
    } 
    else if (action === "VERIFY_PAYMENT") {
      if (order.status !== "PAYMENT_REVIEW") {
        return NextResponse.json({ error: "Pesanan tidak dalam status review pembayaran." }, { status: 400 });
      }

      if (verificationStatus === "APPROVE") {
        order.paymentStatus = "PAID";
        order.status = "PROCESSING";
        order.paidAt = new Date();
      } else if (verificationStatus === "REJECT") {
        order.paymentStatus = "REJECTED";
        order.status = "WAITING_PAYMENT"; // Kembali ke waiting payment agar pembeli bisa upload ulang
      } else {
        return NextResponse.json({ error: "Status verifikasi tidak valid." }, { status: 400 });
      }
    }
    else if (action === "UPDATE_STATUS") {
      const allowedNextStatuses = ["SHIPPED_MANUAL", "READY_TO_PICKUP", "COMPLETED"];
      if (!allowedNextStatuses.includes(nextStatus)) {
        return NextResponse.json({ error: "Status tujuan tidak valid." }, { status: 400 });
      }

      // Validasi flow
      if ((nextStatus === "SHIPPED_MANUAL" || nextStatus === "READY_TO_PICKUP") && order.status !== "PROCESSING") {
        return NextResponse.json({ error: "Pesanan harus dalam status PROCESSING sebelum dikirim." }, { status: 400 });
      }

      if (nextStatus === "COMPLETED" && !["SHIPPED_MANUAL", "READY_TO_PICKUP", "PROCESSING"].includes(order.status)) {
        return NextResponse.json({ error: "Pesanan belum dikirim." }, { status: 400 });
      }

      order.status = nextStatus;
      
      if (nextStatus === "SHIPPED_MANUAL" || nextStatus === "READY_TO_PICKUP") {
        order.shippedAt = new Date();
        order.processedAt = order.processedAt || new Date();
        
        if (manualShippingNote !== undefined) order.manualShippingNote = manualShippingNote;
        if (shippingProvider !== undefined) order.shippingProvider = shippingProvider;
        if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
        if (shippingContact !== undefined) order.shippingContact = shippingContact;
        if (shippingProofUrl !== undefined) order.shippingProofUrl = shippingProofUrl;
      }
      
      if (nextStatus === "COMPLETED") {
        order.completedAt = new Date();
      }
    }
    else {
      return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
    }

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Seller action error:", error);
    return NextResponse.json({ error: "Gagal memproses aksi penjual" }, { status: 500 });
  }
}
