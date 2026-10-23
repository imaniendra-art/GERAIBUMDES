import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  address?: string;
  role: "SUPER_ADMIN" | "PLATFORM_ADMIN" | "BUMDES_ADMIN" | "BUMDES_MEMBER" | "CUSTOMER";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phoneNumber: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "PLATFORM_ADMIN", "BUMDES_ADMIN", "BUMDES_MEMBER", "CUSTOMER"],
      default: "CUSTOMER",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
