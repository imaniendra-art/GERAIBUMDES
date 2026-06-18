import mongoose, { Schema, Document } from "mongoose";

export interface IBumdesProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  businessType: string;
  description: string;
  verificationStatus: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  directorName: string;
  contactNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const BumdesProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    village: { type: String, required: true },
    district: { type: String, required: true },
    regency: { type: String, required: true },
    province: { type: String, required: true },
    businessType: { type: String, required: true },
    description: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ["PENDING_VERIFICATION", "VERIFIED", "REJECTED", "SUSPENDED"],
      default: "PENDING_VERIFICATION",
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
    directorName: { type: String, required: true },
    contactNumber: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.BumdesProfile || mongoose.model<IBumdesProfile>("BumdesProfile", BumdesProfileSchema);
