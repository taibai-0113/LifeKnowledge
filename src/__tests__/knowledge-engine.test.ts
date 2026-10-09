import { describe, it, expect } from "vitest";
import { deduplicationService } from "@/services/deduplication.service";
import { knowledgeService } from "@/services/knowledge.service";
import { knowledgeRepository } from "@/repositories/knowledge.repository";
import { KnowledgeConcept, KnowledgeCard } from "@/types/knowledge";

describe("Phase 2: Knowledge Engine & Deduplication Tests", () => {
  it("语义去重引擎应能识别高度重复的知识条目 (duplicate)", async () => {
    const result = await deduplicationService.checkCandidate({
      title: "后排乘车也必须扣紧安全带",
      summary: "碰撞发生时后排未系安全带会严重撞伤前排",
      tags: ["安全带", "乘车"],
    });

    expect(result.decision).toBe("duplicate");
    expect(result.suggestedConceptId).toBe("concept_seatbelt_safety");
    expect(result.confidence).toBeGreaterThan(0.68);
  });

  it("语义去重引擎应能识别同概念但属于新视角的卡片 (same_concept_new_angle)", async () => {
    const result = await deduplicationService.checkCandidate({
      title: "天天用美白牙膏刷牙会不会磨损牙齿",
      summary: "美白牙膏的摩擦剂原理",
      tags: ["刷牙", "美白", "牙膏"],
    });

    expect(["same_concept_new_angle", "duplicate"]).toContain(result.decision);
    expect(result.candidateMatches.some((m) => m.concept.id === "concept_brushing_whitening")).toBe(true);
  });

  it("语义去重引擎应能放行完全全新的生活概念 (new_concept)", async () => {
    const result = await deduplicationService.checkCandidate({
      title: "断桥铝系统门窗壁厚国标要求",
      summary: "新国标要求外窗铝合金主受力部位壁厚不小于1.8mm",
      tags: ["装修", "门窗"],
    });

    expect(result.decision).toBe("new_concept");
    expect(result.candidateMatches.length).toBe(0);
  });

  it("知识拓扑应完整支持 Concept -> Claim -> Source 的证据追溯链", async () => {
    const detail = await knowledgeService.getCardDetail("card_canning_blindspot");
    expect(detail).not.toBeNull();
    expect(detail?.concept?.id).toBe("concept_canning_preservation");
    expect(detail?.claims.length).toBeGreaterThan(0);
    expect(detail?.sources.length).toBeGreaterThan(0);
    expect(detail?.sources[0].organization).toBe("United States Department of Agriculture (USDA)");
  });

  it("概念关联网应该能双向解析关联知识 (Relations)", async () => {
    const relations = await knowledgeRepository.getRelatedConcepts("concept_smoke_alarm_safety");
    expect(relations.length).toBeGreaterThan(0);
    // 应该关联到油锅起火或插线板
    const relatedIds = relations.map((r) => r.concept.id);
    expect(relatedIds.some((id) => id === "concept_kitchen_oil_fire" || id === "concept_power_strip_daisy_chain")).toBe(true);
  });

  it("支持动态创建与更新知识，且搜索实时生效", async () => {
    const conceptId = "concept_dynamic_emergency_kit";
    const testConcept: KnowledgeConcept = {
      id: conceptId,
      name: "家庭应急医疗急救包的基准配置",
      canonicalQuestion: "家里急救包应该放哪些基础物品？",
      canonicalSummary: "配备碘伏棉棒、无菌纱布、止血绷带及体温计等基础耗材，并定期检查有效期限。",
      domain: "home_safety",
      topic: "emergency_kit",
      status: "published",
      difficulty: 1,
      origin: "editorial",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["急救包", "家庭应急"],
    };

    const testCard: KnowledgeCard = {
      id: "card_dynamic_emergency_kit",
      conceptId: conceptId,
      type: "action",
      module: "life_archive",
      title: "备一个基础急救包并放在全家都知道的位置",
      oneLine: "几十元备好碘伏棉签与医用无菌纱布，关键时刻不用手忙脚乱到处找。",
      grade: "A",
      difficulty: 1,
      status: "published",
      updatedAt: new Date().toISOString(),
      tags: ["急救包", "家庭安全", "应急"],
    };

    await knowledgeService.createConcept(testConcept);
    await knowledgeService.createCard(testCard);

    const searchResults = await knowledgeService.searchKnowledge("急救包");
    expect(searchResults.some((c) => c.id === "card_dynamic_emergency_kit")).toBe(true);
  });
});
