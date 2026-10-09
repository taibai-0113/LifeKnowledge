import { NextResponse } from "next/server";
import { recommendationService } from "@/services/recommendation.service";
import { RecommendationContext } from "@/types/recommendation";

export async function POST(req: Request) {
  try {
    const body: RecommendationContext = await req.json();
    const result = await recommendationService.generateDailyRecommendations(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
