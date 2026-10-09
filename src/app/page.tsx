import { recommendationService } from "@/services/recommendation.service";
import { knowledgeRepository } from "@/repositories/knowledge.repository";
import { HomeClient } from "./HomeClient";

export default async function HomePage() {
  const initialResult = await recommendationService.generateDailyRecommendations({
    userId: "guest",
    lifeConditions: ["renting", "cooking_often"],
    interestedCategories: ["health", "home_safety"],
    savedCardIds: [],
    masteredCardIds: [],
    exposures: {},
    seedRandom: 1,
  });

  const allCards = await knowledgeRepository.getAllCards();

  return (
    <HomeClient
      initialResult={initialResult}
      totalCardsCount={allCards.length}
    />
  );
}
