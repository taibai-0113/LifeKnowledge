import { NextResponse } from "next/server";
import { knowledgeRepository } from "@/repositories/knowledge.repository";

export async function POST() {
  try {
    await knowledgeRepository.clearAll();
    const storageType = knowledgeRepository.getStorageType();

    return NextResponse.json({
      success: true,
      message: `数据库已成功清空（当前存储模式：${
        storageType === "supabase" ? "Supabase (PostgreSQL)" : "SQLite 数据库 (data/knowledge.db)"
      }）`,
      storageType,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `清空数据库失败: ${String(error)}`,
      },
      { status: 500 }
    );
  }
}
