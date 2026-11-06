import mongoose, { Schema, Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  pdfUrl?: string;
  pdfName?: string;
  category: string;
  authorType: "SUPER_ADMIN" | "BUMDES_ADMIN";
  authorId: mongoose.Types.ObjectId;
  bumdesId?: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  status: "DRAFT" | "PUBLISHED";
  viewsCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    pdfUrl: { type: String, trim: true },
    pdfName: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      default: "Kabar Desa",
      enum: ["Kabar Desa", "Inovasi Produk", "Kegiatan BUMDes", "Pengumuman Resmi", "Tips & Edukasi"],
      index: true,
    },
    authorType: {
      type: String,
      required: true,
      enum: ["SUPER_ADMIN", "BUMDES_ADMIN"],
      index: true,
    },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bumdesId: { type: Schema.Types.ObjectId, ref: "BumdesProfile", index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    status: {
      type: String,
      required: true,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
      index: true,
    },
    viewsCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Pre-save to auto-fill publishedAt when changing status to PUBLISHED
ArticleSchema.pre("save", function () {
  if (this.isModified("status") && this.status === "PUBLISHED" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export default mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);
