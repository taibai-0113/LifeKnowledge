import { DeduplicationClient } from "./DeduplicationClient";

export default function AdminDeduplicationPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          语义去重与概念决策判定
        </h1>
        <p className="text-xs text-zinc-500">
          严格遵循系统去重标准：区分完全重复、同概念新视角、关联知识与全新概念，绝不简单暴力删除。
        </p>
      </div>

      <DeduplicationClient />
    </div>
  );
}
