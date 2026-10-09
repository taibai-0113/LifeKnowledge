"use client";

import { useState } from "react";
import { DeduplicationCheckResult } from "@/types/deduplication";
import { Sparkles, AlertTriangle, Link2, Copy, FilePlus } from "lucide-react";

export function DeduplicationClient() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeduplicationCheckResult | null>(null);

  const handleCheck = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/admin/deduplication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          tags: tags.split(/[,，\s]+/).filter(Boolean),
        }),
      });
      if (resp.ok) {
        const res = await resp.json();
        setResult(res);
      }
    } catch (e) {
      console.error("Deduplication check error:", e);
    } finally {
      setLoading(false);
    }
  };

  const setExample = (t: string, s: string, tg: string) => {
    setTitle(t);
    setSummary(s);
    setTags(tg);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* 输入面板 */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            待录入知识标题 (Title) *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：后排乘车也必须扣紧安全带 / 美白牙膏可以刷白牙齿吗？"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-hidden focus:border-zinc-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            核心摘要 / 待判定事实 (Summary / Claim)
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="例如：安全带能防止身体在车内剧烈翻滚撞击前排…"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-hidden focus:border-zinc-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            标签 (可选，逗号分隔)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="安全带, 出行, 乘车"
            className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-hidden focus:border-zinc-400"
          />
        </div>

        {/* 预设测试场景 */}
        <div className="pt-2">
          <span className="text-xs text-zinc-400 mr-2">快速测试范例：</span>
          <div className="inline-flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() =>
                setExample(
                  "坐车后排一定要系好安全带",
                  "安全带能防止碰撞时后排撞击前排造成二次伤害",
                  "安全带, 交通"
                )
              }
              className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
            >
              高度相似 (duplicate)
            </button>
            <button
              type="button"
              onClick={() =>
                setExample(
                  "牙齿美白牙膏能不能天天用",
                  "美白牙膏通常含有较高摩擦剂磨损牙釉质",
                  "牙齿, 刷牙, 美白"
                )
              }
              className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
            >
              同概念新视角 (new_angle)
            </button>
            <button
              type="button"
              onClick={() =>
                setExample(
                  "做饭油锅着火不能浇水",
                  "水遇滚烫热油会造成爆沸，应盖上锅盖",
                  "油锅, 灭火, 厨房"
                )
              }
              className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
            >
              强相关概念 (related)
            </button>
            <button
              type="button"
              onClick={() =>
                setExample(
                  "选购隔热断桥铝门窗注意壁厚",
                  "国标要求外窗铝合金型材主要受力部位壁厚不小于1.8mm",
                  "装修, 门窗"
                )
              }
              className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
            >
              全新概念 (new_concept)
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheck}
          disabled={loading || !title.trim()}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "正在计算语义相似度…" : "执行语义去重分析"}</span>
        </button>
      </div>

      {/* 判定分析报告 */}
      {result && (
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-xs text-zinc-400 block mb-1">系统判定决策 (Decision)</span>
              <div className="flex items-center space-x-2">
                {result.decision === "duplicate" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    duplicate (疑似重复，建议合并)
                  </span>
                )}
                {result.decision === "same_concept_new_angle" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    same_concept_new_angle (同概念新视角，可新建Card)
                  </span>
                )}
                {result.decision === "related" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                    <Link2 className="w-3.5 h-3.5 mr-1" />
                    related (强相关，建议创建Relation)
                  </span>
                )}
                {result.decision === "new_concept" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <FilePlus className="w-3.5 h-3.5 mr-1" />
                    new_concept (全新概念，允许创建Concept)
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 block">判定置信度</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              可解释原因 (Explainable Reason):
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
              {result.reason}
            </p>
          </div>

          {/* 匹配度最高的已有候选概念 */}
          {result.candidateMatches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                知识库候选重合匹配 (Top Matches):
              </h4>
              <div className="space-y-2">
                {result.candidateMatches.map(({ concept, similarity, reason }) => (
                  <div
                    key={concept.id}
                    className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {concept.name}
                      </span>
                      <span className="font-mono text-emerald-600 font-semibold">
                        相似度 {Math.round(similarity * 100)}%
                      </span>
                    </div>
                    <p className="text-zinc-500 text-[11px]">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
