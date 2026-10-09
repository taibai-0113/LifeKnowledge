import { describe, it, expect, beforeEach } from "vitest";
import {
  RecommendationService,
  DEFAULT_RECOMMENDATION_WEIGHTS,
} from "@/services/recommendation.service";
import { KnowledgeCard, KnowledgeConcept } from "@/types/knowledge";
import { RecommendationContext } from "@/types/recommendation";

describe("Recommendation Engine & Scoring Tests", () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = new RecommendationService();
  });

  const mockConcept: KnowledgeConcept = {
    id: "concept_smoke_alarm",
    name: "烟雾报警器配置",
    canonicalQuestion: "家里为什么要装烟雾报警器？",
    canonicalSummary: "夜间火灾首要死因是浓烟毒气，烟雾报警器提供逃生预警。",
    domain: "home_safety",
    topic: "fire_safety",
    status: "published",
    difficulty: 1,
    origin: "official_source",
    createdAt: "2026-10-08T00:00:00Z",
    updatedAt: "2026-10-08T00:00:00Z",
    tags: ["烟雾报警器", "消防", "独居", "家庭安全"],
  };

  const mockCard: KnowledgeCard = {
    id: "card_smoke_alarm",
    conceptId: "concept_smoke_alarm",
    type: "action",
    module: "life_archive",
    title: "在卧室外和走廊安装独立式烟雾报警器",
    oneLine: "烟雾报警器能在熟睡时第一时间唤醒全家，火灾逃生率翻倍。",
    difficulty: 1,
    grade: "A+",
    riskLevel: "critical",
    angle: "action",
    status: "published",
    updatedAt: "2026-10-08T00:00:00Z",
    tags: ["烟雾报警器", "消防", "独居", "家庭安全"],
  };

  it("1. 权重配置化：可读取与动态修改，禁止写死", () => {
    const weights = service.getWeights();
    expect(weights.relevance).toBe(DEFAULT_RECOMMENDATION_WEIGHTS.relevance);
    expect(weights.importance).toBe(DEFAULT_RECOMMENDATION_WEIGHTS.importance);

    service.setWeights({ relevance: 0.4, importance: 0.2 });
    const updated = service.getWeights();
    expect(updated.relevance).toBe(0.4);
    expect(updated.importance).toBe(0.2);
  });

  it("2. 相关度打分：生活状态命中时得分显著提升", () => {
    // 用户处于独居状态，匹配 home_safety 领域与独居标签
    const matchResult = service.calculateRelevanceScore(mockCard, mockConcept, ["living_alone"]);
    expect(matchResult.score).toBeGreaterThanOrEqual(85);
    expect(matchResult.matchedConditions).toContain("living_alone");

    // 用户生活状态未命中
    const mismatchResult = service.calculateRelevanceScore(mockCard, mockConcept, ["driving"]);
    expect(mismatchResult.score).toBeLessThan(matchResult.score);
  });

  it("3. 重要度打分：critical 风险等级与 A+ 卡片赋予高分", () => {
    const criticalScore = service.calculateImportanceScore(mockCard);
    expect(criticalScore).toBeGreaterThanOrEqual(95);

    const lowRiskCard: KnowledgeCard = {
      ...mockCard,
      riskLevel: "low",
      grade: "C",
    };
    const lowScore = service.calculateImportanceScore(lowRiskCard);
    expect(lowScore).toBeLessThan(criticalScore);
  });

  it("4. 盲区认知卡与新颖度：未见过的新颖度高于多次曝光", () => {
    const blindspotCard: KnowledgeCard = {
      ...mockCard,
      type: "blindspot",
      module: "blindspot",
      misconception: "白粥清淡养胃",
    };

    const noveltyUnseen = service.calculateNoveltyScore(blindspotCard, 0);
    const noveltySeenTwice = service.calculateNoveltyScore(blindspotCard, 2);

    expect(noveltyUnseen).toBeGreaterThanOrEqual(85);
    expect(noveltySeenTwice).toBeLessThan(noveltyUnseen);
  });

  it("5. 惩罚机制：已掌握与明确不感兴趣卡片分数大幅抑制", () => {
    const baseContext: RecommendationContext = {
      userId: "u1",
      lifeConditions: ["living_alone"],
      interestedCategories: ["home_safety"],
      savedCardIds: [],
      masteredCardIds: [],
      exposures: {},
    };

    const normalScored = service.scoreCard(mockCard, mockConcept, baseContext);

    // 标记为已掌握
    const masteredContext: RecommendationContext = {
      ...baseContext,
      masteredCardIds: [mockCard.id],
    };
    const masteredScored = service.scoreCard(mockCard, mockConcept, masteredContext);
    expect(masteredScored.score).toBeLessThan(normalScored.score * 0.2);
    expect(masteredScored.breakdown.penalties.mastered).toBe(true);

    // 标记为不感兴趣
    const dismissedContext: RecommendationContext = {
      ...baseContext,
      dismissedCardIds: [{ cardId: mockCard.id, reason: "not_interested" }],
    };
    const dismissedScored = service.scoreCard(mockCard, mockConcept, dismissedContext);
    expect(dismissedScored.score).toBeLessThan(normalScored.score * 0.3);
    expect(dismissedScored.breakdown.penalties.dismissed).toBe(true);
  });

  it("6. 多样性防疲劳：同屏同 Topic 或同 Angle 产生衰减惩罚", () => {
    const context: RecommendationContext = {
      userId: "u1",
      lifeConditions: ["living_alone"],
      interestedCategories: ["home_safety"],
      savedCardIds: [],
      masteredCardIds: [],
      exposures: {},
    };

    const withoutDiversity = service.scoreCard(mockCard, mockConcept, context);
    const withDiversityPenalty = service.scoreCard(mockCard, mockConcept, context, {
      chosenTopics: ["fire_safety"],
      chosenAngles: ["action"],
    });

    expect(withDiversityPenalty.score).toBeLessThan(withoutDiversity.score);
    expect(withDiversityPenalty.breakdown.penalties.diversityPenalty).toBeLessThan(1.0);
  });

  it("7. 首页 4 卡流调度编排：生成 4 张不同 Concept 的配方卡片", async () => {
    const context: RecommendationContext = {
      userId: "guest",
      lifeConditions: ["renting", "cooking_often"],
      interestedCategories: ["health", "home_safety"],
      savedCardIds: [],
      masteredCardIds: [],
      exposures: {},
      seedRandom: 42,
    };

    const result = await service.generateDailyRecommendations(context);

    expect(result.allCards.length).toBeGreaterThanOrEqual(4);
    expect(result.coreArchiveCard).toBeDefined();
    expect(result.blindspotCard).toBeDefined();
    expect(result.relevantCard).toBeDefined();
    expect(result.explorationCard).toBeDefined();

    // 验证 Concept 互不重复（严禁同一屏幕推相同 Concept）
    const conceptIds = result.allCards.map((c) => c.conceptId);
    const uniqueConcepts = new Set(conceptIds);
    expect(uniqueConcepts.size).toBe(conceptIds.length);

    // 验证槽位推荐理由有解释性
    expect(result.matchedReasonMap[result.coreArchiveCard.id]).toBeDefined();
    expect(result.matchedReasonMap[result.blindspotCard.id]).toBeDefined();
  });
});
