/**
 * 推荐引擎核心服务 (Recommendation Service)
 * 严格遵照《Vibe Coding Master Prompt V4.0》第十四、十五部分实现
 * 
 * 核心特性：
 * 1. 规则打分算法 (Relevance 30%, Importance 25%, Novelty 15%, Interest 15%, Feedback 10%, Exploration 5%)
 * 2. 权重与惩罚全面配置化，无硬编码
 * 3. 多样性防疲劳控制 (Concept 唯一性、Topic 多样性、Angle 多样性、Difficulty 多样性)
 * 4. 每日推荐 4 卡流调度编排 (1 档案 + 1 盲区 + 1 与你有关 + 1 探索)
 */

import { KnowledgeCard, KnowledgeConcept } from "@/types/knowledge";
import { LifeCondition } from "@/types/user";
import {
  RecommendationWeights,
  RecommendationPenalties,
  RecommendationContext,
  RecommendationScoreBreakdown,
  ScoredKnowledgeCard,
  HomeRecommendationResult,
} from "@/types/recommendation";
import { knowledgeRepository } from "@/repositories/knowledge.repository";

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  relevance: 0.30,
  importance: 0.25,
  novelty: 0.15,
  userInterest: 0.15,
  feedback: 0.10,
  exploration: 0.05,
};

export const DEFAULT_RECOMMENDATION_PENALTIES: RecommendationPenalties = {
  conceptExposureDecay: 0.35,
  sameTopicPenalty: 0.50,
  sameAnglePenalty: 0.30,
  sameCategoryPenalty: 0.40,
  masteredPenalty: 0.95,
  notInterestedPenalty: 0.90,
};

/**
 * 生活状态与知识画像关联字典
 */
const CONDITION_MAPPINGS: Record<
  LifeCondition,
  { domains: string[]; keywords: string[]; label: string }
> = {
  renting: {
    domains: ["living", "legal"],
    keywords: ["租房", "房东", "押金", "合同", "退租", "水电气", "中介"],
    label: "租房生活",
  },
  cooking_often: {
    domains: ["kitchen", "diet"],
    keywords: ["厨房", "做饭", "油锅", "烹饪", "白粥", "罐头", "食品", "灭火", "饮食"],
    label: "日常下厨",
  },
  driving: {
    domains: ["traffic"],
    keywords: ["安全带", "交通安全", "乘员保护", "出行", "开车", "自驾", "事故", "车辆"],
    label: "驾驶与出行",
  },
  living_alone: {
    domains: ["home_safety", "living"],
    keywords: ["烟雾报警器", "接线板", "插座", "独居", "消防", "用电安全", "安全防范", "门锁"],
    label: "独居安全",
  },
  has_pet: {
    domains: ["medical", "family"],
    keywords: ["宠物", "狂犬病", "狗咬", "伤口冲洗", "疫苗", "动物", "猫狗"],
    label: "养宠家庭",
  },
  frequent_traveler: {
    domains: ["travel", "traffic"],
    keywords: ["旅行", "出行", "酒店", "飞机", "行李", "出差"],
    label: "经常差旅",
  },
  freelancing: {
    domains: ["work", "legal", "money"],
    keywords: ["自由职业", "合同", "社保", "纳税", "知识产权", "劳动维权"],
    label: "自由职业",
  },
  has_children: {
    domains: ["family", "health"],
    keywords: ["儿童", "育儿", "安全座椅", "急救", "家庭"],
    label: "育儿家庭",
  },
  has_partner: {
    domains: ["family", "fertility"],
    keywords: ["伴侣", "家庭", "沟通", "亲密关系"],
    label: "二人生活",
  },
};

export class RecommendationService {
  private weights: RecommendationWeights;
  private penalties: RecommendationPenalties;

  constructor(
    weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
    penalties: RecommendationPenalties = DEFAULT_RECOMMENDATION_PENALTIES
  ) {
    this.weights = weights;
    this.penalties = penalties;
  }

  public getWeights(): RecommendationWeights {
    return { ...this.weights };
  }

