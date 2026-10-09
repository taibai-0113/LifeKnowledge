"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { KnowledgeCardView } from "@/components/cards/KnowledgeCardView";
import { useUserStore } from "@/context/UserStoreContext";
import { HomeRecommendationResult } from "@/types/recommendation";
import {
  Sparkles,
  BookCheck,
  Shuffle,
  RotateCw,
  SlidersHorizontal,
  Compass,
} from "lucide-react";

interface HomeClientProps {
  initialResult: HomeRecommendationResult;
  totalCardsCount: number;
}

export function HomeClient({ initialResult, totalCardsCount }: HomeClientProps) {
  const {
    lifeConditions,
    interestedCategories,
    savedCardIds,
    masteredCardIds,
    exposures,
    dismissedCards,
    recommendationSeed,
    refreshRecommendations,
    recordExposure,
  } = useUserStore();

  const [recommendation, setRecommendation] = useState<HomeRecommendationResult>(initialResult);
  const [isPending, startTransition] = useTransition();

  const exposuresRef = useRef(exposures);
  useEffect(() => {
    exposuresRef.current = exposures;
  }, [exposures]);

  // 当用户生活状态、兴趣、掌握状态或换一组种子变化时，重新运行推荐规则引擎
  useEffect(() => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "guest",
            lifeConditions,
            interestedCategories,
            savedCardIds,
            masteredCardIds,
            dismissedCardIds: dismissedCards,
            exposures: exposuresRef.current,
            seedRandom: recommendationSeed,
          }),
        });

        if (res.ok) {
          const result: HomeRecommendationResult = await res.json();
          setRecommendation(result);

          // 记录本次卡片曝光
          result.allCards?.forEach((card) => {
            recordExposure(card.conceptId, card.id, card.angle);
          });
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }
    });
  }, [
    lifeConditions,
    interestedCategories,
    masteredCardIds,
    savedCardIds,
    dismissedCards,
    recommendationSeed,
    recordExposure,
  ]);

  const { coreArchiveCard, blindspotCard, relevantCard, explorationCard, matchedReasonMap } =
    recommendation;

  const masteredCount = masteredCardIds.length;
  const progressPercent = Math.min(100, Math.round((masteredCount / Math.max(1, totalCardsCount)) * 100));

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <TopBar />

      <div className="px-4 py-4 space-y-6">
        {/* 用户状态微栏 */}
        <div className="flex items-center justify-between bg-zinc-100/70 dark:bg-zinc-900/60 px-3.5 py-2.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 text-xs">
          <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">当前画像:</span>
            <span suppressHydrationWarning>
              {lifeConditions.length > 0
                ? `${lifeConditions.length} 项生活设定生效中`
                : "基础成人通识"}
            </span>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            调整画像
          </Link>
        </div>

        {/* 模块 1：今日核心常识 (人生知识档案) */}
        <section aria-labelledby="core-archive-heading">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-1.5">
              <h2
                id="core-archive-heading"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                今日核心常识
              </h2>
            </div>
            <span className="text-xs text-zinc-400">每日 1 篇必修 · 高价值行动</span>
          </div>

          {coreArchiveCard ? (
            <KnowledgeCardView
              card={coreArchiveCard}
              slotBadge={matchedReasonMap[coreArchiveCard.id] || "人生必修档案"}
            />
          ) : (
            <div className="p-6 text-center text-sm text-zinc-400 bg-zinc-50 rounded-2xl">
              暂无核心卡片
            </div>
          )}
        </section>

        {/* 模块 2：与你有关 (基于当前生活状态场景) */}
        {relevantCard && (
          <section aria-labelledby="relevant-heading">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <h2
                  id="relevant-heading"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  与你有关
                </h2>
              </div>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {matchedReasonMap[relevantCard.id] || "生活场景匹配"}
              </span>
            </div>
            <KnowledgeCardView
              card={relevantCard}
              compact
              slotBadge={matchedReasonMap[relevantCard.id] || "与你有关"}
            />
          </section>
        )}

        {/* 模块 3：扫清一个生活盲区 */}
        {blindspotCard && (
          <section aria-labelledby="blindspot-heading">
            <div className="flex items-center justify-between mb-2.5">
              <h2
                id="blindspot-heading"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                扫清一个盲区
              </h2>
              <Link
                href="/blindspot"
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
              >
                全部盲区
              </Link>
            </div>
            <KnowledgeCardView
              card={blindspotCard}
              compact
              slotBadge={matchedReasonMap[blindspotCard.id] || "认知反差盲区"}
            />
          </section>
        )}

        {/* 模块 4：探索发现 (跨界新知) */}
        {explorationCard && (
          <section aria-labelledby="exploration-heading">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                <h2
                  id="exploration-heading"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  探索新知
                </h2>
              </div>
              <span className="text-xs text-zinc-400">拓展常识边界</span>
            </div>
            <KnowledgeCardView
              card={explorationCard}
              compact
              slotBadge={matchedReasonMap[explorationCard.id] || "探索发现"}
            />
          </section>
        )}

        {/* 换一组推荐按钮 */}
        <div className="flex justify-center pt-1 pb-2">
          <button
            onClick={() => refreshRecommendations()}
            disabled={isPending}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors disabled:opacity-60 min-touch-target cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span>换一组今日推荐</span>
          </button>
        </div>

        {/* 模块 5：人生知识档案掌握进度 */}
        <section className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#151518] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BookCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                人生知识档案
              </h2>
            </div>
            <span
              suppressHydrationWarning
              className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full"
            >
              已掌握 {masteredCount} / {totalCardsCount}
            </span>
          </div>

          <p className="text-xs text-zinc-500 mb-3">
            建立完备的成年人常识体系，消除生活中的信息差与风险盲点。
          </p>

          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mb-4 overflow-hidden">
            <div
              suppressHydrationWarning
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <Link
            href="/archive"
            className="block w-full py-2.5 text-center text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl transition-colors min-touch-target"
          >
            继续补齐档案
          </Link>
        </section>

        {/* 模块 6：随机发现轻入口 */}
        <section className="text-center py-1">
          <Link
            href="/random"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition-colors space-x-1.5 min-touch-target"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>不知道今天看什么？随机抽一张常识</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
