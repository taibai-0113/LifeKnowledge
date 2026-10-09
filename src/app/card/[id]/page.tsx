import { notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { knowledgeService } from "@/services/knowledge.service";
import {
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { CardDetailActions } from "@/components/cards/CardDetailActions";


import type { Metadata } from "next";

export async function generateStaticParams() {
  const cards = await knowledgeService.getAllCards();
  if (cards.length === 0) {
    return [{ id: "_empty_" }];
  }
  return cards.map((card) => ({ id: card.id }));
}

interface CardDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CardDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await knowledgeService.getCardDetail(id);
  if (!detail) {
    return {
      title: "常识未找到 — 人生常识",
      description: "该生活常识卡片不存在或已被归档",
    };
  }
  const { card } = detail;
  return {
    title: `${card.title} — 人生常识`,
    description: card.oneLine,
    openGraph: {
      title: card.title,
      description: card.oneLine,
      type: "article",
      siteName: "人生常识",
    },
    twitter: {
      card: "summary",
      title: card.title,
      description: card.oneLine,
    },
  };
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = await params;
  const detail = await knowledgeService.getCardDetail(id);

  if (!detail) {
    notFound();
  }

  const { card, sources, relatedConcepts } = detail;
  const isAction = card.type === "action";
  const isBlindspot = card.type === "blindspot" || card.type === "misconception";

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar showBack title="常识详情" />

      <article className="px-4 py-6 space-y-6">
        {/* 头部元信息 */}
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-2">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {card.module === "life_archive" ? "人生知识档案" : "扫清生活盲区"}
            </span>
            <span>·</span>
            <span>{card.subtitle || "生活常识"}</span>
            {card.grade && (
              <>
                <span>·</span>
                <span className="text-amber-600 font-semibold">{card.grade} 级</span>
              </>
            )}
          </div>

          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug">
            {card.title}
          </h1>

          {/* 标签与性价比 Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {card.grade && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-semibold leading-none bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {card.grade} 级
              </span>
            )}
            {card.ratio && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-semibold leading-none bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                性价比 {card.ratio}
              </span>
            )}
            {card.tags
              ?.filter(
                (t) =>
                  !/^\d+\./.test(t) &&
                  t !== `${card.grade} 级` &&
                  !t.startsWith("性价比")
              )
              .map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>

        {/* 第一层：一句话结论 (渐进披露 3 秒看懂) */}
        <section className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">
            核心结论
          </span>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
            {card.oneLine}
          </p>
        </section>

        {/* 盲区模式结构 */}
        {isBlindspot && card.misconception && (
          <section className="space-y-3">
            <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 block mb-1">
                你可能以为
              </span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {card.misconception}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                实际上
              </span>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                {card.reality || card.oneLine}
              </p>
            </div>
          </section>
        )}

        {/* 成本 */}
        {card.cost && (
          <section className="space-y-1.5 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              成本
            </h2>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {card.cost}
            </p>
          </section>
        )}

        {/* 收益 */}
        {card.benefit && (
          <section className="space-y-1.5 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              收益
            </h2>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
              {card.benefit}
            </p>
          </section>
        )}

        {/* 备注 */}
        {card.notes && (
          <section className="space-y-1.5 p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              备注
            </h2>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
              {card.notes}
            </p>
          </section>
        )}

        {/* 第二层：为什么 (机理解读，若与备注不同) */}
        {(card.why || card.body) &&
          (!card.notes ||
            (card.why !== card.notes && card.body !== card.notes)) && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                机理解读
              </h2>
              <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2">
                <p>{card.why || card.body}</p>
              </div>
            </section>
          )}

        {/* 第三层：行动卡步骤 (怎么做) */}
        {isAction && card.actionSteps && card.actionSteps.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              建议怎么做
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              {card.actionSteps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-normal">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 证据与事实来源 (第四层：可信与追溯) */}
        <section className="border-t border-zinc-200/80 dark:border-zinc-800 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>证据与信源追溯</span>
            </div>
            <span className="text-xs text-zinc-400">
              强度: {card.evidenceLevel === "very_strong" ? "★★★★★ 强证据" : "★★★★☆ 较强"}
            </span>
          </div>

          <div className="space-y-2">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30 text-xs space-y-1"
              >
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {src.organization || "权威信源"}
                </div>
                <div className="text-zinc-500">{src.title}</div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 pt-1 underline"
                  >
                    <span>查看原始公开文献/指南</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 第五层：相关知识节点 */}
        {relatedConcepts.length > 0 && (
          <section className="border-t border-zinc-200/80 dark:border-zinc-800 pt-5 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              你可能还想知道
            </h2>
            <div className="space-y-2">
              {relatedConcepts.map(({ concept: relConcept }, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {relConcept.canonicalQuestion || relConcept.name}
                  </span>
                  <Link
                    href={`/search?q=${encodeURIComponent(relConcept.name)}`}
                    className="text-zinc-500 hover:text-zinc-800 inline-flex items-center"
                  >
                    查看 <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 底部交互操作栏 */}
        <CardDetailActions card={card} />
      </article>
    </div>
  );
}
