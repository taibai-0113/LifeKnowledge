"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KnowledgeCard } from "@/types/knowledge";
import { LifeCondition } from "@/types/user";
import { useUserStore } from "@/context/UserStoreContext";
import { KnowledgeCardView } from "@/components/cards/KnowledgeCardView";
import {
  Bookmark,
  CheckCircle2,
  ListTodo,
  User,
  Trash2,
  Check,
  Compass,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileClientProps {
  allCards?: KnowledgeCard[];
}

const LIFE_CONDITION_OPTIONS: { id: LifeCondition; label: string }[] = [
  { id: "living_alone", label: "独居生活" },
  { id: "renting", label: "租房生活" },
  { id: "driving", label: "经常开车" },
  { id: "cooking_often", label: "自己做饭" },
  { id: "has_pet", label: "养宠物" },
  { id: "has_partner", label: "有伴侣" },
  { id: "has_children", label: "有孩子" },
  { id: "frequent_traveler", label: "经常旅行" },
  { id: "freelancing", label: "自由职业" },
];

export function ProfileClient({ allCards = [] }: ProfileClientProps) {
  const {
    savedCardIds,
    masteredCardIds,
    actionItems,
    lifeConditions,
    toggleActionItem,
    removeActionItem,
    toggleLifeCondition,
  } = useUserStore();

  const [activeTab, setActiveTab] = useState<"actions" | "saved" | "mastered" | "conditions">("actions");

  // 维护已载入的卡片缓存
  const [cardsCache, setCardsCache] = useState<Map<string, KnowledgeCard>>(() => {
    return new Map(allCards.map((c) => [c.id, c]));
  });
  const [loadingCards, setLoadingCards] = useState(false);

  // 当用户切到收藏或掌握 tab 时，按需拉取所需卡片，避免初次载入全量卡片阻塞
  useEffect(() => {
    const targetIds = activeTab === "saved" ? savedCardIds : activeTab === "mastered" ? masteredCardIds : [];
    const missingIds = targetIds.filter((id) => !cardsCache.has(id));

    if (missingIds.length === 0) return;

    setLoadingCards(true);
    fetch(`/api/cards?ids=${encodeURIComponent(missingIds.join(","))}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {
          setCardsCache((prev) => {
            const next = new Map(prev);
            data.cards.forEach((c: KnowledgeCard) => next.set(c.id, c));
            return next;
          });
        }
      })
      .catch((e) => console.error("Failed to load cards for profile:", e))
      .finally(() => setLoadingCards(false));
  }, [activeTab, savedCardIds, masteredCardIds, cardsCache]);

  const savedCards = savedCardIds
    .map((id) => cardsCache.get(id))
    .filter(Boolean) as KnowledgeCard[];

  const masteredCards = masteredCardIds
    .map((id) => cardsCache.get(id))
    .filter(Boolean) as KnowledgeCard[];

  const pendingActions = actionItems.filter((item) => item.status === "pending");
  const completedActions = actionItems.filter((item) => item.status === "completed");

  return (
    <div className="space-y-6">
      {/* 头部个人档案卡 */}
      <section className="flex items-center space-x-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800">
        <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            我的生活知识档案
          </h2>
          <p className="text-xs text-zinc-400">已记录你的常识掌握进度与生活待办</p>
        </div>
      </section>

      {/* 核心指标统计 (兼作 Tab 切换) */}
      <section className="grid grid-cols-4 gap-2 text-center text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("actions")}
          className={cn(
            "p-3 rounded-2xl border transition-all cursor-pointer touch-manipulation select-none active:scale-95",
            activeTab === "actions"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold shadow-xs"
              : "bg-white dark:bg-[#151518] border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          <div className="flex items-center justify-center mb-1">
            <ListTodo className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-base font-bold" suppressHydrationWarning>
            {pendingActions.length}
          </div>
          <div className="text-[11px] opacity-80">待行动</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={cn(
            "p-3 rounded-2xl border transition-all cursor-pointer touch-manipulation select-none active:scale-95",
            activeTab === "saved"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold shadow-xs"
              : "bg-white dark:bg-[#151518] border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          <div className="flex items-center justify-center mb-1">
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold" suppressHydrationWarning>
            {savedCards.length}
          </div>
          <div className="text-[11px] opacity-80">收藏</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mastered")}
          className={cn(
            "p-3 rounded-2xl border transition-all cursor-pointer touch-manipulation select-none active:scale-95",
            activeTab === "mastered"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold shadow-xs"
              : "bg-white dark:bg-[#151518] border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          <div className="flex items-center justify-center mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base font-bold" suppressHydrationWarning>
            {masteredCards.length}
          </div>
          <div className="text-[11px] opacity-80">已掌握</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("conditions")}
          className={cn(
            "p-3 rounded-2xl border transition-all cursor-pointer touch-manipulation select-none active:scale-95",
            activeTab === "conditions"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold shadow-xs"
              : "bg-white dark:bg-[#151518] border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          <div className="flex items-center justify-center mb-1">
            <Compass className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-base font-bold" suppressHydrationWarning>
            {lifeConditions.length}
          </div>
          <div className="text-[11px] opacity-80">生活状态</div>
        </button>
      </section>

      {/* Tab 1: 待行动清单 */}
      {activeTab === "actions" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">知识落到生活 · 待办清单</span>
            <span>未完成 {pendingActions.length} 项</span>
          </div>

          <div className="space-y-2">
            {pendingActions.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#151518] flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleActionItem(item.id)}
                  className="flex items-center space-x-2.5 text-left flex-1 py-1 cursor-pointer touch-manipulation select-none active:opacity-75"
                >
                  <div className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.title}</span>
                </button>

                <div className="flex items-center space-x-1 shrink-0">
                  <Link
                    href={`/card/${item.cardId}`}
                    className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="查看对应常识卡片"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeActionItem(item.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="删除此项"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {pendingActions.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-1">
                <p>当前没有待办事项</p>
                <p className="text-[11px] text-zinc-400">在行动卡中点击「加入待行动」，让常识真正变成生活习惯</p>
              </div>
            )}
          </div>

          {/* 已完成列表 */}
          {completedActions.length > 0 && (
            <div className="pt-3 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                已完成 ({completedActions.length})
              </span>
              {completedActions.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-400"
                >
                  <button
                    type="button"
                    onClick={() => toggleActionItem(item.id)}
                    className="flex items-center space-x-2.5 text-left flex-1 py-1 line-through cursor-pointer touch-manipulation select-none active:opacity-75"
                  >
                    <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{item.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeActionItem(item.id)}
                    className="p-2 text-zinc-300 hover:text-red-500 cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: 收藏列表 */}
      {activeTab === "saved" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">已收藏的常识</span>
            <span>共 {savedCards.length} 条</span>
          </div>

          <div className="space-y-3">
            {savedCards.map((card) => (
              <KnowledgeCardView key={card.id} card={card} compact />
            ))}

            {savedCards.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                还没有收藏任何常识。在浏览时点击书签图标即可收藏。
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 3: 已掌握列表 */}
      {activeTab === "mastered" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">已完全掌握的知识</span>
            <span>共 {masteredCards.length} 条</span>
          </div>

          <div className="space-y-3">
            {masteredCards.map((card) => (
              <KnowledgeCardView key={card.id} card={card} compact />
            ))}

            {masteredCards.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                还没有标记已掌握的内容。读完卡片后点击「已掌握」即可记录。
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 4: 生活状态配置 */}
      {activeTab === "conditions" && (
        <section className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              设置当前生活状态
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              只用于精准过滤与你生活有关的高优先级常识，随时可自由修改，保护个人隐私。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LIFE_CONDITION_OPTIONS.map((opt) => {
              const active = lifeConditions.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleLifeCondition(opt.id)}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-medium text-left transition-all min-touch-target flex items-center justify-between cursor-pointer touch-manipulation select-none active:scale-[0.98]",
                    active
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-xs"
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 active:bg-zinc-200"
                  )}
                >
                  <span>{opt.label}</span>
                  {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 后台 CMS 入口链接 */}
      <section className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <span>系统管理</span>
        <Link
          href="/admin"
          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center py-2 px-1 cursor-pointer touch-manipulation select-none"
        >
          <span>进入知识库 CMS 后台</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </Link>
      </section>
    </div>
  );
}
