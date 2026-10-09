import Link from "next/link";
import { knowledgeService } from "@/services/knowledge.service";
import { knowledgeRepository } from "@/repositories/knowledge.repository";
import { PRIMARY_CATEGORIES } from "@/types/knowledge";
import { Database, FileText, Link2, Sparkles, ArrowRight, HardDrive } from "lucide-react";
import { AdminDataImport } from "@/components/admin/AdminDataImport";
import { AdminDataReset } from "@/components/admin/AdminDataReset";

export default async function AdminDashboardPage() {
  const concepts = await knowledgeService.getAllConcepts();
  const cards = await knowledgeService.getAllCards();
  const claims = await knowledgeRepository.getAllClaims();
  const sources = await knowledgeRepository.getAllSources();
  const relations = await knowledgeRepository.getAllRelations();
  const storageType = knowledgeRepository.getStorageType();

  // 计算每个分类下的概念分布
  const categoryStats = PRIMARY_CATEGORIES.map((cat) => {
    const count = concepts.filter((c) => c.domain === cat.code).length;
    return {
      ...cat,
      count,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              知识库概览与度量
            </h1>
            {storageType === "supabase" ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Database className="w-3 h-3" />
                <span>Supabase (PostgreSQL)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <HardDrive className="w-3 h-3" />
                <span>SQLite 数据库文件 (data/knowledge.db)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            遵循 Concept-first 架构，增加知识无需修改前端代码；支持云端 Supabase 与本地持久化切换
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AdminDataReset />
          <AdminDataImport />
        </div>
      </div>

      {/* 核心指标统计 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mb-1">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Concepts 概念</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {concepts.length}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mb-1">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Claims 事实</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {claims.length}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mb-1">
            <FileText className="w-3.5 h-3.5 text-sky-500" />
            <span>Cards 卡片</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {cards.length}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mb-1">
            <Link2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Relations 关系</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {relations.length}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mb-1">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>Sources 信源</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {sources.length}
          </div>
        </div>
      </div>

      {/* 快捷工具入口 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/admin/deduplication"
          className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-300 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                语义去重判定演练
              </div>
              <div className="text-xs text-zinc-500">
                输入新知识草稿，实时评估是否重复、属于新视角或相关概念
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-600" />
        </Link>

        <Link
          href="/admin/concepts"
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                概念与关系网列表
              </div>
              <div className="text-xs text-zinc-500">
                查看所有原子 Concept 及其下的 Claims、Cards 与 Sources
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-400" />
        </Link>
      </div>

      {/* 分类覆盖度矩阵 */}
      <section className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            20 大标准一级分类覆盖情况 (Coverage)
          </h2>
          <span className="text-xs text-zinc-400">持续填补盲区</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {categoryStats.map((cat) => (
            <div
              key={cat.code}
              className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between"
            >
              <span className="text-zinc-700 dark:text-zinc-300">{cat.name}</span>
              <span
                className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                  cat.count > 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                }`}
              >
                {cat.count} 个
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
