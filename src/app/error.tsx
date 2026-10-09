"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 错误记录
    console.error("Application error captured:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
        页面加载出现了一点问题
      </h1>

      <p className="text-xs text-zinc-500 max-w-xs mb-6 leading-relaxed">
        常识知识库数据加载受阻或网络短暂波动。你可以点击下方按钮重新尝试加载。
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold transition-colors min-touch-target cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          重新加载
        </button>

        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors min-touch-target"
        >
          <Home className="w-3.5 h-3.5 mr-1.5" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
