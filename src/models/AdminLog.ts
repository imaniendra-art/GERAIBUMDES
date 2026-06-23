import mongoose, { Schema, Document } from "mongoose";

export interface IAdminLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  target?: string;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminLogSchema: Schema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    target: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

// Indexes for faster queries
AdminLogSchema.index({ adminId: 1 });
AdminLogSchema.index({ createdAt: -1 });

export default mongoose.models.AdminLog || mongoose.model<IAdminLog>("AdminLog", AdminLogSchema);
