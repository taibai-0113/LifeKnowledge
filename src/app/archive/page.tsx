import { TopBar } from "@/components/layout/TopBar";
import { CardInfiniteList } from "@/components/cards/CardInfiniteList";
import { knowledgeService } from "@/services/knowledge.service";
import { CheckCircle2 } from "lucide-react";

export default async function ArchivePage() {
  const allCards = await knowledgeService.getLifeArchiveCards();
  const initialCards = allCards.slice(0, 20);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="人生知识档案" />

      <div className="px-4 py-5 space-y-6">
        {/* 顶部概览 */}
        <section className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>我应该知道什么 · 行动型知识库</span>
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            高性价比生活建议，做更好的决定
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            按低成本、高收益、高确定性进行结构化归纳。
          </p>
        </section>

        {/* 知识卡片流（无限滚动懒加载） */}
        <section>
          <CardInfiniteList
            initialCards={initialCards}
            totalCount={allCards.length}
            module="life_archive"
            emptyMessage="暂无已发布的档案条目"
          />
        </section>
      </div>
    </div>
  );
}
