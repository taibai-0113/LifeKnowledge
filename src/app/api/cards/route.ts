import { NextRequest, NextResponse } from "next/server";
import { knowledgeRepository } from "@/repositories/knowledge.repository";
import { KnowledgeCard } from "@/types/knowledge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const module = searchParams.get("module") as KnowledgeCard["module"] | null;
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const ids = searchParams.get("ids");

    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      const cards: KnowledgeCard[] = [];
      for (const id of idList) {
        const c = await knowledgeRepository.getCardById(id);
        if (c) cards.push(c);
      }
      return NextResponse.json({ cards });
    }

    let allCards: KnowledgeCard[] = [];
    if (module) {
      allCards = await knowledgeRepository.getCardsByModule(module);
    } else {
      allCards = await knowledgeRepository.getAllCards();
    }

    const total = allCards.length;
    const paginated = allCards.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return NextResponse.json({
      cards: paginated,
      total,
      offset,
      limit,
      hasMore,
    });
  } catch (error) {
    console.error("Failed to fetch cards:", error);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}
