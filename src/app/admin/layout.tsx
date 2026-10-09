import Link from "next/link";
import { Database, Sparkles, Home } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* 顶部后台导航条 */}
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="返回用户端首页"
          >
            <Home className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="font-semibold text-sm tracking-tight flex items-center space-x-1.5">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>知识库内容管理中心 (CMS)</span>
          </span>
        </div>

        <nav className="flex items-center space-x-1 text-xs font-medium">
          <Link
            href="/admin"
            className="px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            总览
          </Link>
          <Link
            href="/admin/concepts"
            className="px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            概念 (Concepts)
          </Link>
          <Link
            href="/admin/deduplication"
            className="px-2.5 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>去重判定</span>
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">{children}</main>
    </div>
  );
}
