import { NextRequest, NextResponse } from "next/server";
import { knowledgeRepository } from "@/repositories/knowledge.repository";
import { KnowledgeCard } from "@/types/knowledge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const mode = searchParams.get("mode") || "all";
    const count = parseInt(searchParams.get("count") || "10", 10);

    let pool: KnowledgeCard[] = [];
    if (mode === "archive") {
      pool = await knowledgeRepository.getCardsByModule("life_archive");
    } else if (mode === "blindspot") {
      pool = await knowledgeRepository.getCardsByModule("blindspot");
    } else {
      pool = await knowledgeRepository.getAllCards();
    }

    // 洗牌抽取 count 张
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return NextResponse.json({
      cards: selected,
      totalInPool: pool.length,
    });
  } catch (error) {
    console.error("Failed to fetch random cards:", error);
    return NextResponse.json({ error: "Failed to fetch random cards" }, { status: 500 });
  }
}
