"use client";

import { useState } from "react";
import { KnowledgeCard } from "@/types/knowledge";
import { useUserStore } from "@/context/UserStoreContext";
import { Bookmark, CheckCircle2, ListPlus, Share2, AlertCircle, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardDetailActionsProps {
  card: KnowledgeCard;
}

export function CardDetailActions({ card }: CardDetailActionsProps) {
  const { savedCardIds, masteredCardIds, actionItems, toggleSaveCard, toggleMasterCard, addActionItem } = useUserStore();

  const isSaved = savedCardIds.includes(card.id);
  const isMastered = masteredCardIds.includes(card.id);
  const hasActionItem = actionItems.some((item) => item.cardId === card.id);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = () => {
    toggleSaveCard(card.id);
    showToast(!isSaved ? "已保存至「我的收藏」" : "已从收藏中移除");
  };

  const handleMaster = () => {
    toggleMasterCard(card.id);
    showToast(!isMastered ? "已记入你的「生活知识档案」" : "已取消掌握标记");
  };

  const handleAddAction = () => {
    if (hasActionItem) {
      showToast("该事项已在「待行动」清单中");
      return;
    }
    addActionItem(card.id, card.title);
    showToast("已加入「待行动」清单");
  };

  const handleCopyLink = () => {
    try {
      if (typeof window !== "undefined") {
        navigator.clipboard.writeText(window.location.href);
        showToast("常识链接已复制到剪贴板");
        setShowShareModal(false);
      }
    } catch {
      showToast("复制失败，请手动复制地址栏网址");
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(false);
      setReportReason("");
      showToast("感谢纠错反馈，编辑团队将重新核验信源");
    }, 1200);
  };

  const isActionable = card.type === "action" || card.type === "emergency";

  return (
    <>
      {/* 底部悬浮操作控制区 */}
      <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={handleSave}
          className={cn(
            "flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium min-touch-target flex items-center justify-center space-x-1.5 transition-colors",
            isSaved
              ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
          <span>{isSaved ? "已收藏" : "收藏"}</span>
        </button>

        <button
          type="button"
          onClick={handleMaster}
          className={cn(
            "flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium min-touch-target flex items-center justify-center space-x-1.5 transition-colors",
            isMastered
              ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isMastered ? "已掌握" : "已知道"}</span>
        </button>

        {isActionable && (
          <button
            type="button"
            onClick={handleAddAction}
            className={cn(
              "flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium min-touch-target flex items-center justify-center space-x-1.5 transition-colors",
              hasActionItem
                ? "bg-sky-600 text-white border-sky-600"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>{hasActionItem ? "已在待办" : "待行动"}</span>
          </button>
        )}

        <div className="flex items-center space-x-1">
          <button
            type="button"
            aria-label="分享"
            onClick={() => setShowShareModal(true)}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 min-touch-target flex items-center justify-center"
            title="分享此知识"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            aria-label="内容纠错"
            onClick={() => setShowReportModal(true)}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 min-touch-target flex items-center justify-center"
            title="内容纠错与反馈"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 轻量 Toast 反馈提示 */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-zinc-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 text-xs font-medium rounded-full shadow-lg backdrop-blur-xs transition-opacity animate-fade-in flex items-center space-x-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 分享卡片弹层 */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400">分享生活常识</span>
              <button
                type="button"
                aria-label="关闭分享窗口"
                onClick={() => setShowShareModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 min-touch-target flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
              <div className="text-xs text-zinc-400">人生常识 · 值得知道</div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{card.title}</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">{card.oneLine}</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-medium flex items-center justify-center space-x-1.5 min-touch-target"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>复制分享链接</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 内容纠错弹层 */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400">常识内容纠错</span>
              <button
                type="button"
                aria-label="关闭纠错窗口"
                onClick={() => setShowReportModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 min-touch-target flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs text-zinc-600 dark:text-zinc-300">反馈已记录，感谢您的监督！</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3">
                <p className="text-xs text-zinc-500">
                  若发现事实错误、文献失效、地区不适用或表达歧义，请告知我们：
                </p>

                <div className="space-y-1.5">
                  {["事实存在偏差或争议", "信源链接失效或陈旧", "地区/法律规定不适用", "表达存在误导歧义"].map(
                    (opt) => (
                      <label
                        key={opt}
                        className="flex items-center space-x-2 text-xs text-zinc-700 dark:text-zinc-300 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 cursor-pointer hover:bg-zinc-100"
                      >
                        <input
                          type="radio"
                          name="reportType"
                          value={opt}
                          required
                          className="accent-zinc-900"
                        />
                        <span>{opt}</span>
                      </label>
                    )
                  )}
                </div>

                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="可补充具体修正建议或权威出处（选填）…"
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-hidden"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium"
                >
                  提交纠错反馈
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
