import mongoose, { Schema, Document } from "mongoose";

export interface IRegion extends Document {
  provinceCode?: string;
  provinceName?: string;
  regencyCode?: string;
  regencyName?: string;
  districtCode?: string;
  districtName?: string;
  villageCode?: string;
  villageName?: string;
  // Legacy fields for backward compatibility
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RegionSchema: Schema = new Schema(
  {
    provinceCode: { type: String, index: true },
    provinceName: { type: String },
    regencyCode: { type: String, index: true },
    regencyName: { type: String },
    districtCode: { type: String, index: true },
    districtName: { type: String },
    villageCode: { type: String, index: true, unique: true, sparse: true },
    villageName: { type: String },
    // Legacy fields
    province: { type: String },
    regency: { type: String },
    district: { type: String },
    village: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Region || mongoose.model<IRegion>("Region", RegionSchema);
