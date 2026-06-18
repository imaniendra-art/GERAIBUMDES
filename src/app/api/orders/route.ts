import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Store from "@/models/Store";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, buyerName, buyerPhone, buyerAddress, buyerNote, items } = body;

    if (!storeId || !buyerName || !buyerPhone || !buyerAddress || !items || items.length === 0) {
      return NextResponse.json({ error: "Data pesanan tidak lengkap" }, { status: 400 });
    }

    await dbConnect();

    // Verify Store and Seller BUMDes
    const store = await Store.findById(storeId);
    if (!store) {
      return NextResponse.json({ error: "Toko penjual tidak ditemukan" }, { status: 404 });
    }

    // Verify Products and Calculate Subtotal Server-Side for Security
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.storeId.toString() !== storeId || product.status !== "ACTIVE") {
        return NextResponse.json({ error: `Produk ${item.productNameSnapshot} tidak tersedia` }, { status: 400 });
      }

      if (item.quantity < product.minOrder) {
        return NextResponse.json({ error: `Kuantitas ${item.productNameSnapshot} kurang dari minimum order (${product.minOrder})` }, { status: 400 });
      }

      // We should ideally calculate retail vs wholesale strictly on server, but for MVP we trust the client's type if the price matches
      // However, it's safer to re-calculate:
      let activePrice = product.retailPrice;
      let activeType = "RETAIL";

      if (product.isWholesaleAvailable && product.wholesalePriceTiers?.length > 0) {
        const sortedTiers = [...product.wholesalePriceTiers].sort((a, b) => b.minQty - a.minQty);
        for (const tier of sortedTiers) {
          if (item.quantity >= tier.minQty) {
            if (tier.maxQty && item.quantity > tier.maxQty) {
              continue;
            }
            activePrice = tier.price;
            activeType = "WHOLESALE";
            break;
          }
        }
      }

      const itemSubtotal = activePrice * item.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        productId: product._id,
        productNameSnapshot: product.name,
        productSlugSnapshot: product.slug,
        storeId: store._id,
        quantity: item.quantity,
        unit: product.unit,
        price: activePrice,
        appliedPriceType: activeType,
        subtotal: itemSubtotal
      });
    }

    // Generate Order Number
    const orderNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = await Order.create({
      orderNumber,
      buyerId: session.userId,
      buyerRole: session.role,
      buyerName,
      buyerPhone,
      buyerAddress,
      
      sellerStoreId: store._id,
      sellerBumdesProfileId: store.bumdesId,
      
      items: validatedItems,
      
      subtotal: calculatedSubtotal,
      shippingCost: 0,
      total: calculatedSubtotal, // shipping cost is 0 initially

      status: "WAITING_SELLER_CONFIRMATION",
      paymentStatus: "UNPAID",
      
      buyerNote,
    });

    return NextResponse.json({ success: true, orderId: newOrder._id }, { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Gagal memproses pesanan" }, { status: 500 });
  }
}
