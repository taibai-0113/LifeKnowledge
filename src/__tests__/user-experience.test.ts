import { describe, it, expect } from "vitest";
import { userRepository } from "@/repositories/user.repository";
import { ActionItem } from "@/types/user";

describe("Phase 3: User Experience & State Management Tests", () => {
  it("用户应能对卡片进行收藏与已掌握标记，并成功持久化", async () => {
    const cardId = "card_seatbelt_action";
    const userId = "test_user_phase3";

    // 初始状态应为空
    const initialState = await userRepository.getCardState(userId, cardId);
    expect(initialState).toBeNull();

    // 标记收藏
    await userRepository.setCardState({
      userId,
      cardId,
      status: "saved",
      savedAt: new Date().toISOString(),
    });

    const savedCards = await userRepository.getUserCardsByStatus(userId, "saved");
    expect(savedCards).toContain(cardId);

    // 标记已掌握 (覆盖旧状态)
    await userRepository.setCardState({
      userId,
      cardId,
      status: "mastered",
      masteredAt: new Date().toISOString(),
    });

    const masteredCards = await userRepository.getUserCardsByStatus(userId, "mastered");
    expect(masteredCards).toContain(cardId);
  });

  it("待行动清单应支持新增、勾选完成与状态回溯", async () => {
    const userId = "test_user_phase3";
    const actionItem: ActionItem = {
      id: "act_test_smoke_alarm",
      userId,
      cardId: "card_smoke_alarm_action",
      title: "购买并安装独立感烟报警器",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await userRepository.addActionItem(actionItem);

    const items = await userRepository.getActionItems(userId);
    expect(items.some((i) => i.id === "act_test_smoke_alarm")).toBe(true);

    // 勾选完成
    await userRepository.toggleActionItem("act_test_smoke_alarm", true);
    const updated = await userRepository.getActionItems(userId);
    const target = updated.find((i) => i.id === "act_test_smoke_alarm");
    expect(target?.status).toBe("completed");
    expect(target?.completedAt).toBeDefined();

    // 重新变为未完成
    await userRepository.toggleActionItem("act_test_smoke_alarm", false);
    const rolledBack = await userRepository.getActionItems(userId);
    expect(rolledBack.find((i) => i.id === "act_test_smoke_alarm")?.status).toBe("pending");
  });

  it("用户生活状态画像应支持动态配置与更新", async () => {
    const userId = "test_user_phase3";
    await userRepository.saveProfile({
      id: userId,
      lifeConditions: ["living_alone", "driving"],
      interestedCategories: ["home_safety", "traffic"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const profile = await userRepository.getProfile(userId);
    expect(profile).not.toBeNull();
    expect(profile?.lifeConditions).toContain("living_alone");
    expect(profile?.lifeConditions).toContain("driving");
    expect(profile?.lifeConditions).not.toContain("has_children");
  });
});
