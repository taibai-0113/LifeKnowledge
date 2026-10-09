"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { KnowledgeCard } from "@/types/knowledge";
import { KnowledgeCardView } from "./KnowledgeCardView";
import { Loader2, ArrowDown } from "lucide-react";

interface CardInfiniteListProps {
  initialCards: KnowledgeCard[];
  totalCount: number;
  module: "life_archive" | "blindspot";
  emptyMessage?: string;
}

export function CardInfiniteList({
  initialCards,
  totalCount,
  module,
  emptyMessage = "暂无条目",
}: CardInfiniteListProps) {
  const [cards, setCards] = useState<KnowledgeCard[]>(initialCards);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCards.length < totalCount);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/cards?module=${module}&offset=${cards.length}&limit=20`
      );
      if (res.ok) {
        const data = await res.json();
        const newCards: KnowledgeCard[] = data.cards || [];
        setCards((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const uniqueNew = newCards.filter((c) => !existingIds.has(c.id));
          return [...prev, ...uniqueNew];
        });
        setHasMore(data.hasMore ?? cards.length + newCards.length < totalCount);
      }
    } catch (err) {
      console.error("Failed to load more cards:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, module, cards.length, totalCount]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>当前已展示 {cards.length} 项</span>
        <span>共 {totalCount} 项</span>
      </div>

      {cards.map((card) => (
        <KnowledgeCardView key={card.id} card={card} />
      ))}

      {cards.length === 0 && (
        <div className="p-8 text-center text-sm text-zinc-400">
          {emptyMessage}
        </div>
      )}

      {/* 滚动监听触底哨兵 */}
      <div ref={observerTarget} className="h-4" />

      {/* 加载中与加载更多操作区 */}
      {hasMore && (
        <div className="flex justify-center pt-2 pb-6">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer min-touch-target shadow-2xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>加载更多知识点...</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3.5 h-3.5" />
                <span>滑动或点击加载更多 ({cards.length}/{totalCount})</span>
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && cards.length > 0 && (
        <div className="text-center py-6 text-xs text-zinc-400">
          已加载全量 {cards.length} 项内容
        </div>
      )}
    </div>
  );
}
