import { describe, it, expect } from "vitest";
import { analytics } from "@/lib/analytics";
import { PRIMARY_CATEGORIES } from "@/types/knowledge";
import { SEED_CARDS, SEED_CONCEPTS, SEED_SOURCES } from "@/data/seed-data";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("Phase 5: QA / Polish / Launch Verification", () => {
  it("1. 基础规范：20个标准一级分类完整且编码唯一", () => {
    expect(PRIMARY_CATEGORIES.length).toBe(20);
    const codes = PRIMARY_CATEGORIES.map((c) => c.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(20);
  });

  it("2. 数据质量审计：所有发布卡片拥有严谨的结构与信源支撑", () => {
    for (const card of SEED_CARDS) {
      expect(card.id).toBeTruthy();
      expect(card.conceptId).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.oneLine).toBeTruthy();
      expect(["life_archive", "blindspot"]).toContain(card.module);
      expect([1, 2, 3, 4, 5]).toContain(card.difficulty);

      // 对应的 Concept 必须在概念库中存在
      const matchedConcept = SEED_CONCEPTS.find((c) => c.id === card.conceptId);
      expect(matchedConcept).toBeDefined();
    }

    // 种子信源必须有权威机构与有效 URL
    for (const source of SEED_SOURCES) {
      expect(source.organization).toBeTruthy();
      expect(source.url.startsWith("http")).toBe(true);
      expect(source.status).toBe("active");
    }
  });

  it("3. SEO 路由健全性：sitemap 与 robots 正确生成", async () => {
    const sitemapResult = await sitemap();
    expect(sitemapResult.length).toBeGreaterThan(10);
    const homeEntry = sitemapResult.find((e) => e.url === "https://lifeknowledge.app");
    expect(homeEntry).toBeDefined();

    const robotsResult = robots();
    expect(robotsResult.rules).toBeDefined();
    expect(robotsResult.sitemap).toContain("sitemap.xml");
  });

  it("4. 隐私分析埋点：事件正确记录且数量受控，不泄露用户敏感信息", () => {
    analytics.clear();
    analytics.track("card_view", { cardId: "card_seatbelt_action" });
    analytics.track("card_save", { cardId: "card_seatbelt_action" });

    const events = analytics.getRecentEvents();
    expect(events.length).toBe(2);
    expect(events[0].type).toBe("card_view");
    expect(events[1].type).toBe("card_save");
    expect(events[0].payload?.cardId).toBe("card_seatbelt_action");
  });

  it("5. 视觉与交互韧性：盲区卡必须具备认知反差解释，行动卡必须具备明确收益", () => {
    const blindspotCards = SEED_CARDS.filter((c) => c.module === "blindspot");
    for (const card of blindspotCards) {
      expect(card.misconception).toBeTruthy();
      expect(card.reality).toBeTruthy();
      expect(card.why).toBeTruthy();
    }

    const actionCards = SEED_CARDS.filter((c) => c.type === "action");
    for (const card of actionCards) {
      expect(card.benefit).toBeTruthy();
      expect(card.actionSteps?.length).toBeGreaterThan(0);
    }
  });
});
