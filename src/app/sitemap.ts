import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SEO_KEYWORDS } from "@/lib/seo-keywords";

const BASE_URL = "https://tictok.tubefission.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = ["", "/explore", "/trending", "/analytics", "/watchlist"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // SEO topic pages
  const topicRoutes: MetadataRoute.Sitemap = SEO_KEYWORDS.map((topic) => ({
    url: `${BASE_URL}/topic/${topic.keyword}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Fetch all trends from database
  const trends = await prisma.trend.findMany({
    select: { slug: true, updatedAt: true },
    take: 500,
  });

  const trendRoutes: MetadataRoute.Sitemap = trends.map((trend) => ({
    url: `${BASE_URL}/trend/${trend.slug}`,
    lastModified: trend.updatedAt,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // Fetch creators
  const creators = await prisma.creator.findMany({
    select: { username: true, updatedAt: true },
    take: 100,
    orderBy: { followers: "desc" },
  });

  const creatorRoutes: MetadataRoute.Sitemap = creators.map((creator) => ({
    url: `${BASE_URL}/creator/${creator.username}`,
    lastModified: creator.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Fetch hashtags
  const hashtags = await prisma.hashtag.findMany({
    select: { name: true, scrapedAt: true },
    take: 100,
    orderBy: { viralScore: "desc" },
  });

  const hashtagRoutes: MetadataRoute.Sitemap = hashtags.map((hashtag) => ({
    url: `${BASE_URL}/hashtag/${encodeURIComponent(hashtag.name)}`,
    lastModified: hashtag.scrapedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Fetch sounds
  const sounds = await prisma.sound.findMany({
    select: { id: true, scrapedAt: true },
    take: 100,
    orderBy: { uses: "desc" },
  });

  const soundRoutes: MetadataRoute.Sitemap = sounds.map((sound) => ({
    url: `${BASE_URL}/sound/${sound.id}`,
    lastModified: sound.scrapedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Fetch videos
  const videos = await prisma.video.findMany({
    select: { id: true, scrapedAt: true },
    take: 100,
    orderBy: { views: "desc" },
  });

  const videoRoutes: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `${BASE_URL}/video/${video.id}`,
    lastModified: video.scrapedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...topicRoutes,
    ...trendRoutes,
    ...creatorRoutes,
    ...hashtagRoutes,
    ...soundRoutes,
    ...videoRoutes,
  ];
}
