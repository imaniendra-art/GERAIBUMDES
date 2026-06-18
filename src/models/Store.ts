import mongoose, { Schema, Document } from "mongoose";

export interface IStore extends Document {
  bumdesId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;
  village?: string;
  district?: string;
  regency?: string;
  province?: string;
  businessType?: string;
  operationalHours?: string;
  paymentInstructions?: string;
  bankAccount?: {
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolderName?: string;
    paymentNote?: string;
  };
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema(
  {
    bumdesId: { type: Schema.Types.ObjectId, ref: "BumdesProfile", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    phoneNumber: { type: String },
    whatsappNumber: { type: String },
    address: { type: String },
    village: { type: String },
    district: { type: String },
    regency: { type: String },
    province: { type: String },
    businessType: { type: String },
    operationalHours: { type: String },
    paymentInstructions: { type: String },
    bankAccount: {
      bankName: { type: String },
      bankAccountNumber: { type: String },
      bankAccountHolderName: { type: String },
      paymentNote: { type: String },
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model<IStore>("Store", StoreSchema);