  public setWeights(newWeights: Partial<RecommendationWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  public getPenalties(): RecommendationPenalties {
    return { ...this.penalties };
  }

  public setPenalties(newPenalties: Partial<RecommendationPenalties>): void {
    this.penalties = { ...this.penalties, ...newPenalties };
  }

  /**
   * 1. 相关度打分 (Relevance Score: 0 ~ 100)
   * 依据用户 lifeConditions 与卡片场景、标签和领域关联度判定
   */
  public calculateRelevanceScore(
    card: KnowledgeCard,
    concept: KnowledgeConcept | undefined,
    lifeConditions: LifeCondition[]
  ): { score: number; matchedConditions: LifeCondition[] } {
    const matchedConditions: LifeCondition[] = [];
    const cardText = `${card.title} ${card.oneLine} ${(card.tags || []).join(" ")} ${concept?.domain || ""}`.toLowerCase();

    for (const condition of lifeConditions) {
      const mapping = CONDITION_MAPPINGS[condition];
      if (!mapping) continue;

      let isMatch = false;
      if (concept?.domain && mapping.domains.includes(concept.domain)) {
        isMatch = true;
      }
      for (const kw of mapping.keywords) {
        if (cardText.includes(kw.toLowerCase())) {
          isMatch = true;
          break;
        }
      }

      if (isMatch) {
        matchedConditions.push(condition);
      }
    }

    let score = 45; // 成人基础通识兜底分
    if (matchedConditions.length >= 2) {
      score = 98;
    } else if (matchedConditions.length === 1) {
      score = 85;
    } else if (lifeConditions.length === 0) {
      score = 60;
    }

    return { score, matchedConditions };
  }

  /**
   * 2. 重要度打分 (Importance Score: 0 ~ 100)
   * 依据卡片 riskLevel、grade 与卡片类型判定
   */
  public calculateImportanceScore(card: KnowledgeCard): number {
    let base = 50;
    switch (card.riskLevel) {
      case "critical":
        base = 98;
        break;
      case "high":
        base = 85;
        break;
      case "medium":
        base = 65;
        break;
      case "low":
        base = 45;
        break;
      default:
        base = 50;
    }

    if (card.grade === "A+") base += 5;
    else if (card.grade === "A") base += 3;

    if (card.type === "emergency") base = Math.max(base, 95);

    return Math.min(100, base);
  }

  /**
   * 3. 新颖度打分 (Novelty Score: 0 ~ 100)
   * 盲区认知卡反直觉度高，随曝光次数递减
   */
  public calculateNoveltyScore(card: KnowledgeCard, timesSeen: number): number {
    let base = 50;
    if (card.type === "blindspot" || card.module === "blindspot") {
      base = 92;
    } else if (card.misconception) {
      base = 88;
    }

    const decayed = base - timesSeen * 20;
    return Math.max(10, decayed);
  }

  /**
   * 4. 兴趣度打分 (Interest Score: 0 ~ 100)
   * 依据用户勾选的 interestedCategories
   */
  public calculateInterestScore(
    card: KnowledgeCard,
    concept: KnowledgeConcept | undefined,
    interestedCategories: string[]
  ): number {
    if (!interestedCategories || interestedCategories.length === 0) {
      return 60;
    }

    const domain = concept?.domain;
    if (domain && interestedCategories.includes(domain)) {
      return 95;
    }

    return 45;
  }

  /**
   * 5. 行为反馈打分 (Feedback Score: 0 ~ 100)
   * 若用户已收藏相关 Concept 或互动良好，提升相似领域分值
   */
  public calculateFeedbackScore(
    card: KnowledgeCard,
    savedCardIds: string[]
  ): number {
    if (savedCardIds.includes(card.id)) {
      return 90;
    }
    return 50;
  }

  /**
   * 6. 随机探索打分 (Exploration Score: 0 ~ 100)
   * 引入基于 seed 的轻量打乱，保证每次生成略有差异但不杂乱
   */
  public calculateExplorationScore(cardId: string, seed: number = 0): number {
    let hash = seed * 37;
    for (let i = 0; i < cardId.length; i++) {
      hash = (hash << 5) - hash + cardId.charCodeAt(i);
      hash |= 0;
    }
    return 20 + Math.abs(hash % 76); // 20 ~ 95
  }

  /**
   * 单卡综合打分
   */
  public scoreCard(
    card: KnowledgeCard,
    concept: KnowledgeConcept | undefined,
    context: RecommendationContext,
    diversityContext?: {
      chosenTopics?: string[];
      chosenAngles?: string[];
      chosenCategories?: string[];
    }
  ): ScoredKnowledgeCard {
    const { score: relevanceScore, matchedConditions } = this.calculateRelevanceScore(
      card,
      concept,
      context.lifeConditions
    );
    const importanceScore = this.calculateImportanceScore(card);

    const exposure = context.exposures[card.conceptId];
    const exposureCount = exposure?.timesSeen || 0;
    const noveltyScore = this.calculateNoveltyScore(card, exposureCount);

    const interestScore = this.calculateInterestScore(
      card,
      concept,
      context.interestedCategories
    );
    const feedbackScore = this.calculateFeedbackScore(card, context.savedCardIds);
    const explorationScore = this.calculateExplorationScore(
      card.id,
      context.seedRandom || 0
    );

    // 加权综合基础分
    const weightedBaseScore =
      relevanceScore * this.weights.relevance +
      importanceScore * this.weights.importance +
      noveltyScore * this.weights.novelty +
      interestScore * this.weights.userInterest +
      feedbackScore * this.weights.feedback +
      explorationScore * this.weights.exploration;

    // 惩罚项计算
    let penaltyMultiplier = 1.0;

    // 曝光衰减
    const exposureDecay = Math.pow(
      1 - this.penalties.conceptExposureDecay,
      Math.min(exposureCount, 4)
    );
    penaltyMultiplier *= exposureDecay;

    // 已掌握强惩罚
    const isMastered = context.masteredCardIds.includes(card.id);
    if (isMastered) {
      penaltyMultiplier *= 1 - this.penalties.masteredPenalty;
    }

    // 明确不感兴趣惩罚
    const isDismissed = Boolean(
      context.dismissedCardIds?.some((d) => d.cardId === card.id)
    );
    if (isDismissed) {
      penaltyMultiplier *= 1 - this.penalties.notInterestedPenalty;
    }

    // 同屏多样性惩罚 (Topic / Angle / Category)
    let diversityPenalty = 1.0;
    if (diversityContext) {
      if (
        concept?.topic &&
        diversityContext.chosenTopics?.includes(concept.topic)
      ) {
        diversityPenalty *= 1 - this.penalties.sameTopicPenalty;
      }
      if (card.angle && diversityContext.chosenAngles?.includes(card.angle)) {
        diversityPenalty *= 1 - this.penalties.sameAnglePenalty;
      }
      if (
        concept?.domain &&
        diversityContext.chosenCategories?.includes(concept.domain)
      ) {
        diversityPenalty *= 1 - this.penalties.sameCategoryPenalty;
      }
    }
    penaltyMultiplier *= diversityPenalty;

    const finalScore = Math.round(weightedBaseScore * penaltyMultiplier * 10) / 10;

    const breakdown: RecommendationScoreBreakdown = {
      relevanceScore,
      importanceScore,
      noveltyScore,
      interestScore,
      feedbackScore,
      explorationScore,
      weightedBaseScore: Math.round(weightedBaseScore * 10) / 10,
      penaltyMultiplier: Math.round(penaltyMultiplier * 100) / 100,
      penalties: {
        exposureCount,
        exposureDecay: Math.round(exposureDecay * 100) / 100,
        mastered: isMastered,
        dismissed: isDismissed,
        diversityPenalty: Math.round(diversityPenalty * 100) / 100,
      },
      finalScore,
    };

    return {
      card,
      concept,
      score: finalScore,
      breakdown,
      matchedConditions,
    };
  }

  /**
   * 每日推荐配方（首页 4 卡调度器）
   * 槽位分配：
   * Slot 1: 人生知识档案 (高价值行动卡/核心必修)
   * Slot 2: 生活盲区 (认知反差卡)
   * Slot 3: 与你有关 (生活状态直接关联)
   * Slot 4: 随机探索 (跨品类/新视角)
   */
  public async generateDailyRecommendations(
    context: RecommendationContext
  ): Promise<HomeRecommendationResult> {
    const allCards = await knowledgeRepository.getAllCards();
    const allConcepts = await knowledgeRepository.getAllConcepts();
    const conceptMap = new Map<string, KnowledgeConcept>();
    for (const c of allConcepts) {
      conceptMap.set(c.id, c);
    }

    const publishedCards = allCards.filter(
      (c) => c.status === "published" && !context.excludeCardIds?.includes(c.id)
    );

    const chosenConceptIds = new Set<string>();
    const chosenTopics = new Set<string>();
    const chosenAngles = new Set<string>();
    const chosenCategories = new Set<string>();
    const matchedReasonMap: Record<string, string> = {};

    // 辅助选择函数：从候选列表选出符合多样性且分值最高的卡片
    const pickBestCard = (
      candidates: KnowledgeCard[],
      fallbackCandidates: KnowledgeCard[]
    ): ScoredKnowledgeCard | null => {
      // 第一轮优先避开已选择的 Concept、Topic
      const scoredList: ScoredKnowledgeCard[] = candidates
        .filter((c) => !chosenConceptIds.has(c.conceptId))
        .map((c) => {
          const concept = conceptMap.get(c.conceptId);
          return this.scoreCard(c, concept, context, {
            chosenTopics: Array.from(chosenTopics),
            chosenAngles: Array.from(chosenAngles),
            chosenCategories: Array.from(chosenCategories),
          });
        })
        .sort((a, b) => b.score - a.score);

      if (scoredList.length > 0) {
        return scoredList[0];
      }

      // 降级兜底：从 fallbackCandidates 中选 concept 不重复的
      const fallbackList: ScoredKnowledgeCard[] = fallbackCandidates
        .filter((c) => !chosenConceptIds.has(c.conceptId))
        .map((c) => {
          const concept = conceptMap.get(c.conceptId);
          return this.scoreCard(c, concept, context);
        })
        .sort((a, b) => b.score - a.score);

      return fallbackList.length > 0 ? fallbackList[0] : null;
    };

    const registerCard = (scored: ScoredKnowledgeCard, reason: string) => {
      chosenConceptIds.add(scored.card.conceptId);
      if (scored.concept?.topic) chosenTopics.add(scored.concept.topic);
      if (scored.card.angle) chosenAngles.add(scored.card.angle);
      if (scored.concept?.domain) chosenCategories.add(scored.concept.domain);
      matchedReasonMap[scored.card.id] = reason;
    };

    // --- Slot 1: 人生知识档案 (核心行动卡) ---
    const archiveCandidates = publishedCards.filter(
      (c) => c.module === "life_archive" || c.type === "action" || c.type === "emergency"
    );
    const chosenArchive = pickBestCard(archiveCandidates, publishedCards);
    if (chosenArchive) {
      registerCard(chosenArchive, "人生必修 · 高价值行动");
    }

    // --- Slot 2: 生活盲区 (认知反差卡) ---
    const blindspotCandidates = publishedCards.filter(
      (c) => c.module === "blindspot" || c.type === "blindspot" || Boolean(c.misconception)
    );
    const chosenBlindspot = pickBestCard(blindspotCandidates, publishedCards);
    if (chosenBlindspot) {
      registerCard(chosenBlindspot, "认知反差 · 扫清盲区");
    }

    // --- Slot 3: 与你有关 (基于生活状态场景) ---
    const relevantCandidates = publishedCards.filter((c) => {
      const concept = conceptMap.get(c.conceptId);
      const { score, matchedConditions } = this.calculateRelevanceScore(
        c,
        concept,
        context.lifeConditions
      );
      return score >= 70 && matchedConditions.length > 0;
    });
    const chosenRelevant = pickBestCard(relevantCandidates, publishedCards);
    if (chosenRelevant) {
      const conditionNames = chosenRelevant.matchedConditions
        .map((cd) => CONDITION_MAPPINGS[cd]?.label)
        .filter(Boolean)
        .join(" / ");
      registerCard(
        chosenRelevant,
        conditionNames ? `基于你的画像：${conditionNames}` : "与你的生活场景紧密相关"
      );
    }

    // --- Slot 4: 随机探索 (跨品类/新视角) ---
    const explorationCandidates = publishedCards.filter(
      (c) => !chosenConceptIds.has(c.conceptId)
    );
    const chosenExploration = pickBestCard(explorationCandidates, publishedCards);
    if (chosenExploration) {
      registerCard(chosenExploration, "探索新知 · 拓展认知边界");
    }

    // 严谨校验保底：若部分槽位未命中（数据极端受限情况下），以发布卡填充以保证 4 张卡
    const finalCards: KnowledgeCard[] = [];
    const pushIfValid = (scored: ScoredKnowledgeCard | null) => {
      if (scored && !finalCards.some((c) => c.id === scored.card.id)) {
        finalCards.push(scored.card);
      }
    };

    pushIfValid(chosenArchive);
    pushIfValid(chosenBlindspot);
    pushIfValid(chosenRelevant);
    pushIfValid(chosenExploration);

    // 若不足 4 张，按发布时间补充
    for (const card of publishedCards) {
      if (finalCards.length >= 4) break;
      if (!finalCards.some((c) => c.id === card.id)) {
        finalCards.push(card);
        if (!matchedReasonMap[card.id]) {
          matchedReasonMap[card.id] = "精选常识补齐";
        }
      }
    }

    return {
      coreArchiveCard: finalCards[0],
      blindspotCard: finalCards[1] || finalCards[0],
      relevantCard: finalCards[2] || finalCards[0],
      explorationCard: finalCards[3] || finalCards[0],
      allCards: finalCards,
      generatedAt: context.timestamp || "2026-10-08T00:00:00.000Z",
      matchedReasonMap,
    };
  }
}

export const recommendationService = new RecommendationService();
