import { KnowledgeConcept } from "./knowledge";

/**
 * 语义去重判定分类
 * 严格遵照《Vibe Coding Master Prompt V4.0》第十一部分 与《内容知识系统设计 V3》第十五部分
 */
export type DeduplicationDecision =
  | "duplicate"               // 完全/高度重复 -> 合并/标记重复
  | "same_concept_new_angle"  // 相同 Concept，新角度 -> 允许创建 Card 挂载到该 Concept
  | "related"                 // 强相关但不同概念 -> 允许创建新 Concept 并自动建立 Relation
  | "new_concept"             // 真正全新概念 -> 允许创建全新 Concept
  | "uncertain";              // 不确定 -> 进入编辑审核队列

export interface CandidateConceptMatch {
  concept: KnowledgeConcept;
  similarity: number;
  reason: string;
}

export interface DeduplicationCheckResult {
  decision: DeduplicationDecision;
  confidence: number;
  reason: string;
  candidateMatches: CandidateConceptMatch[];
  suggestedConceptId?: string;
  suggestedRelationType?: string;
}
