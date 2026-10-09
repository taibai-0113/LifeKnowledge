import {
  KnowledgeCard,
  KnowledgeConcept,
  KnowledgeClaim,
  KnowledgeSource,
  KnowledgeRelation,
} from "@/types/knowledge";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { SupabaseKnowledgeRepository } from "./supabase.repository";
import { SqliteKnowledgeRepository } from "./sqlite.repository";

export interface IKnowledgeRepository {
  getStorageType(): "supabase" | "sqlite" | "file";

  getAllConcepts(): Promise<KnowledgeConcept[]>;
  getConceptById(id: string): Promise<KnowledgeConcept | null>;
  createConcept(concept: KnowledgeConcept): Promise<void>;
  updateConcept(concept: KnowledgeConcept): Promise<void>;
  deleteConcept(id: string): Promise<boolean>;

  getAllCards(): Promise<KnowledgeCard[]>;
  getCardById(id: string): Promise<KnowledgeCard | null>;
  getCardsByModule(module: KnowledgeCard["module"]): Promise<KnowledgeCard[]>;
  getCardsByConceptId(conceptId: string): Promise<KnowledgeCard[]>;
  createCard(card: KnowledgeCard): Promise<void>;
  updateCard(card: KnowledgeCard): Promise<void>;
  deleteCard(id: string): Promise<boolean>;

  getAllClaims(): Promise<KnowledgeClaim[]>;
  getClaimsByConceptId(conceptId: string): Promise<KnowledgeClaim[]>;
  createClaim(claim: KnowledgeClaim): Promise<void>;

  getAllSources(): Promise<KnowledgeSource[]>;
  getSourcesByIds(ids: string[]): Promise<KnowledgeSource[]>;
  createSource(source: KnowledgeSource): Promise<void>;

  getAllRelations(): Promise<KnowledgeRelation[]>;
  getRelatedConcepts(
    conceptId: string
  ): Promise<{ relation: KnowledgeRelation; concept: KnowledgeConcept }[]>;
  createRelation(relation: KnowledgeRelation): Promise<void>;

  search(keyword: string): Promise<KnowledgeCard[]>;
  clearAll(): Promise<void>;
}

/**
 * 仓储单例工厂
 * 1. 若配置了 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY，直连 Supabase / PostgreSQL 云端数据库；
 * 2. 默认使用本地嵌入式 SQLite 数据库文件 (data/knowledge.db)；
 * 3. 两种数据库均支持真实 SQL 查询、事务、持久化与后台一键清空重置。
 */
let repositoryInstance: IKnowledgeRepository | null = null;

export function getKnowledgeRepository(): IKnowledgeRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      repositoryInstance = new SupabaseKnowledgeRepository(client);
      return repositoryInstance;
    }
  }

  repositoryInstance = new SqliteKnowledgeRepository();
  return repositoryInstance;
}

export const knowledgeRepository: IKnowledgeRepository = getKnowledgeRepository();
