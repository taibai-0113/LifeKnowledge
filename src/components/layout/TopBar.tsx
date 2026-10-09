"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

export function TopBar({ title, showBack }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-sm border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {showBack ? (
          <button
            onClick={() => router.back()}
            aria-label="返回上一页"
            className="flex items-center text-zinc-600 dark:text-zinc-300 -ml-2 p-2 hover:opacity-75 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 mr-0.5" />
            <span className="text-sm font-medium">返回</span>
          </button>
        ) : (
          <div className="flex flex-col justify-center">
            {isHome ? (
              <>
                <span className="text-xs text-zinc-400 font-normal">你好</span>
                <h1 className="text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                  今天给自己补一个常识
                </h1>
              </>
            ) : (
              <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {title}
              </h1>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {pathname !== "/search" && (
            <Link
              href="/search"
              aria-label="搜索常识"
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
