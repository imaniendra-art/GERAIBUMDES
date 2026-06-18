import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productNameSnapshot: string;
  productSlugSnapshot: string;
  storeId: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
  price: number; // Harga per item yang digunakan
  appliedPriceType: "RETAIL" | "WHOLESALE";
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  
  buyerId: mongoose.Types.ObjectId; // User yang membeli
  buyerRole: "CUSTOMER" | "BUMDES_ADMIN";
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;

  sellerStoreId: mongoose.Types.ObjectId; // Toko tujuan
  sellerBumdesProfileId: mongoose.Types.ObjectId;
  
  items: IOrderItem[];
  
  subtotal: number;
  shippingCost: number;
  total: number;

  status: 
    | "PENDING" 
    | "WAITING_SELLER_CONFIRMATION" 
    | "WAITING_PAYMENT" 
    | "PAYMENT_REVIEW" 
    | "PAID" 
    | "PROCESSING" 
    | "READY_TO_PICKUP" 
    | "SHIPPED_MANUAL" 
    | "COMPLETED" 
    | "CANCELLED";

  paymentStatus: 
    | "UNPAID"
    | "WAITING_REVIEW"
    | "PAID"
    | "REJECTED"
    | "REFUNDED";

  paymentMethod: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: Date;

  sellerNote?: string;
  buyerNote?: string;
  manualShippingNote?: string;
  shippingProvider?: string;
  trackingNumber?: string;
  shippingContact?: string;
  shippingProofUrl?: string;
  receiptProofUrl?: string;

  confirmedAt?: Date;
  paidAt?: Date;
  processedAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productNameSnapshot: { type: String, required: true },
    productSlugSnapshot: { type: String, required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    appliedPriceType: { type: String, enum: ["RETAIL", "WHOLESALE"], required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerRole: { type: String, required: true },
    buyerName: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    buyerAddress: { type: String, required: true },

    sellerStoreId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    sellerBumdesProfileId: { type: Schema.Types.ObjectId, ref: "BumdesProfile", required: true },
    
    items: [OrderItemSchema],
    
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        "PENDING",
        "WAITING_SELLER_CONFIRMATION",
        "WAITING_PAYMENT",
        "PAYMENT_REVIEW",
        "PAID",
        "PROCESSING",
        "READY_TO_PICKUP",
        "SHIPPED_MANUAL",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "WAITING_REVIEW", "PAID", "REJECTED", "REFUNDED"],
      default: "UNPAID",
    },

    paymentMethod: { type: String, default: "MANUAL_TRANSFER" },
    paymentProofUrl: { type: String },
    paymentProofUploadedAt: { type: Date },

    sellerNote: { type: String },
    buyerNote: { type: String },
    manualShippingNote: { type: String },
    shippingProvider: { type: String },
    trackingNumber: { type: String },
    shippingContact: { type: String },
    shippingProofUrl: { type: String },
    receiptProofUrl: { type: String },

    confirmedAt: { type: Date },
    paidAt: { type: Date },
    processedAt: { type: Date },
    shippedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
