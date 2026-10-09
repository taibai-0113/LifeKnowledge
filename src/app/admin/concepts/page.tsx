import Link from "next/link";
import { knowledgeService } from "@/services/knowledge.service";
import { ArrowRight, Tag } from "lucide-react";

export default async function AdminConceptsPage() {
  const concepts = await knowledgeService.getAllConcepts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            已收录概念库 (Knowledge Concepts)
          </h1>
          <p className="text-xs text-zinc-500">
            共 {concepts.length} 个独立知识原子节点
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {concepts.map((concept) => (
          <div
            key={concept.id}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
              <span className="font-mono text-[11px] text-zinc-500">{concept.id}</span>
              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded text-[10px]">
                {concept.domain}
              </span>
            </div>

            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {concept.name}
            </h2>

            <p className="text-xs text-zinc-500 mb-2.5">
              <span className="text-zinc-400">标准问题：</span>
              {concept.canonicalQuestion}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
              <div className="flex items-center space-x-1 text-zinc-400">
                <Tag className="w-3 h-3" />
                <span>{concept.tags?.join(", ") || "无标签"}</span>
              </div>

              <Link
                href={`/admin/concepts/${concept.id}`}
                className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline inline-flex items-center"
              >
                查看完整拓扑 <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
