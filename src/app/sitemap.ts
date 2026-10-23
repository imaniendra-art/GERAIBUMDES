import { MetadataRoute } from "next";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Store from "@/models/Store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://geraibumdes.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/produk`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bumdes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    await dbConnect();
    const products = await Product.find({ status: "ACTIVE" }).select("slug updatedAt").lean();
    const productRoutes: MetadataRoute.Sitemap = products.map((p: any) => ({
      url: `${baseUrl}/produk/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const stores = await Store.find({ status: "ACTIVE" }).select("slug updatedAt").lean();
    const storeRoutes: MetadataRoute.Sitemap = stores.map((s: any) => ({
      url: `${baseUrl}/bumdes/${s.slug}`,
      lastModified: s.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...storeRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticRoutes;
  }
}
