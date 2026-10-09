"use client";

import { useState } from "react";
import { KnowledgeCard } from "@/types/knowledge";
import { KnowledgeCardView } from "@/components/cards/KnowledgeCardView";
import { Search, X } from "lucide-react";

interface SearchClientProps {
  initialCards: KnowledgeCard[];
}

export function SearchClient({ initialCards }: SearchClientProps) {
  const [query, setQuery] = useState("");

  const filteredCards = query.trim()
    ? initialCards.filter((card) => {
        const q = query.trim().toLowerCase();
        const inTitle = card.title.toLowerCase().includes(q);
        const inOneLine = card.oneLine.toLowerCase().includes(q);
        const inBody = card.body?.toLowerCase().includes(q) || false;
        const inMisconception = card.misconception?.toLowerCase().includes(q) || false;
        const inTags = card.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        return inTitle || inOneLine || inBody || inMisconception || inTags;
      })
    : [];

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="space-y-4">
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索生活常识，如：刷牙、罐头、安全带…"
          className="w-full pl-10 pr-9 py-2.5 bg-zinc-100/80 dark:bg-zinc-800/80 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 快捷推荐词 */}
      {!query && (
        <div className="py-2 space-y-2">
          <span className="text-xs text-zinc-400 font-medium">大家常搜：</span>
          <div className="flex flex-wrap gap-1.5">
            {["安全带", "刷牙美白", "罐头防腐剂", "食品保存", "租房拍照"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果展示 */}
      {query && (
        <div className="space-y-3 pt-2">
          <div className="text-xs text-zinc-400">
            找到 {filteredCards.length} 条相关常识
          </div>

          {filteredCards.map((card) => (
            <KnowledgeCardView key={card.id} card={card} compact />
          ))}

          {filteredCards.length === 0 && (
            <div className="p-8 text-center text-sm text-zinc-400 space-y-1">
              <p>暂无完全匹配的常识</p>
              <p className="text-xs text-zinc-400">可以尝试更短或更日常的生活关键词</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
