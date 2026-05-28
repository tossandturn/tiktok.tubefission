import { MetadataRoute } from "next";

const BASE_URL = "https://tiktok-intelligence.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/explore",
    "/trend/viral-dance-challenge-2026",
    "/trend/ai-voice-filter-hack",
    "/trend/cinematic-transition-pack",
    "/trend/productivity-hack-morning",
    "/trend/food-asmr-evolution",
    "/trend/street-interview-tokyo",
    "/trend/miniature-diy-crafting",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date("2026-05-28"),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
