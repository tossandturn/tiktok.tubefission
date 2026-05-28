import { MetadataRoute } from "next";
import { trends } from "@/lib/data";

const BASE_URL = "https://tiktok-intelligence.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/explore", "/trending"];

  // Add all trend pages
  const trendRoutes = trends.map((trend) => `/trend/${trend.id}`);

  const allRoutes = [...routes, ...trendRoutes];

  return allRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
