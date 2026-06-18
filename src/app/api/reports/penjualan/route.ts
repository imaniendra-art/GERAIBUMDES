import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import BumdesProfile from "@/models/BumdesProfile";
import Store from "@/models/Store";
import { exportOrdersToCSV } from "@/lib/reports";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BUMDES_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const profile = await BumdesProfile.findOne({ userId: session.userId });
    if (!profile) return new NextResponse("Profile not found", { status: 404 });

    const store = await Store.findOne({ bumdesId: profile._id });
    if (!store) return new NextResponse("Store not found", { status: 404 });

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    const query: any = { sellerStoreId: store._id };

    if (status && status !== "ALL") query.status = status;
    if (paymentStatus && paymentStatus !== "ALL") query.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    const csvContent = exportOrdersToCSV(orders);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="laporan_penjualan_${store.slug}_${Date.now()}.csv"`
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
