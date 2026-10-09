"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, Home, Shuffle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "首页", href: "/", icon: Home },
  { name: "档案", href: "/archive", icon: BookOpen },
  { name: "盲区", href: "/blindspot", icon: Compass },
  { name: "随机", href: "/random", icon: Shuffle },
  { name: "我的", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="底部导航"
      suppressHydrationWarning
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-white/85 dark:bg-[#121214]/85 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800 safe-bottom"
    >
      <div className="w-full max-w-md flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              suppressHydrationWarning
              className={cn(
                "flex flex-col items-center justify-center min-touch-target px-3 py-1 text-xs font-medium transition-colors select-none",
                isActive
                  ? "text-zinc-900 dark:text-zinc-50 font-semibold"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              <Icon
                suppressHydrationWarning
                className={cn(
                  "w-5 h-5 mb-0.5 transition-transform",
                  isActive && "scale-105 stroke-[2.2]"
                )}
              />
              <span suppressHydrationWarning>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
