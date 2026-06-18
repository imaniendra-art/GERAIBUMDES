import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/Store";
import { exportOrdersToCSV } from "@/lib/reports";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    const query: any = {};

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

    const orders = await Order.find(query)
      .populate({ path: "sellerStoreId", model: Store, select: "name slug" })
      .sort({ createdAt: -1 });

    const csvContent = exportOrdersToCSV(orders);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="laporan_admin_semua_transaksi_${Date.now()}.csv"`
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
