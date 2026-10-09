/**
 * 推荐引擎数据契约 (Recommendation Schemas)
 * 严格遵照《Vibe Coding Master Prompt V4.0》第十四、十五部分定义
 */

import { KnowledgeCard, KnowledgeConcept } from "./knowledge";
import { LifeCondition, ConceptExposure } from "./user";

/**
 * 推荐规则权重配置（可配置化，禁止写死）
 */
export interface RecommendationWeights {
  relevance: number;     // 默认 0.30 (30%)
  importance: number;    // 默认 0.25 (25%)
  novelty: number;       // 默认 0.15 (15%)
  userInterest: number;  // 默认 0.15 (15%)
  feedback: number;      // 默认 0.10 (10%)
  exploration: number;   // 默认 0.05 (5%)
}

/**
 * 推荐惩罚因子配置
 */
export interface RecommendationPenalties {
  conceptExposureDecay: number;   // 每次曝光的分数衰减系数（默认 0.35）
  sameTopicPenalty: number;       // 同屏/近期同主题惩罚因子（默认 0.50）
  sameAnglePenalty: number;       // 同屏/近期同视角惩罚因子（默认 0.30）
  sameCategoryPenalty: number;    // 同屏/近期同分类惩罚因子（默认 0.40）
  masteredPenalty: number;        // 已掌握强抑制系数（默认 0.95，扣除 95% 分数）
  notInterestedPenalty: number;   // 明确不感兴趣抑制系数（默认 0.90）
}

/**
 * 单张卡片推荐得分详细解构（用于可解释性与调试）
 */
export interface RecommendationScoreBreakdown {
  relevanceScore: number;     // 0 ~ 100
  importanceScore: number;    // 0 ~ 100
  noveltyScore: number;       // 0 ~ 100
  interestScore: number;      // 0 ~ 100
  feedbackScore: number;      // 0 ~ 100
  explorationScore: number;   // 0 ~ 100
  weightedBaseScore: number;  // 各项加权和
  penaltyMultiplier: number;  // 惩罚总乘数 (<= 1.0)
  penalties: {
    exposureCount: number;
    exposureDecay: number;
    mastered: boolean;
    dismissed: boolean;
    diversityPenalty: number;
  };
  finalScore: number;         // 最终打分
}

/**
 * 打分后的候选卡片
 */
export interface ScoredKnowledgeCard {
  card: KnowledgeCard;
  concept?: KnowledgeConcept;
  score: number;
  breakdown: RecommendationScoreBreakdown;
  matchedConditions: LifeCondition[];
}

/**
 * 推荐请求上下文
 */
export interface RecommendationContext {
  userId: string;
  lifeConditions: LifeCondition[];
  interestedCategories: string[];
  savedCardIds: string[];
  masteredCardIds: string[];
  dismissedCardIds?: { cardId: string; reason: string }[];
  exposures: Record<string, ConceptExposure>; // conceptId -> ConceptExposure
  excludeCardIds?: string[];
  seedRandom?: number;
  timestamp?: string;
}

/**
 * 首页 4 卡流调度结果（《Vibe Coding Master Prompt V4.0》第十五部分：每日推荐配方）
 * 1 × 人生知识档案 (高价值行动卡/核心常识)
 * 1 × 生活盲区
 * 1 × 与你有关
 * 1 × 探索
 */
export interface HomeRecommendationResult {
  coreArchiveCard: KnowledgeCard;    // 1 × 人生知识档案 (行动卡)
  blindspotCard: KnowledgeCard;      // 1 × 生活盲区 (认知反差卡)
  relevantCard: KnowledgeCard;       // 1 × 与你有关 (基于生活状态场景)
  explorationCard: KnowledgeCard;    // 1 × 探索 (跨品类/新视角)
  allCards: KnowledgeCard[];
  generatedAt: string;
  matchedReasonMap: Record<string, string>; // 卡片 ID -> 推荐理由（“租房与独居必备”、“认知反差高能”、“行动性价比高”等）
}
