import { notFound } from "next/navigation";
import Link from "next/link";
import { knowledgeService } from "@/services/knowledge.service";
import { ChevronLeft, Database, FileText, Link2, ShieldCheck } from "lucide-react";

interface AdminConceptDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const concepts = await knowledgeService.getAllConcepts();
  if (concepts.length === 0) {
    return [{ id: "_empty_" }];
  }
  return concepts.map((c) => ({ id: c.id }));
}

export default async function AdminConceptDetailPage({ params }: AdminConceptDetailPageProps) {
  const { id } = await params;
  const detail = await knowledgeService.getConceptDetail(id);

  if (!detail) {
    notFound();
  }

  const { concept, claims, cards, sources, related } = detail;

  return (
    <div className="space-y-6">
      {/* 返回列表 */}
      <div>
        <Link
          href="/admin/concepts"
          className="inline-flex items-center text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>返回概念列表</span>
        </Link>
      </div>

      {/* 概念基本资料 */}
      <section className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-mono">{concept.id}</span>
          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
            Quality: {concept.qualityScore || 90}分
          </span>
        </div>

        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {concept.name}
        </h1>

        <div className="space-y-1.5 text-xs">
          <div className="text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">标准提问:</span>{" "}
            {concept.canonicalQuestion}
          </div>
          <div className="text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">稳定核心结论 (Canonical Summary):</span>{" "}
            {concept.canonicalSummary}
          </div>
        </div>
      </section>

      {/* Claims 事实声明 */}
      <section className="space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <FileText className="w-3.5 h-3.5" />
          <span>关联事实声明 (Claims · {claims.length})</span>
        </div>

        <div className="space-y-2">
          {claims.map((cl) => (
            <div
              key={cl.id}
              className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono">{cl.id}</span>
                <span className="font-medium text-emerald-600">
                  {cl.evidenceLevel === "very_strong" ? "强证据" : "较强证据"}
                </span>
              </div>
              <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                {cl.claimText}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cards 呈现卡片 */}
      <section className="space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Database className="w-3.5 h-3.5" />
          <span>呈现卡片 (Cards · {cards.length})</span>
        </div>

        <div className="space-y-2">
          {cards.map((cd) => (
            <div
              key={cd.id}
              className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] text-zinc-400 block mb-0.5 font-mono">{cd.id}</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{cd.title}</span>
              </div>
              <Link
                href={`/card/${cd.id}`}
                target="_blank"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline ml-2"
              >
                预览卡片
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Relations 关系 */}
      <section className="space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Link2 className="w-3.5 h-3.5" />
          <span>概念关联网 (Relations · {related.length})</span>
        </div>

        <div className="space-y-2">
          {related.map(({ relation, concept: relConcept }, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs flex items-center justify-between"
            >
              <div>
                <span className="text-zinc-400 mr-2 font-mono">[{relation.relationType}]</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{relConcept.name}</span>
              </div>
              <Link
                href={`/admin/concepts/${relConcept.id}`}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                查看目标概念
              </Link>
            </div>
          ))}

          {related.length === 0 && (
            <div className="p-4 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              暂无下游关联关系
            </div>
          )}
        </div>
      </section>

      {/* Sources 信源 */}
      <section className="space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>关联事实信源 (Sources · {sources.length})</span>
        </div>

        <div className="space-y-2">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{src.organization || "权威机构"}</span>
                <span className="text-zinc-500">{src.title}</span>
              </div>
              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline ml-2"
                >
                  来源链接
                </a>
              )}
            </div>
          ))}
          {sources.length === 0 && (
            <div className="p-4 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              暂无挂载信源
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
