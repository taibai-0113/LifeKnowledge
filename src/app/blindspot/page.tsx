import { TopBar } from "@/components/layout/TopBar";
import { CardInfiniteList } from "@/components/cards/CardInfiniteList";
import { knowledgeService } from "@/services/knowledge.service";
import { Compass } from "lucide-react";

export default async function BlindspotPage() {
  const allCards = await knowledgeService.getBlindspotCards();
  const initialCards = allCards.slice(0, 20);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="扫清生活盲区" />

      <div className="px-4 py-5 space-y-6">
        {/* 顶部定位 */}
        <section className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 mb-1">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>事情其实是怎样的 · 认知型知识库</span>
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            生活认知纠偏 + 日常机制解释
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            纠正错误心智模型，建立对日常生活真实逻辑的理解。
          </p>
        </section>

        {/* 盲区卡片流（无限滚动懒加载） */}
        <section>
          <CardInfiniteList
            initialCards={initialCards}
            totalCount={allCards.length}
            module="blindspot"
            emptyMessage="暂无已发布的盲区条目"
          />
        </section>
      </div>
    </div>
  );
}
