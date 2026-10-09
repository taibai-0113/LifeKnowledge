/**
 * 核心知识体系数据契约 (Knowledge Core Schemas)
 * 严格遵照《Vibe Coding Master Prompt V4.0》与《内容知识系统设计 V3.0》规范定义
 */

export type ConceptStatus = "draft" | "candidate" | "published" | "review" | "archived";
export type ConceptDifficulty = 1 | 2 | 3 | 4 | 5;
export type ConceptOrigin =
  | "reference_book"
  | "editorial"
  | "user_question"
  | "research"
  | "official_source"
  | "ai_discovered"
  | "imported";

export interface KnowledgeConcept {
  id: string;
  name: string;
  canonicalQuestion: string;
  canonicalSummary: string;
  domain: string;
  topic?: string;
  parentConceptId?: string;
  status: ConceptStatus;
  difficulty: ConceptDifficulty;
  origin: ConceptOrigin;
  qualityScore?: number;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  nextReviewAt?: string;
  tags?: string[];
}

export type ClaimType = "fact" | "inference" | "recommendation";
export type EvidenceLevel = "very_strong" | "strong" | "moderate" | "limited" | "uncertain";
export type ClaimStatus = "supported" | "mixed" | "uncertain" | "controversial" | "outdated";

export interface KnowledgeClaim {
  id: string;
  conceptId: string;
  claimType: ClaimType;
  claimText: string;
  canonical: boolean;
  confidence?: number;
  evidenceLevel: EvidenceLevel;
  status: ClaimStatus;
  version: number;
  sourceIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type CardType =
  | "action"
  | "blindspot"
  | "misconception"
  | "explanation"
  | "scenario"
  | "emergency";

export type CardModule = "life_archive" | "blindspot";
export type CardGrade = "A+" | "A" | "B" | "C";
export type CardRiskLevel = "low" | "medium" | "high" | "critical";
export type CardAngle =
  | "what"
  | "why"
  | "how"
  | "misconception"
  | "risk"
  | "action"
  | "comparison"
  | "example"
  | "scenario"
  | "cost"
  | "benefit"
  | "exception"
  | "history"
  | "mechanism"
  | "explanation";

export type CardStatus = "draft" | "review" | "published" | "archived";

export interface KnowledgeCard {
  id: string;
  conceptId: string;
  primaryClaimId?: string;
  type: CardType;
  module: CardModule;
  title: string;
  subtitle?: string;
  oneLine: string;
  body?: string;
  // 盲区模块专有结构
  misconception?: string;
  reality?: string;
  why?: string;
  // 行动卡专有结构
  actionSteps?: string[];
  cost?: string;
  benefit?: string;
  notes?: string;
  ratio?: string;
  grade?: CardGrade;
  evidenceLevel?: EvidenceLevel;
  riskLevel?: CardRiskLevel;
  angle?: CardAngle;
  difficulty: ConceptDifficulty;
  region?: string[];
  audience?: string[];
  scenarios?: string[];
  tags?: string[];
  status: CardStatus;
  publishedAt?: string;
  updatedAt: string;
  verifiedAt?: string;
}

export type SourceType =
  | "official"
  | "guideline"
  | "systematic_review"
  | "meta_analysis"
  | "peer_reviewed"
  | "database"
  | "textbook"
  | "professional_org"
  | "other";

export type SourceStatus = "active" | "broken" | "outdated" | "review";

export interface KnowledgeSource {
  id: string;
  organization?: string;
  title: string;
  author?: string;
  url: string;
  sourceType: SourceType;
  publicationDate?: string;
  region?: string;
  language?: string;
  retrievedAt: string;
  status: SourceStatus;
  citation?: string;
}

export type RelationType =
  | "related_to"
  | "explains"
  | "explained_by"
  | "prerequisite"
  | "example_of"
  | "misconception_about"
  | "opposite_of"
  | "applies_to"
  | "caused_by"
  | "leads_to"
  | "alternative_to";

export interface KnowledgeRelation {
  id: string;
  sourceConceptId: string;
  relationType: RelationType;
  targetConceptId: string;
  confidence: number;
  createdBy?: string;
  createdAt: string;
}

export interface KnowledgeCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  order: number;
}

/**
 * 20 个标准一级分类定义
 */
export const PRIMARY_CATEGORIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "health", name: "健康与身体" },
  { code: "diet", name: "饮食与营养" },
  { code: "oral", name: "口腔" },
  { code: "sleep", name: "睡眠" },
  { code: "exercise", name: "运动" },
  { code: "medical", name: "医疗与就医" },
  { code: "medication", name: "用药" },
  { code: "home_safety", name: "家庭安全" },
  { code: "kitchen", name: "食品与厨房" },
  { code: "living", name: "居住" },
  { code: "traffic", name: "交通" },
  { code: "money", name: "金钱" },
  { code: "legal", name: "法律与权益" },
  { code: "digital", name: "网络与数字生活" },
  { code: "work", name: "工作" },
  { code: "family", name: "家庭与关系" },
  { code: "fertility", name: "性与生育" },
  { code: "travel", name: "出行与旅行" },
  { code: "shopping", name: "消费与购物" },
  { code: "social", name: "社会生活" },
];
