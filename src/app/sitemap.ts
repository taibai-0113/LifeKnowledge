import type { MetadataRoute } from "next";
import { knowledgeRepository } from "@/repositories/knowledge.repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cards = await knowledgeRepository.getAllCards();
  const baseUrl = "https://lifeknowledge.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date("2026-10-08"),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date("2026-10-08"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blindspot`,
      lastModified: new Date("2026-10-08"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/random`,
      lastModified: new Date("2026-10-08"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date("2026-10-08"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const cardRoutes: MetadataRoute.Sitemap = cards
    .filter((c) => c.status === "published")
    .map((card) => ({
      url: `${baseUrl}/card/${card.id}`,
      lastModified: new Date(card.updatedAt || "2026-10-08"),
      changeFrequency: "weekly",
      priority: card.grade === "A+" || card.riskLevel === "critical" ? 0.85 : 0.7,
    }));

  return [...staticRoutes, ...cardRoutes];
}
