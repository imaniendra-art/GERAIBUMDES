import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Store from "@/models/Store";

export async function POST(req: Request) {
  const decrementedItems: { productId: any; quantity: number }[] = [];

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, buyerName, buyerPhone, buyerAddress, buyerNote, items } = body;

    if (!storeId || !buyerName || !buyerPhone || !buyerAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Data pesanan tidak lengkap." }, { status: 400 });
    }

    await dbConnect();

    // Verify Store and Seller BUMDes
    const store = await Store.findById(storeId);
    if (!store || store.status !== "ACTIVE") {
      return NextResponse.json({ error: "Toko BUMDes tidak ditemukan atau sedang tidak aktif." }, { status: 404 });
    }

    // 1. Initial Validation: Check product status, store matching, minOrder, and initial stock availability
    for (const item of items) {
      if (!item.productId || typeof item.quantity !== "number" || item.quantity <= 0) {
        return NextResponse.json({ error: "Kuantitas produk tidak valid." }, { status: 400 });
      }

      const product = await Product.findById(item.productId);
      if (!product || product.storeId.toString() !== storeId || product.status !== "ACTIVE") {
        return NextResponse.json({ 
          error: `Produk "${item.productNameSnapshot || 'terpilih'}" tidak tersedia atau sedang non-aktif.` 
        }, { status: 400 });
      }

      if (item.quantity < product.minOrder) {
        return NextResponse.json({ 
          error: `Kuantitas "${product.name}" kurang dari batas minimum order (${product.minOrder} ${product.unit}).` 
        }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Stok produk "${product.name}" tidak mencukupi (Tersedia: ${product.stock} ${product.unit}, dipesan: ${item.quantity} ${product.unit}).` 
        }, { status: 400 });
      }
    }

    // 2. Atomic Stock Decrement & Item Pricing
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      // Atomic find and decrement: only succeeds if stock is still >= requested quantity
      const updatedProduct = await Product.findOneAndUpdate(
        { 
          _id: item.productId, 
          status: "ACTIVE", 
          stock: { $gte: item.quantity } 
        },
        { 
          $inc: { stock: -item.quantity } 
        },
        { new: true }
      );

      if (!updatedProduct) {
        // Rollback any items that were successfully decremented in previous loop iterations
        for (const dec of decrementedItems) {
          await Product.findByIdAndUpdate(dec.productId, {
            $inc: { stock: dec.quantity }
          });
        }
        return NextResponse.json({
          error: `Gagal memesan: Stok produk "${item.productNameSnapshot || 'terpilih'}" baru saja habis atau dibeli pengguna lain.`
        }, { status: 400 });
      }

      // Record successful decrement for rollback capability
      decrementedItems.push({ productId: item.productId, quantity: item.quantity });

      // Determine retail vs wholesale price tier
      let activePrice = updatedProduct.retailPrice;
      let activeType: "RETAIL" | "WHOLESALE" = "RETAIL";

      if (updatedProduct.isWholesaleAvailable && updatedProduct.wholesalePriceTiers?.length > 0) {
        const sortedTiers = [...updatedProduct.wholesalePriceTiers].sort((a, b) => b.minQty - a.minQty);
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
        productId: updatedProduct._id,
        productNameSnapshot: updatedProduct.name,
        productSlugSnapshot: updatedProduct.slug,
        storeId: store._id,
        quantity: item.quantity,
        unit: updatedProduct.unit,
        price: activePrice,
        appliedPriceType: activeType,
        subtotal: itemSubtotal
      });
    }

    // 3. Create Order
    const orderNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = await Order.create({
      orderNumber,
      buyerId: session.userId,
      buyerRole: session.role,
      buyerName: String(buyerName).trim(),
      buyerPhone: String(buyerPhone).trim(),
      buyerAddress: String(buyerAddress).trim(),
      
      sellerStoreId: store._id,
      sellerBumdesProfileId: store.bumdesId,
      
      items: validatedItems,
      
      subtotal: calculatedSubtotal,
      shippingCost: 0,
      total: calculatedSubtotal,

      status: "WAITING_SELLER_CONFIRMATION",
      paymentStatus: "UNPAID",
      
      buyerNote: buyerNote ? String(buyerNote).trim() : "",
    });

    return NextResponse.json({ success: true, orderId: newOrder._id }, { status: 201 });
  } catch (error: any) {
    // If order creation itself throws, rollback all decremented stock!
    if (decrementedItems.length > 0) {
      for (const dec of decrementedItems) {
        await Product.findByIdAndUpdate(dec.productId, {
          $inc: { stock: dec.quantity }
        }).catch(e => console.error("Rollback error:", e));
      }
    }
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Gagal memproses pesanan. Silakan coba kembali." }, { status: 500 });
  }
}
