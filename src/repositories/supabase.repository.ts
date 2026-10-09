import { SupabaseClient } from "@supabase/supabase-js";
import {
  KnowledgeCard,
  KnowledgeConcept,
  KnowledgeClaim,
  KnowledgeSource,
  KnowledgeRelation,
} from "@/types/knowledge";
import { IKnowledgeRepository } from "./knowledge.repository";

interface DbConceptRow {
  id: string;
  name: string;
  canonical_question: string;
  canonical_summary: string;
  domain: string;
  topic: string | null;
  parent_concept_id: string | null;
  status: string;
  difficulty: number;
  origin: string;
  quality_score: number | null;
  tags: string[] | null;
  verified_at: string | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DbCardRow {
  id: string;
  concept_id: string;
  primary_claim_id: string | null;
  type: string;
  module: string;
  title: string;
  subtitle: string | null;
  one_line: string;
  body: string | null;
  misconception: string | null;
  reality: string | null;
  why: string | null;
  action_steps: string[] | null;
  cost: string | null;
  benefit: string | null;
  notes: string | null;
  ratio: string | null;
  grade: string | null;
  evidence_level: string | null;
  risk_level: string | null;
  angle: string | null;
  difficulty: number;
  region: string[] | null;
  audience: string[] | null;
  scenarios: string[] | null;
  tags: string[] | null;
  status: string;
  published_at: string | null;
  updated_at: string;
  verified_at: string | null;
}

interface DbClaimRow {
  id: string;
  concept_id: string;
  claim_type: string;
  claim_text: string;
  canonical: boolean;
  confidence: number | null;
  evidence_level: string;
  status: string;
  version: number;
  source_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

interface DbSourceRow {
  id: string;
  organization: string | null;
  title: string;
  author: string | null;
  url: string;
  source_type: string;
  publication_date: string | null;
  region: string | null;
  language: string | null;
  retrieved_at: string;
  status: string;
  citation: string | null;
}

interface DbRelationRow {
  id: string;
  source_concept_id: string;
  relation_type: string;
  target_concept_id: string;
  confidence: number;
  created_by: string | null;
  created_at: string;
}

function mapRowToConcept(row: DbConceptRow): KnowledgeConcept {
  return {
    id: row.id,
    name: row.name,
    canonicalQuestion: row.canonical_question,
    canonicalSummary: row.canonical_summary,
    domain: row.domain,
    topic: row.topic || undefined,
    parentConceptId: row.parent_concept_id || undefined,
    status: row.status as KnowledgeConcept["status"],
    difficulty: (row.difficulty as KnowledgeConcept["difficulty"]) || 1,
    origin: (row.origin as KnowledgeConcept["origin"]) || "imported",
    qualityScore: row.quality_score ?? undefined,
    tags: row.tags || [],
    verifiedAt: row.verified_at || undefined,
    nextReviewAt: row.next_review_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToCard(row: DbCardRow): KnowledgeCard {
  return {
    id: row.id,
    conceptId: row.concept_id,
    primaryClaimId: row.primary_claim_id || undefined,
    type: row.type as KnowledgeCard["type"],
    module: row.module as KnowledgeCard["module"],
    title: row.title,
    subtitle: row.subtitle || undefined,
    oneLine: row.one_line,
    body: row.body || undefined,
    misconception: row.misconception || undefined,
    reality: row.reality || undefined,
    why: row.why || undefined,
    actionSteps: row.action_steps || undefined,
    cost: row.cost || undefined,
    benefit: row.benefit || undefined,
    notes: row.notes || undefined,
    ratio: row.ratio || undefined,
    grade: (row.grade as KnowledgeCard["grade"]) || "A",
    evidenceLevel: (row.evidence_level as KnowledgeCard["evidenceLevel"]) || "strong",
    riskLevel: (row.risk_level as KnowledgeCard["riskLevel"]) || "medium",
    angle: (row.angle as KnowledgeCard["angle"]) || "action",
    difficulty: (row.difficulty as KnowledgeCard["difficulty"]) || 1,
    region: row.region || undefined,
    audience: row.audience || undefined,
    scenarios: row.scenarios || undefined,
    tags: row.tags || [],
    status: row.status as KnowledgeCard["status"],
    publishedAt: row.published_at || undefined,
    updatedAt: row.updated_at,
    verifiedAt: row.verified_at || undefined,
  };
}

function mapRowToClaim(row: DbClaimRow): KnowledgeClaim {
  return {
    id: row.id,
    conceptId: row.concept_id,
    claimType: row.claim_type as KnowledgeClaim["claimType"],
    claimText: row.claim_text,
    canonical: Boolean(row.canonical),
    confidence: row.confidence ?? 1.0,
    evidenceLevel: row.evidence_level as KnowledgeClaim["evidenceLevel"],
    status: row.status as KnowledgeClaim["status"],
    version: row.version || 1,
    sourceIds: row.source_ids || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToSource(row: DbSourceRow): KnowledgeSource {
  return {
    id: row.id,
    organization: row.organization || undefined,
    title: row.title,
    author: row.author || undefined,
    url: row.url,
    sourceType: row.source_type as KnowledgeSource["sourceType"],
    publicationDate: row.publication_date || undefined,
    region: row.region || undefined,
    language: row.language || undefined,
    retrievedAt: row.retrieved_at,
    status: row.status as KnowledgeSource["status"],
    citation: row.citation || undefined,
  };
}

function mapRowToRelation(row: DbRelationRow): KnowledgeRelation {
  return {
    id: row.id,
    sourceConceptId: row.source_concept_id,
    relationType: row.relation_type as KnowledgeRelation["relationType"],
    targetConceptId: row.target_concept_id,
    confidence: Number(row.confidence || 1.0),
    createdBy: row.created_by || undefined,
    createdAt: row.created_at,
  };
}

export class SupabaseKnowledgeRepository implements IKnowledgeRepository {
  constructor(private client: SupabaseClient) {}

  getStorageType(): "supabase" | "file" {
    return "supabase";
  }

  // --- Concepts ---
  async getAllConcepts(): Promise<KnowledgeConcept[]> {
    const { data, error } = await this.client
      .from("concepts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Supabase getAllConcepts error:", error);
      return [];
    }
    return (data as DbConceptRow[]).map(mapRowToConcept);
  }

  async getConceptById(id: string): Promise<KnowledgeConcept | null> {
    const { data, error } = await this.client
      .from("concepts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return mapRowToConcept(data as DbConceptRow);
  }

  async createConcept(concept: KnowledgeConcept): Promise<void> {
    const row = {
      id: concept.id,
      name: concept.name,
      canonical_question: concept.canonicalQuestion,
      canonical_summary: concept.canonicalSummary,
      domain: concept.domain,
      topic: concept.topic || null,
      parent_concept_id: concept.parentConceptId || null,
      status: concept.status,
      difficulty: concept.difficulty,
      origin: concept.origin,
      quality_score: concept.qualityScore || 90,
      tags: concept.tags || [],
      created_at: concept.createdAt || new Date().toISOString(),
      updated_at: concept.updatedAt || new Date().toISOString(),
    };

    const { error } = await this.client.from("concepts").upsert(row);
    if (error) console.error("Supabase createConcept error:", error);
  }

  async updateConcept(concept: KnowledgeConcept): Promise<void> {
    await this.createConcept(concept);
  }

  async deleteConcept(id: string): Promise<boolean> {
    const { error } = await this.client.from("concepts").delete().eq("id", id);
    return !error;
  }

  // --- Cards ---
  async getAllCards(): Promise<KnowledgeCard[]> {
    const { data, error } = await this.client
      .from("cards")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Supabase getAllCards error:", error);
      return [];
    }
    return (data as DbCardRow[]).map(mapRowToCard);
  }

  async getCardById(id: string): Promise<KnowledgeCard | null> {
    const { data, error } = await this.client
      .from("cards")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return mapRowToCard(data as DbCardRow);
  }

  async getCardsByModule(module: KnowledgeCard["module"]): Promise<KnowledgeCard[]> {
    const { data, error } = await this.client
      .from("cards")
      .select("*")
      .eq("module", module)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as DbCardRow[]).map(mapRowToCard);
  }

  async getCardsByConceptId(conceptId: string): Promise<KnowledgeCard[]> {
    const { data, error } = await this.client
      .from("cards")
      .select("*")
      .eq("concept_id", conceptId);

    if (error || !data) return [];
    return (data as DbCardRow[]).map(mapRowToCard);
  }

  async createCard(card: KnowledgeCard): Promise<void> {
    const row = {
      id: card.id,
      concept_id: card.conceptId,
      primary_claim_id: card.primaryClaimId || null,
      type: card.type,
      module: card.module,
      title: card.title,
      subtitle: card.subtitle || null,
      one_line: card.oneLine,
      body: card.body || null,
      misconception: card.misconception || null,
      reality: card.reality || null,
      why: card.why || null,
      action_steps: card.actionSteps || [],
      cost: card.cost || null,
      benefit: card.benefit || null,
      notes: card.notes || null,
      ratio: card.ratio || null,
      grade: card.grade || "A",
      evidence_level: card.evidenceLevel || "strong",
      risk_level: card.riskLevel || "medium",
      angle: card.angle || "action",
      difficulty: card.difficulty || 1,
      region: card.region || [],
      audience: card.audience || [],
      scenarios: card.scenarios || [],
      tags: card.tags || [],
      status: card.status,
      published_at: card.publishedAt || new Date().toISOString(),
      updated_at: card.updatedAt || new Date().toISOString(),
    };

    const { error } = await this.client.from("cards").upsert(row);
    if (error) console.error("Supabase createCard error:", error);
  }

  async updateCard(card: KnowledgeCard): Promise<void> {
    await this.createCard(card);
  }

  async deleteCard(id: string): Promise<boolean> {
    const { error } = await this.client.from("cards").delete().eq("id", id);
    return !error;
  }

  // --- Claims ---
  async getAllClaims(): Promise<KnowledgeClaim[]> {
    const { data, error } = await this.client.from("claims").select("*");
    if (error || !data) return [];
    return (data as DbClaimRow[]).map(mapRowToClaim);
  }

  async getClaimsByConceptId(conceptId: string): Promise<KnowledgeClaim[]> {
    const { data, error } = await this.client
      .from("claims")
      .select("*")
      .eq("concept_id", conceptId);

    if (error || !data) return [];
    return (data as DbClaimRow[]).map(mapRowToClaim);
  }

  async createClaim(claim: KnowledgeClaim): Promise<void> {
    const row = {
      id: claim.id,
      concept_id: claim.conceptId,
      claim_type: claim.claimType,
      claim_text: claim.claimText,
      canonical: claim.canonical,
      confidence: claim.confidence ?? 1.0,
      evidence_level: claim.evidenceLevel,
      status: claim.status,
      version: claim.version,
      source_ids: claim.sourceIds || [],
      created_at: claim.createdAt || new Date().toISOString(),
      updated_at: claim.updatedAt || new Date().toISOString(),
    };

    const { error } = await this.client.from("claims").upsert(row);
    if (error) console.error("Supabase createClaim error:", error);
  }

  // --- Sources ---
  async getAllSources(): Promise<KnowledgeSource[]> {
    const { data, error } = await this.client.from("sources").select("*");
    if (error || !data) return [];
    return (data as DbSourceRow[]).map(mapRowToSource);
  }

  async getSourcesByIds(ids: string[]): Promise<KnowledgeSource[]> {
    if (!ids || ids.length === 0) return [];
    const { data, error } = await this.client
      .from("sources")
      .select("*")
      .in("id", ids);

    if (error || !data) return [];
    return (data as DbSourceRow[]).map(mapRowToSource);
  }

  async createSource(source: KnowledgeSource): Promise<void> {
    const row = {
      id: source.id,
      organization: source.organization || null,
      title: source.title,
      author: source.author || null,
      url: source.url,
      source_type: source.sourceType,
      publication_date: source.publicationDate || null,
      region: source.region || null,
      language: source.language || null,
      retrieved_at: source.retrievedAt || new Date().toISOString().split("T")[0],
      status: source.status,
      citation: source.citation || null,
    };

    const { error } = await this.client.from("sources").upsert(row);
    if (error) console.error("Supabase createSource error:", error);
  }

  // --- Relations ---
  async getAllRelations(): Promise<KnowledgeRelation[]> {
    const { data, error } = await this.client.from("relations").select("*");
    if (error || !data) return [];
    return (data as DbRelationRow[]).map(mapRowToRelation);
  }

  async getRelatedConcepts(
    conceptId: string
  ): Promise<{ relation: KnowledgeRelation; concept: KnowledgeConcept }[]> {
    const { data: relData, error: relError } = await this.client
      .from("relations")
      .select("*")
      .or(`source_concept_id.eq.${conceptId},target_concept_id.eq.${conceptId}`);

    if (relError || !relData || relData.length === 0) return [];

    const relations = (relData as DbRelationRow[]).map(mapRowToRelation);
    const targetIds = relations.map((r) =>
      r.sourceConceptId === conceptId ? r.targetConceptId : r.sourceConceptId
    );

    const { data: conceptData } = await this.client
      .from("concepts")
      .select("*")
      .in("id", targetIds);

    const conceptMap = new Map<string, KnowledgeConcept>();
    if (conceptData) {
      (conceptData as DbConceptRow[]).forEach((row) => {
        conceptMap.set(row.id, mapRowToConcept(row));
      });
    }

    const results: { relation: KnowledgeRelation; concept: KnowledgeConcept }[] = [];
    for (const r of relations) {
      const targetId = r.sourceConceptId === conceptId ? r.targetConceptId : r.sourceConceptId;
      const targetConcept = conceptMap.get(targetId);
      if (targetConcept) {
        results.push({ relation: r, concept: targetConcept });
      }
    }
    return results;
  }

  async createRelation(relation: KnowledgeRelation): Promise<void> {
    const row = {
      id: relation.id,
      source_concept_id: relation.sourceConceptId,
      relation_type: relation.relationType,
      target_concept_id: relation.targetConceptId,
      confidence: relation.confidence,
      created_by: relation.createdBy || null,
      created_at: relation.createdAt || new Date().toISOString(),
    };

    const { error } = await this.client.from("relations").upsert(row);
    if (error) console.error("Supabase createRelation error:", error);
  }

  // --- Search ---
  async search(keyword: string): Promise<KnowledgeCard[]> {
    const clean = keyword.trim();
    if (!clean) return [];

    const { data, error } = await this.client
      .from("cards")
      .select("*")
      .eq("status", "published")
      .or(`title.ilike.%${clean}%,one_line.ilike.%${clean}%,body.ilike.%${clean}%,misconception.ilike.%${clean}%`);

    if (error || !data) return [];
    return (data as DbCardRow[]).map(mapRowToCard);
  }

  // --- Clear All Data ---
  async clearAll(): Promise<void> {
    // 按照外键依赖倒序删除
    await this.client.from("relations").delete().neq("id", "___keep_none___");
    await this.client.from("cards").delete().neq("id", "___keep_none___");
    await this.client.from("claims").delete().neq("id", "___keep_none___");
    await this.client.from("concepts").delete().neq("id", "___keep_none___");
    await this.client.from("sources").delete().neq("id", "___keep_none___");
  }
}
