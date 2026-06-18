import mongoose, { Schema, Document } from "mongoose";

export interface IWholesalePriceTier {
  minQty: number;
  maxQty?: number;
  price: number;
}

export interface IProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  retailPrice: number;
  minOrder: number;
  unit: string;
  stock: number;
  images: string[];
  isWholesaleAvailable: boolean;
  wholesalePriceTiers: IWholesalePriceTier[];
  locationText: string;
  shippingNotes?: string;
  status: "DRAFT" | "WAITING_APPROVAL" | "ACTIVE" | "INACTIVE" | "REJECTED";
  isFeatured: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WholesalePriceTierSchema = new Schema<IWholesalePriceTier>(
  {
    minQty: { type: Number, required: true },
    maxQty: { type: Number },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const ProductSchema: Schema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    retailPrice: { type: Number, required: true },
    minOrder: { type: Number, default: 1 },
    unit: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
    isWholesaleAvailable: { type: Boolean, default: false },
    wholesalePriceTiers: [WholesalePriceTierSchema],
    locationText: { type: String, required: true },
    shippingNotes: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "WAITING_APPROVAL", "ACTIVE", "INACTIVE", "REJECTED"],
      default: "DRAFT",
    },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
