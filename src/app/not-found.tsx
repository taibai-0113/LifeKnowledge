import Link from "next/link";
import { Compass, Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center mb-4 text-zinc-500">
        <Compass className="w-7 h-7" />
      </div>

      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">
        404 NOT FOUND
      </span>

      <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
        这个知识卡片或页面不存在
      </h1>

      <p className="text-xs text-zinc-500 max-w-xs mb-6 leading-relaxed">
        可能是地址输入有误，或者该常识已被归档整合。建议返回首页或探索已建立的知识档案。
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold transition-colors min-touch-target"
        >
          <Home className="w-3.5 h-3.5 mr-1.5" />
          回到今日首页
        </Link>

        <Link
          href="/archive"
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors min-touch-target"
        >
          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
          全量知识档案
        </Link>
      </div>
    </div>
  );
}
