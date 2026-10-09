"use client";

import Link from "next/link";
import { KnowledgeCard } from "@/types/knowledge";
import { ArrowRight, Bookmark, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/context/UserStoreContext";

interface KnowledgeCardViewProps {
  card: KnowledgeCard;
  compact?: boolean;
  slotBadge?: string;
}

export function KnowledgeCardView({ card, compact = false, slotBadge }: KnowledgeCardViewProps) {
  const { savedCardIds, masteredCardIds, toggleSaveCard } = useUserStore();
  const isSaved = savedCardIds.includes(card.id);
  const isMastered = masteredCardIds.includes(card.id);

  const isBlindspot = card.type === "blindspot" || card.type === "misconception";

  return (
    <article
      className={cn(
        "group relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#151518] p-5 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700",
        compact ? "p-4" : "p-5"
      )}
    >
      {/* 头部元信息标签 */}
      <div className="flex items-center justify-between text-xs mb-3 text-zinc-400">
        <div className="flex items-center space-x-2">
          {slotBadge ? (
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
              {slotBadge}
            </span>
          ) : (
            <span className="font-medium text-zinc-600 dark:text-zinc-300">
              {card.module === "life_archive" ? "人生知识档案" : "扫清生活盲区"}
            </span>
          )}
          <span>·</span>
          <span className="truncate max-w-[120px]">{card.subtitle || "日常必修"}</span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {isMastered && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
              <CheckCircle2 className="w-3 h-3 mr-0.5" />
              已掌握
            </span>
          )}

          {card.ratio && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-none bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-center whitespace-nowrap">
              {card.ratio}
            </span>
          )}

          {card.grade && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-none bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 text-center whitespace-nowrap">
              {card.grade} 级
            </span>
          )}
        </div>
      </div>

      {/* 标题 */}
      <h2
        className={cn(
          "font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2",
          compact ? "text-base" : "text-lg"
        )}
      >
        <Link href={`/card/${card.id}`} className="hover:underline">
          {card.title}
        </Link>
      </h2>

      {/* 盲区模式：你以为 / 实际上 */}
      {isBlindspot && card.misconception && (
        <div className="my-3 space-y-2 text-sm bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
          <div className="text-zinc-500">
            <span className="text-zinc-400 font-medium mr-1.5">你可能以为:</span>
            {card.misconception}
          </div>
          <div className="text-zinc-900 dark:text-zinc-200 font-medium pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1.5">
              实际上:
            </span>
            {card.reality || card.oneLine}
          </div>
        </div>
      )}

      {/* 行动模式或标准一句话结论 */}
      {!card.misconception && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
          {card.oneLine}
        </p>
      )}

      {/* 成本与收益 */}
      {(card.benefit || card.cost) && (
        <div className="text-xs text-zinc-500 mb-4 space-y-1 bg-zinc-50/60 dark:bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
          {card.benefit && (
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">收益:</span>
              <span className="text-zinc-700 dark:text-zinc-300 line-clamp-2">{card.benefit}</span>
            </div>
          )}
          {card.cost && (
            <div>
              <span className="text-zinc-400 font-medium mr-1">成本:</span>
              <span className="text-zinc-600 dark:text-zinc-400">{card.cost}</span>
            </div>
          )}
        </div>
      )}

      {/* 底部操作与进入详情链接 */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-xs">
        <Link
          href={`/card/${card.id}`}
          className="inline-flex items-center font-medium text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white"
        >
          <span>完整证据与解读</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            aria-label={isSaved ? "取消收藏" : "收藏卡片"}
            onClick={(e) => {
              e.preventDefault();
              toggleSaveCard(card.id);
            }}
            className={cn(
              "p-1.5 min-touch-target flex items-center justify-center transition-colors",
              isSaved
                ? "text-amber-500 hover:text-amber-600"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
          </button>
        </div>
      </div>
    </article>
  );
}
