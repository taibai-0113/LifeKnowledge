import { KnowledgeConcept } from "@/types/knowledge";
import { DeduplicationCheckResult, CandidateConceptMatch } from "@/types/deduplication";
import { IKnowledgeRepository, knowledgeRepository } from "@/repositories/knowledge.repository";

export class DeduplicationService {
  constructor(private repo: IKnowledgeRepository = knowledgeRepository) {}

  /**
   * 提取中文核心字符集（去除停用虚词与标点）
   */
  private cleanCharSet(text: string): Set<string> {
    const cleaned = text.toLowerCase().replace(/[\s\p{P}为什么怎么如何是不是有没有到底其实了的吗呢吧也一个就会着]/gu, "");
    return new Set(cleaned.split("").filter(Boolean));
  }

  /**
   * 计算字符级核心概念交并比与标签匹配度
   */
  private calculateConceptSimilarity(
    candidateTitle: string,
    candidateSummary: string,
    candidateTags: string[],
    concept: KnowledgeConcept
  ): number {
    const charsCand = this.cleanCharSet(`${candidateTitle} ${candidateSummary}`);
    const charsQ = this.cleanCharSet(concept.canonicalQuestion);
    const charsN = this.cleanCharSet(concept.name);

    if (charsCand.size === 0) return 0;

    // 与 canonicalQuestion 的核心交集 (要求有效问题字符数 >= 4)
    let countQ = 0;
    for (const c of charsCand) {
      if (charsQ.has(c)) countQ++;
    }
    const ratioQ = charsQ.size >= 4 ? countQ / Math.min(charsCand.size, charsQ.size) : 0;

    // 与概念名称的交集 (要求有效概念名字符数 >= 4)
    let countN = 0;
    for (const c of charsCand) {
      if (charsN.has(c)) countN++;
    }
    const ratioN = charsN.size >= 4 ? countN / Math.min(charsCand.size, charsN.size) : 0;

    const textMatch = Math.max(ratioQ, ratioN);

    // 标签匹配
    const cTags = new Set(concept.tags || []);
    let tagMatch = 0;
    for (const t of candidateTags) {
      if (cTags.has(t)) tagMatch++;
    }
    const tagRatio = candidateTags.length > 0 ? tagMatch / candidateTags.length : 0;

    // 综合加权
    const finalScore = textMatch * 0.7 + tagRatio * 0.3;
    return Math.min(1.0, Math.round(finalScore * 100) / 100);
  }

  /**
   * 执行语义去重分析
   */
  async checkCandidate(params: {
    title: string;
    summary?: string;
    tags?: string[];
    domain?: string;
  }): Promise<DeduplicationCheckResult> {
    const concepts = await this.repo.getAllConcepts();
    const matches: CandidateConceptMatch[] = [];

    for (const concept of concepts) {
      const score = this.calculateConceptSimilarity(
        params.title,
        params.summary || "",
        params.tags || [],
        concept
      );

      if (score >= 0.25) {
        let reason = "关键词与文本存在部分重叠";
        if (score >= 0.65) {
          reason = `与已收录概念「${concept.name}」在核心结论和问题表述上高度一致，疑似重复。`;
        } else if (score >= 0.35) {
          reason = `与「${concept.name}」属于同一生活常识主题，构成该概念的新视角或延展卡片。`;
        } else {
          reason = `与「${concept.name}」存在上下游相关关系。`;
        }

        matches.push({
          concept,
          similarity: score,
          reason,
        });
      }
    }

    matches.sort((a, b) => b.similarity - a.similarity);
    const topMatch = matches[0];

    if (!topMatch || topMatch.similarity < 0.35) {
      return {
        decision: "new_concept",
        confidence: 0.95,
        reason: "未在知识库中发现强相似概念，确认为全新知识节点，建议直接创建新 Concept。",
        candidateMatches: matches.filter((m) => m.similarity >= 0.35),
      };
    }

    if (topMatch.similarity >= 0.70) {
      return {
        decision: "duplicate",
        confidence: topMatch.similarity,
        reason: topMatch.reason,
        candidateMatches: matches.slice(0, 3),
        suggestedConceptId: topMatch.concept.id,
      };
    }

    if (topMatch.similarity >= 0.45) {
      return {
        decision: "same_concept_new_angle",
        confidence: topMatch.similarity,
        reason: topMatch.reason,
        candidateMatches: matches.slice(0, 3),
        suggestedConceptId: topMatch.concept.id,
      };
    }

    return {
      decision: "related",
      confidence: topMatch.similarity,
      reason: topMatch.reason,
      candidateMatches: matches.slice(0, 3),
      suggestedConceptId: topMatch.concept.id,
      suggestedRelationType: "related_to",
    };
  }
}

export const deduplicationService = new DeduplicationService();
