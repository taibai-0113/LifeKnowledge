export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen pb-16 animate-pulse" aria-busy="true" aria-label="页面加载中">
      {/* 头部骨架 */}
      <div className="h-14 border-b border-zinc-200/60 dark:border-zinc-800/80 px-4 flex items-center justify-between">
        <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* 用户微状态栏骨架 */}
        <div className="h-10 bg-zinc-200/70 dark:bg-zinc-800/60 rounded-2xl" />

        {/* 核心卡片骨架 */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#151518] p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>
          <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="pt-2 flex justify-between items-center">
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>
        </div>

        {/* 紧凑卡片骨架 */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#151518] p-4 space-y-3">
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-5 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* 进度模块骨架 */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#151518] p-5 space-y-3">
          <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
