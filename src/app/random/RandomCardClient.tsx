"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { KnowledgeCard } from "@/types/knowledge";
import { KnowledgeCardView } from "@/components/cards/KnowledgeCardView";
import {
  Shuffle,
  Bookmark,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  BookOpen,
  Compass,
  Layers,
} from "lucide-react";
import { useUserStore } from "@/context/UserStoreContext";
import { cn } from "@/lib/utils";
import {
  getSwipeAxis,
  getVerticalSwipeDirection,
  SwipeAxis,
} from "@/lib/swipe";

interface RandomCardClientProps {
  initialCards?: KnowledgeCard[];
  archiveCards?: KnowledgeCard[];
  blindspotCards?: KnowledgeCard[];
  totalArchiveCount?: number;
  totalBlindspotCount?: number;
}

type ExploreMode = "all" | "archive" | "blindspot";

export function RandomCardClient({
  initialCards = [],
  archiveCards = [],
  blindspotCards = [],
  totalArchiveCount,
  totalBlindspotCount,
}: RandomCardClientProps) {
  // 1. 整理与划分卡片池
  const [extraArchive, setExtraArchive] = useState<KnowledgeCard[]>([]);
  const [extraBlindspot, setExtraBlindspot] = useState<KnowledgeCard[]>([]);

  const archivePool = useMemo(() => {
    const base = archiveCards.length > 0 ? archiveCards : initialCards.filter((c) => c.module === "life_archive");
    const merged = [...base, ...extraArchive];
    const map = new Map(merged.map((c) => [c.id, c]));
    return Array.from(map.values());
  }, [archiveCards, initialCards, extraArchive]);

  const blindspotPool = useMemo(() => {
    const base = blindspotCards.length > 0 ? blindspotCards : initialCards.filter((c) => c.module === "blindspot");
    const merged = [...base, ...extraBlindspot];
    const map = new Map(merged.map((c) => [c.id, c]));
    return Array.from(map.values());
  }, [blindspotCards, initialCards, extraBlindspot]);

  const allPool = useMemo(() => {
    const merged = [...archivePool, ...blindspotPool];
    const map = new Map(merged.map((c) => [c.id, c]));
    return Array.from(map.values());
  }, [archivePool, blindspotPool]);

  // 2. 当前选择的探索模式
  const [mode, setMode] = useState<ExploreMode>("all");

  const currentPool = useMemo(() => {
    if (mode === "archive") return archivePool;
    if (mode === "blindspot") return blindspotPool;
    return allPool;
  }, [mode, archivePool, blindspotPool, allPool]);

  // 3. 历史记录栈（支持上下滑动回退与前进）
  const [history, setHistory] = useState<string[]>(() => {
    const initialPool =
      archiveCards.length > 0 || blindspotCards.length > 0
        ? [...archiveCards, ...blindspotCards]
        : initialCards;
    if (initialPool.length === 0) return [];
    return [initialPool[0].id];
  });
  const [historyIndex, setHistoryIndex] = useState<number>(() => (history.length > 0 ? 0 : -1));
  const [animDirection, setAnimDirection] = useState<"up" | "down" | null>(null);

  // 获取当前卡片
  const currentCard = useMemo(() => {
    if (historyIndex < 0 || historyIndex >= history.length) return null;
    const cardId = history[historyIndex];
    return currentPool.find((c) => c.id === cardId) || allPool.find((c) => c.id === cardId) || null;
  }, [history, historyIndex, currentPool, allPool]);

  // 后台自动补充卡片池
  const fetchingMore = useRef(false);
  const replenishPool = useCallback(async (currentMode: ExploreMode) => {
    if (fetchingMore.current) return;
    fetchingMore.current = true;
    try {
      const res = await fetch(`/api/cards/random?mode=${currentMode}&count=15`);
      if (res.ok) {
        const data = await res.json();
        const incoming: KnowledgeCard[] = data.cards || [];
        if (currentMode === "archive" || currentMode === "all") {
          setExtraArchive((prev) => [...prev, ...incoming.filter((c) => c.module === "life_archive")]);
        }
        if (currentMode === "blindspot" || currentMode === "all") {
          setExtraBlindspot((prev) => [...prev, ...incoming.filter((c) => c.module === "blindspot")]);
        }
      }
    } catch (e) {
      console.warn("Failed to replenish random cards:", e);
    } finally {
      fetchingMore.current = false;
    }
  }, []);

  // 4. 用户状态与交互
  const { savedCardIds, masteredCardIds, toggleSaveCard, toggleMasterCard } = useUserStore();

  const isSaved = currentCard ? savedCardIds.includes(currentCard.id) : false;
  const isMastered = currentCard ? masteredCardIds.includes(currentCard.id) : false;

  // 5. 下一张（换一张 / 向上滑）
  const handleNext = useCallback(() => {
    if (currentPool.length === 0) return;

    setAnimDirection("up");
    setTimeout(() => setAnimDirection(null), 250);

    // 换卡片时自动重置视口到顶部
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    // 如果当前在历史记录中间，直接向前走
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      return;
    }

    // 否则从池中随机抽取一张不同的卡片
    const currentId = history[historyIndex];
    const candidatePool = currentPool.filter((c) => c.id !== currentId);

    // 候选池偏少时自动异步补充
    if (candidatePool.length < 8) {
      replenishPool(mode);
    }

    const nextCard =
      candidatePool.length > 0
        ? candidatePool[Math.floor(Math.random() * candidatePool.length)]
        : currentPool[0];

    if (nextCard) {
      setHistory((prev) => [...prev, nextCard.id]);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [currentPool, history, historyIndex, mode, replenishPool]);

  // 6. 上一张（向下滑）
  const handlePrev = useCallback(() => {
    if (historyIndex > 0) {
      setAnimDirection("down");
      setTimeout(() => setAnimDirection(null), 250);
      setHistoryIndex((prev) => prev - 1);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  }, [historyIndex]);

  // 7. 切换模块
  const handleSelectMode = (newMode: ExploreMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    const targetPool =
      newMode === "archive"
        ? archivePool
        : newMode === "blindspot"
        ? blindspotPool
        : allPool;

    if (targetPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * targetPool.length);
      const nextCard = targetPool[randomIndex];
      setHistory([nextCard.id]);
      setHistoryIndex(0);
    } else {
      setHistory([]);
      setHistoryIndex(-1);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  // 8. 滑动手势检测
  // 核心改动：不阻止原生垂直滚动，支持用户在长卡片内正常向下滑动阅读全文！
  // 仅在滑到底部（或卡片较短）时向上滑才切下一张；仅在滑到顶部时向下滑才回退上一张。
  const gestureStart = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const suppressClickUntil = useRef(0);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button, input, select, textarea, [role='button']")) {
      return;
    }

    const touch = event.touches[0];
    gestureStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!gestureStart.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - gestureStart.current.x;
    const deltaY = touch.clientY - gestureStart.current.y;
    const duration = Date.now() - gestureStart.current.time;
    gestureStart.current = null;

    // 必须有明显垂直移动趋势 (大于 60px 且垂直位移显著大于水平位移)
    if (Math.abs(deltaY) < 60 || Math.abs(deltaY) <= Math.abs(deltaX) * 1.5) {
      return;
    }

    const scrollY = typeof window !== "undefined" ? window.scrollY || document.documentElement.scrollTop : 0;
    const winHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const docHeight = typeof window !== "undefined" ? document.documentElement.scrollHeight : 800;

    const isAtBottom = scrollY + winHeight >= docHeight - 40;
    const isShortCard = docHeight <= winHeight + 60;
    const isAtTop = scrollY <= 15;

    // 向上滑动手势 (deltaY < 0)：切换下一张
    if (deltaY < -60) {
      // 只有处于长卡片底部或者内容不溢出屏幕时才切卡，避免正在阅读卡片中间内容时被误切
      if (isAtBottom || isShortCard) {
        suppressClickUntil.current = Date.now() + 350;
        handleNext();
      }
    } else if (deltaY > 60) {
      // 向下滑动手势 (deltaY > 0)：返回上一张
      if (isAtTop && historyIndex > 0) {
        suppressClickUntil.current = Date.now() + 350;
        handlePrev();
      }
    }
  };

  const handleCardClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (Date.now() < suppressClickUntil.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  if (!currentCard) {
    return (
      <div className="p-12 text-center text-sm text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
        知识库正在填充中，暂无可探索的卡片
      </div>
    );
  }

  const hasPrev = historyIndex > 0;
  const totalAllCount =
    totalArchiveCount && totalBlindspotCount
      ? totalArchiveCount + totalBlindspotCount
      : allPool.length;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-16">
      {/* 顶部探索模式切换 */}
      <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl text-xs">
        <button
          type="button"
          onClick={() => handleSelectMode("all")}
          className={cn(
            "flex-1 py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer touch-manipulation flex items-center justify-center space-x-1",
            mode === "all"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          )}
        >
          <Layers className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
          <span>全部 ({totalAllCount})</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode("archive")}
          className={cn(
            "flex-1 py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer touch-manipulation flex items-center justify-center space-x-1",
            mode === "archive"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          )}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span>人生档案 ({totalArchiveCount || archivePool.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode("blindspot")}
          className={cn(
            "flex-1 py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer touch-manipulation flex items-center justify-center space-x-1",
            mode === "blindspot"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          )}
        >
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>生活盲区 ({totalBlindspotCount || blindspotPool.length})</span>
        </button>
      </div>

      {/* 滑动手势提示条与快速操作 */}
      <div className="flex items-center justify-between px-2 text-[11px] text-zinc-400 select-none">
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center space-x-1 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ChevronUp className="w-3.5 h-3.5 animate-pulse text-zinc-400" />
          <span>向上滑到底切下一张</span>
        </button>
        <div className="text-zinc-300 dark:text-zinc-600">·</div>
        <button
          type="button"
          onClick={handlePrev}
          disabled={!hasPrev}
          className={cn(
            "flex items-center space-x-1 transition-colors",
            hasPrev ? "hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer" : "opacity-40"
          )}
        >
          <span>向下滑回上一张</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <div className="text-zinc-300 dark:text-zinc-600">·</div>
        <span>第 {historyIndex + 1} 张</span>
      </div>

      {/* 卡片展示区域（支持原生滚动阅读全文，不被粗暴截断） */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClickCapture={handleCardClickCapture}
        className={cn(
          "transition-all duration-200 transform relative z-10",
          animDirection === "up" && "-translate-y-2 opacity-80",
          animDirection === "down" && "translate-y-2 opacity-80"
        )}
      >
        <KnowledgeCardView card={currentCard} />
      </div>

      {/* 底部控制交互栏 */}
      <div className="flex items-center justify-between gap-2 pt-1 pb-2 relative z-20">
        {/* 上一张按钮 */}
        {hasPrev && (
          <button
            type="button"
            onClick={handlePrev}
            className="py-3 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#151518] text-zinc-600 dark:text-zinc-400 text-xs font-medium min-touch-target flex items-center justify-center space-x-1 cursor-pointer touch-manipulation active:scale-95 transition-all shadow-2xs hover:bg-zinc-50"
            title="返回上一张"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">上一张</span>
          </button>
        )}

        {/* 收藏按钮 */}
        <button
          type="button"
          onClick={() => toggleSaveCard(currentCard.id)}
          className={cn(
            "flex-1 py-3 px-3 rounded-xl border text-xs font-medium min-touch-target flex items-center justify-center space-x-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shadow-2xs",
            isSaved
              ? "bg-amber-500 text-white border-amber-500 font-semibold"
              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#151518] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
          <span>{isSaved ? "已收藏" : "收藏"}</span>
        </button>

        {/* 已掌握按钮 */}
        <button
          type="button"
          onClick={() => toggleMasterCard(currentCard.id)}
          className={cn(
            "flex-1 py-3 px-3 rounded-xl border text-xs font-medium min-touch-target flex items-center justify-center space-x-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shadow-2xs",
            isMastered
              ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#151518] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isMastered ? "已掌握" : "已知道"}</span>
        </button>

        {/* 换一张按钮 */}
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold min-touch-target flex items-center justify-center space-x-1.5 cursor-pointer touch-manipulation active:scale-95 transition-all shadow-xs"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>换一张</span>
        </button>
      </div>
    </div>
  );
}
