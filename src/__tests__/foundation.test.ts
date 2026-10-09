import { describe, it, expect } from "vitest";
import { knowledgeRepository } from "@/repositories/knowledge.repository";
import { knowledgeService } from "@/services/knowledge.service";
import { userRepository } from "@/repositories/user.repository";
import { KnowledgeCard, KnowledgeConcept } from "@/types/knowledge";

describe("Phase 1: Project Foundation & Architecture Tests", () => {
  it("应该能通过服务层读取种子数据，且不硬编码知识内容", async () => {
    const coreCard = await knowledgeService.getDailyCoreCard();
    expect(coreCard).not.toBeNull();
    expect(coreCard?.title).toBe("上车就系安全带，前排后排都系");
    expect(coreCard?.grade).toBe("A+");

    const blindspot = await knowledgeService.getDailyBlindspotCard();
    expect(blindspot).not.toBeNull();
    expect(blindspot?.module).toBe("blindspot");
  });

  it("核心验收原则：增加知识只需要增加数据，而不是修改代码", async () => {
    const newConceptId = "concept_test_smoke_alarm";
    const newConcept: KnowledgeConcept = {
      id: newConceptId,
      name: "家用光电感烟火灾探测报警机制",
      canonicalQuestion: "家里为什么要安装烟雾报警器？",
      canonicalSummary: "光电感烟探测器能在火灾早期阴燃阶段快速发出高分贝蜂鸣警报，为人员逃生争取黄金时间。",
      domain: "home_safety",
      topic: "fire_prevention",
      status: "published",
      difficulty: 1,
      origin: "official_source",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newCard: KnowledgeCard = {
      id: "card_test_smoke_alarm",
      conceptId: newConceptId,
      type: "action",
      module: "life_archive",
      title: "卧室和走廊安装独立式烟雾报警器",
      oneLine: "几十元的小设备，能够在夜间火灾发生的初期几分钟叫醒全家。",
      grade: "A+",
      difficulty: 1,
      status: "published",
      updatedAt: new Date().toISOString(),
      tags: ["家庭安全", "火灾", "逃生"],
    };

    // 仅通过 Repository 数据通道增加数据
    await knowledgeRepository.createConcept(newConcept);
    await knowledgeRepository.createCard(newCard);

    // 验证 Service 层直接获取到新增数据
    const detail = await knowledgeService.getCardDetail("card_test_smoke_alarm");
    expect(detail).not.toBeNull();
    expect(detail?.card.title).toBe("卧室和走廊安装独立式烟雾报警器");
    expect(detail?.concept?.name).toBe("家用光电感烟火灾探测报警机制");

    // 验证搜索层能够自然命中新增数据
    const searchResults = await knowledgeService.searchKnowledge("烟雾报警器");
    expect(searchResults.some((c) => c.id === "card_test_smoke_alarm")).toBe(true);
  });

  it("用户状态与生活画像数据结构可扩展", async () => {
    const profile = await userRepository.getProfile("guest");
    expect(profile).not.toBeNull();
    expect(profile?.lifeConditions).toContain("renting");

    // 状态持久化模拟
    await userRepository.setCardState({
      userId: "guest",
      cardId: "card_seatbelt_action",
      status: "mastered",
      masteredAt: new Date().toISOString(),
    });

    const masteredCards = await userRepository.getUserCardsByStatus("guest", "mastered");
    expect(masteredCards).toContain("card_seatbelt_action");
  });
});
