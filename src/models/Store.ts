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
  googleMapsUrl?: string;
  directorName?: string;
  villageHeadName?: string;
  nib?: string;
  village?: string;
  villageCode?: string;
  district?: string;
  districtCode?: string;
  regency?: string;
  regencyCode?: string;
  province?: string;
  provinceCode?: string;
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
    googleMapsUrl: { type: String },
    directorName: { type: String },
    villageHeadName: { type: String },
    nib: { type: String },
    village: { type: String },
    villageCode: { type: String },
    district: { type: String },
    districtCode: { type: String },
    regency: { type: String },
    regencyCode: { type: String },
    province: { type: String },
    provinceCode: { type: String },
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
