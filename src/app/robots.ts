import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://geraibumdes.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/produk", "/bumdes", "/images/"],
        disallow: ["/admin/", "/dashboard/", "/api/", "/review/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
