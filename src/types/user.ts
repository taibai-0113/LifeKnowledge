/**
 * 用户状态与个性化数据契约 (User State Schemas)
 * 严格遵照《Vibe Coding Master Prompt V4.0》第十三、二十六部分定义
 */

export type LifeCondition =
  | "living_alone"       // 独居
  | "renting"            // 租房
  | "driving"            // 开车
  | "has_pet"            // 养宠物
  | "has_partner"        // 有伴侣
  | "has_children"       // 有孩子
  | "frequent_traveler"  // 经常旅行
  | "cooking_often"      // 自己做饭
  | "freelancing";       // 自由职业

export interface UserProfile {
  id: string;
  nickname?: string;
  avatarUrl?: string;
  lifeConditions: LifeCondition[];
  interestedCategories: string[];
  createdAt: string;
  updatedAt: string;
}

export type CardInteractionStatus =
  | "unseen"
  | "seen"
  | "saved"
  | "known"
  | "mastered"
  | "acted"
  | "dismissed";

export interface UserCardState {
  userId: string;
  cardId: string;
  status: CardInteractionStatus;
  firstSeenAt?: string;
  lastSeenAt?: string;
  savedAt?: string;
  masteredAt?: string;
  actedAt?: string;
  dismissReason?: "already_know" | "not_relevant" | "too_complex" | "not_interested";
  rating?: number;
}

export interface ConceptExposure {
  conceptId: string;
  userId: string;
  timesSeen: number;
  lastSeenAt: string;
  cardsSeen: string[];
  anglesSeen: string[];
  mastered: boolean;
}

export type ActionItemStatus = "pending" | "completed" | "cancelled";

export interface ActionItem {
  id: string;
  userId: string;
  cardId: string;
  title: string;
  status: ActionItemStatus;
  createdAt: string;
  completedAt?: string;
}

export interface ReadingHistoryItem {
  id: string;
  userId: string;
  cardId: string;
  readAt: string;
  scrollPercentage?: number;
}
