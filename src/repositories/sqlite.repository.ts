import { createClient, Client } from "@libsql/client";
import path from "path";
import {
  KnowledgeCard,
  KnowledgeConcept,
  KnowledgeClaim,
  KnowledgeSource,
  KnowledgeRelation,
} from "@/types/knowledge";
import {
  SEED_CARDS,
  SEED_CONCEPTS,
  SEED_CLAIMS,
  SEED_SOURCES,
  SEED_RELATIONS,
} from "@/data/seed-data";
import { IKnowledgeRepository } from "./knowledge.repository";

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return val ? [val] : [];
    }
  }
  return [];
}

type SqlRow = Record<string, unknown>;

export class SqliteKnowledgeRepository implements IKnowledgeRepository {
  private client: Client | null = null;
  private dbPath: string;
  private isTestEnv: boolean;
  private memoryConcepts: Map<string, KnowledgeConcept> = new Map();
  private memoryClaims: Map<string, KnowledgeClaim> = new Map();
  private memoryCards: Map<string, KnowledgeCard> = new Map();
  private memorySources: Map<string, KnowledgeSource> = new Map();
  private memoryRelations: KnowledgeRelation[] = [];
  private cardCache: Map<string, KnowledgeCard> | null = null;
  private conceptCache: Map<string, KnowledgeConcept> | null = null;
  private initialized = false;

  constructor(dbPath?: string) {
    this.isTestEnv = process.env.NODE_ENV === "test";
    const resolvedPath =
      dbPath || path.resolve(process.cwd(), "data/knowledge.db");
    this.dbPath = resolvedPath.replace(/\\/g, "/");

    const isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      this.client = null as unknown as Client;
      this.initialized = true;
    } else if (this.isTestEnv) {
      // 测试环境：使用内存数据集
      SEED_CONCEPTS.forEach((c) => this.memoryConcepts.set(c.id, c));
      SEED_CLAIMS.forEach((cl) => this.memoryClaims.set(cl.id, cl));
      SEED_CARDS.forEach((cd) => this.memoryCards.set(cd.id, cd));
      SEED_SOURCES.forEach((s) => this.memorySources.set(s.id, s));
      this.memoryRelations = [...SEED_RELATIONS];
      this.initialized = true;
    } else {
      try {
        this.client = createClient({
          url: `file:${this.dbPath}`,
        });
      } catch (err) {
        console.warn("[SqliteKnowledgeRepository] Client creation warning:", err);
        this.client = null as unknown as Client;
      }
    }
  }

  getStorageType(): "supabase" | "sqlite" | "file" {
    return "sqlite";
  }

  public async initSchema(): Promise<void> {
    if (this.initialized || !this.client) return;

    try {
      await this.client.execute("PRAGMA journal_mode = WAL;");
      await this.client.execute("PRAGMA busy_timeout = 10000;");
      await this.client.execute("PRAGMA synchronous = NORMAL;");
    } catch {
      // ignore pragma error if unsupported
    }

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS concepts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        canonical_question TEXT NOT NULL,
        canonical_summary TEXT NOT NULL,
        domain TEXT NOT NULL,
        topic TEXT,
        parent_concept_id TEXT,
        status TEXT NOT NULL DEFAULT 'published',
        difficulty INTEGER NOT NULL DEFAULT 1,
        origin TEXT NOT NULL DEFAULT 'imported',
        quality_score INTEGER DEFAULT 90,
        tags TEXT,
        verified_at TEXT,
        next_review_at TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY,
        organization TEXT,
        title TEXT NOT NULL,
        author TEXT,
        url TEXT NOT NULL,
        source_type TEXT NOT NULL DEFAULT 'guideline',
        publication_date TEXT,
        region TEXT,
        language TEXT,
        retrieved_at TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        citation TEXT,
        created_at TEXT
      );
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        concept_id TEXT NOT NULL,
        claim_type TEXT NOT NULL DEFAULT 'fact',
        claim_text TEXT NOT NULL,
        canonical INTEGER NOT NULL DEFAULT 1,
        confidence REAL DEFAULT 1.0,
        evidence_level TEXT NOT NULL DEFAULT 'strong',
        status TEXT NOT NULL DEFAULT 'supported',
        version INTEGER NOT NULL DEFAULT 1,
        source_ids TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        concept_id TEXT NOT NULL,
        primary_claim_id TEXT,
        type TEXT NOT NULL DEFAULT 'action',
        module TEXT NOT NULL DEFAULT 'life_archive',
        title TEXT NOT NULL,
        subtitle TEXT,
        one_line TEXT NOT NULL,
        body TEXT,
        misconception TEXT,
        reality TEXT,
        why TEXT,
        action_steps TEXT,
        cost TEXT,
        benefit TEXT,
        notes TEXT,
        ratio TEXT,
        grade TEXT DEFAULT 'A',
        evidence_level TEXT DEFAULT 'strong',
        risk_level TEXT DEFAULT 'medium',
        angle TEXT DEFAULT 'action',
        difficulty INTEGER DEFAULT 1,
        region TEXT,
        audience TEXT,
        scenarios TEXT,
        tags TEXT,
        status TEXT NOT NULL DEFAULT 'published',
        published_at TEXT,
        updated_at TEXT,
        verified_at TEXT
      );
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS relations (
        id TEXT PRIMARY KEY,
        source_concept_id TEXT NOT NULL,
        relation_type TEXT NOT NULL,
        target_concept_id TEXT NOT NULL,
        confidence REAL NOT NULL DEFAULT 1.0,
        created_by TEXT,
        created_at TEXT
      );
    `);

    await this.client.execute(
      `CREATE INDEX IF NOT EXISTS idx_cards_concept_id ON cards(concept_id);`
    );
    await this.client.execute(
      `CREATE INDEX IF NOT EXISTS idx_cards_module ON cards(module);`
    );
    await this.client.execute(
      `CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);`
    );
    await this.client.execute(
      `CREATE INDEX IF NOT EXISTS idx_claims_concept_id ON claims(concept_id);`
    );

    this.initialized = true;
  }

  private mapRowToConcept(row: SqlRow): KnowledgeConcept {
    return {
      id: String(row.id),
      name: String(row.name),
      canonicalQuestion: String(row.canonical_question),
      canonicalSummary: String(row.canonical_summary),
      domain: String(row.domain),
      topic: row.topic ? String(row.topic) : undefined,
      parentConceptId: row.parent_concept_id
        ? String(row.parent_concept_id)
        : undefined,
      status: row.status as KnowledgeConcept["status"],
      difficulty: Number(row.difficulty || 1) as KnowledgeConcept["difficulty"],
      origin: row.origin as KnowledgeConcept["origin"],
      qualityScore: row.quality_score ? Number(row.quality_score) : 90,
      tags: parseJsonArray(row.tags),
      verifiedAt: row.verified_at ? String(row.verified_at) : undefined,
      nextReviewAt: row.next_review_at
        ? String(row.next_review_at)
        : undefined,
      createdAt: String(row.created_at || new Date().toISOString()),
      updatedAt: String(row.updated_at || new Date().toISOString()),
    };
  }

  private mapRowToCard(row: SqlRow): KnowledgeCard {
    return {
      id: String(row.id),
      conceptId: String(row.concept_id),
      primaryClaimId: row.primary_claim_id
        ? String(row.primary_claim_id)
        : undefined,
      type: row.type as KnowledgeCard["type"],
      module: row.module as KnowledgeCard["module"],
      title: String(row.title),
      subtitle: row.subtitle ? String(row.subtitle) : undefined,
      oneLine: String(row.one_line),
      body: row.body ? String(row.body) : undefined,
      misconception: row.misconception ? String(row.misconception) : undefined,
      reality: row.reality ? String(row.reality) : undefined,
      why: row.why ? String(row.why) : undefined,
      actionSteps: row.action_steps
        ? parseJsonArray(row.action_steps)
        : undefined,
      cost: row.cost ? String(row.cost) : undefined,
      benefit: row.benefit ? String(row.benefit) : undefined,
      notes: row.notes ? String(row.notes) : undefined,
      ratio: row.ratio ? String(row.ratio) : undefined,
      grade: (row.grade as KnowledgeCard["grade"]) || "A",
      evidenceLevel:
        (row.evidence_level as KnowledgeCard["evidenceLevel"]) || "strong",
      riskLevel: (row.risk_level as KnowledgeCard["riskLevel"]) || "low",
      angle: (row.angle as KnowledgeCard["angle"]) || "action",
      difficulty: Number(row.difficulty || 1) as KnowledgeCard["difficulty"],
      region: row.region ? parseJsonArray(row.region) : undefined,
      audience: row.audience ? parseJsonArray(row.audience) : undefined,
      scenarios: row.scenarios ? parseJsonArray(row.scenarios) : undefined,
      tags: parseJsonArray(row.tags),
      status: row.status as KnowledgeCard["status"],
      publishedAt: row.published_at ? String(row.published_at) : undefined,
      updatedAt: String(row.updated_at || new Date().toISOString()),
      verifiedAt: row.verified_at ? String(row.verified_at) : undefined,
    };
  }

  private mapRowToClaim(row: SqlRow): KnowledgeClaim {
    return {
      id: String(row.id),
      conceptId: String(row.concept_id),
      claimType: row.claim_type as KnowledgeClaim["claimType"],
      claimText: String(row.claim_text),
      canonical: Boolean(row.canonical),
      confidence: row.confidence ? Number(row.confidence) : 1.0,
      evidenceLevel: row.evidence_level as KnowledgeClaim["evidenceLevel"],
      status: row.status as KnowledgeClaim["status"],
      version: Number(row.version || 1),
      sourceIds: parseJsonArray(row.source_ids),
      createdAt: String(row.created_at || new Date().toISOString()),
      updatedAt: String(row.updated_at || new Date().toISOString()),
    };
  }

  private mapRowToSource(row: SqlRow): KnowledgeSource {
    return {
      id: String(row.id),
      organization: row.organization ? String(row.organization) : undefined,
      title: String(row.title),
      author: row.author ? String(row.author) : undefined,
      url: String(row.url),
      sourceType: row.source_type as KnowledgeSource["sourceType"],
      publicationDate: row.publication_date
        ? String(row.publication_date)
        : undefined,
      region: row.region ? String(row.region) : undefined,
      language: row.language ? String(row.language) : undefined,
      retrievedAt: String(row.retrieved_at || "2026-10-08"),
      status: row.status as KnowledgeSource["status"],
      citation: row.citation ? String(row.citation) : undefined,
    };
  }

  private mapRowToRelation(row: SqlRow): KnowledgeRelation {
    return {
      id: String(row.id),
      sourceConceptId: String(row.source_concept_id),
      relationType: row.relation_type as KnowledgeRelation["relationType"],
      targetConceptId: String(row.target_concept_id),
      confidence: Number(row.confidence || 1.0),
      createdBy: row.created_by ? String(row.created_by) : undefined,
      createdAt: String(row.created_at || new Date().toISOString()),
    };
  }

  // --- Concepts ---
  async getAllConcepts(): Promise<KnowledgeConcept[]> {
    if (this.isTestEnv) return Array.from(this.memoryConcepts.values());
    if (this.conceptCache) return Array.from(this.conceptCache.values());

    await this.initSchema();
    if (!this.client) return [];

    const res = await this.client.execute(
      "SELECT * FROM concepts ORDER BY created_at DESC;"
    );
    const list = res.rows.map((r) => this.mapRowToConcept(r));
    this.conceptCache = new Map(list.map((c) => [c.id, c]));
    return list;
  }

  async getConceptById(id: string): Promise<KnowledgeConcept | null> {
    if (this.isTestEnv) return this.memoryConcepts.get(id) || null;
    if (this.conceptCache) return this.conceptCache.get(id) || null;

    await this.initSchema();
    if (!this.client) return null;

    const res = await this.client.execute({
      sql: "SELECT * FROM concepts WHERE id = ? LIMIT 1;",
      args: [id],
    });
    if (res.rows.length === 0) return null;
    return this.mapRowToConcept(res.rows[0]);
  }

  async createConcept(concept: KnowledgeConcept): Promise<void> {
    this.conceptCache = null;
    if (this.isTestEnv) {
      this.memoryConcepts.set(concept.id, concept);
      return;
    }
    await this.initSchema();
    if (!this.client) return;

    await this.client.execute({
      sql: `INSERT OR REPLACE INTO concepts (
        id, name, canonical_question, canonical_summary, domain, topic,
        parent_concept_id, status, difficulty, origin, quality_score,
        tags, verified_at, next_review_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        concept.id,
        concept.name,
        concept.canonicalQuestion,
        concept.canonicalSummary,
        concept.domain,
        concept.topic || null,
        concept.parentConceptId || null,
        concept.status,
        concept.difficulty,
        concept.origin,
        concept.qualityScore || 90,
        JSON.stringify(concept.tags || []),
        concept.verifiedAt || null,
        concept.nextReviewAt || null,
        concept.createdAt || new Date().toISOString(),
        concept.updatedAt || new Date().toISOString(),
      ],
    });
  }

  async updateConcept(concept: KnowledgeConcept): Promise<void> {
    await this.createConcept(concept);
  }

  async deleteConcept(id: string): Promise<boolean> {
    this.conceptCache = null;
    if (this.isTestEnv) return this.memoryConcepts.delete(id);
    await this.initSchema();
    if (!this.client) return false;

    const res = await this.client.execute({
      sql: "DELETE FROM concepts WHERE id = ?;",
      args: [id],
    });
    return res.rowsAffected > 0;
  }

  // --- Cards ---
  async getAllCards(): Promise<KnowledgeCard[]> {
    if (this.isTestEnv) {
      return Array.from(this.memoryCards.values()).filter(
        (c) => c.status === "published"
      );
    }
    if (this.cardCache) {
      return Array.from(this.cardCache.values()).filter(
        (c) => c.status === "published"
      );
    }

    await this.initSchema();
    if (!this.client) return [];

    const res = await this.client.execute(
      "SELECT * FROM cards WHERE status = 'published' ORDER BY published_at DESC, rowid ASC;"
    );
    const list = res.rows.map((r) => this.mapRowToCard(r));
    this.cardCache = new Map(list.map((c) => [c.id, c]));
    return list;
  }

  async getCardById(id: string): Promise<KnowledgeCard | null> {
    if (this.isTestEnv) return this.memoryCards.get(id) || null;
    if (this.cardCache) return this.cardCache.get(id) || null;

    await this.initSchema();
    if (!this.client) return null;

    const res = await this.client.execute({
      sql: "SELECT * FROM cards WHERE id = ? LIMIT 1;",
      args: [id],
    });
    if (res.rows.length === 0) return null;
    return this.mapRowToCard(res.rows[0]);
  }

  async getCardsByModule(
    module: KnowledgeCard["module"]
  ): Promise<KnowledgeCard[]> {
    if (this.isTestEnv) {
      return Array.from(this.memoryCards.values()).filter(
        (c) => c.module === module && c.status === "published"
      );
    }
    if (this.cardCache) {
      return Array.from(this.cardCache.values()).filter(
        (c) => c.module === module && c.status === "published"
      );
    }

    await this.initSchema();
    if (!this.client) return [];

    const res = await this.client.execute({
      sql: "SELECT * FROM cards WHERE module = ? AND status = 'published' ORDER BY rowid ASC;",
      args: [module],
    });
    return res.rows.map((r) => this.mapRowToCard(r));
  }

  async getCardsByConceptId(conceptId: string): Promise<KnowledgeCard[]> {
    if (this.isTestEnv) {
      return Array.from(this.memoryCards.values()).filter(
        (c) => c.conceptId === conceptId
      );
    }
    if (this.cardCache) {
      return Array.from(this.cardCache.values()).filter(
        (c) => c.conceptId === conceptId
      );
    }

    await this.initSchema();
    if (!this.client) return [];

    const res = await this.client.execute({
      sql: "SELECT * FROM cards WHERE concept_id = ?;",
      args: [conceptId],
    });
    return res.rows.map((r) => this.mapRowToCard(r));
  }

  async createCard(card: KnowledgeCard): Promise<void> {
    this.cardCache = null;
    if (this.isTestEnv) {
      this.memoryCards.set(card.id, card);
      return;
    }
    await this.initSchema();
    if (!this.client) return;

    await this.client.execute({
      sql: `INSERT OR REPLACE INTO cards (
        id, concept_id, primary_claim_id, type, module, title, subtitle,
        one_line, body, misconception, reality, why, action_steps, cost,
        benefit, notes, ratio, grade, evidence_level, risk_level, angle,
        difficulty, region, audience, scenarios, tags, status,
        published_at, updated_at, verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        card.id,
        card.conceptId,
        card.primaryClaimId || null,
        card.type,
        card.module,
        card.title,
        card.subtitle || null,
        card.oneLine,
        card.body || null,
        card.misconception || null,
        card.reality || null,
        card.why || null,
        JSON.stringify(card.actionSteps || []),
        card.cost || null,
        card.benefit || null,
        card.notes || null,
        card.ratio || null,
        card.grade || "A",
        card.evidenceLevel || "strong",
        card.riskLevel || "low",
        card.angle || "action",
        card.difficulty || 1,
        JSON.stringify(card.region || []),
        JSON.stringify(card.audience || []),
        JSON.stringify(card.scenarios || []),
        JSON.stringify(card.tags || []),
        card.status,
        card.publishedAt || new Date().toISOString(),
        card.updatedAt || new Date().toISOString(),
        card.verifiedAt || null,
      ],
    });
  }

  async updateCard(card: KnowledgeCard): Promise<void> {
    await this.createCard(card);
  }

  async deleteCard(id: string): Promise<boolean> {
    this.cardCache = null;
    if (this.isTestEnv) return this.memoryCards.delete(id);
    await this.initSchema();
    if (!this.client) return false;

    const res = await this.client.execute({
      sql: "DELETE FROM cards WHERE id = ?;",
      args: [id],
    });
    return res.rowsAffected > 0;
  }

  // --- Claims ---
  async getAllClaims(): Promise<KnowledgeClaim[]> {
    if (this.isTestEnv) return Array.from(this.memoryClaims.values());
    await this.initSchema();
    if (!this.client) return [];

    const res = await this.client.execute("SELECT * FROM claims;");
    return res.rows.map((r) => this.mapRowToClaim(r));
  }

  async getClaimsByConceptId(conceptId: string): Promise<KnowledgeClaim[]> {
    if (this.isTestEnv) {
      return Array.from(this.memoryClaims.values()).filter(
        (cl) => cl.conceptId === conceptId
      );
    }
    await this.initSchema();
    if (!this.client) return [];

    const res = await this.client.execute({
      sql: "SELECT * FROM claims WHERE concept_id = ?;",
      args: [conceptId],
    });
    return res.rows.map((r) => this.mapRowToClaim(r));
  }

  async createClaim(claim: KnowledgeClaim): Promise<void> {
    if (this.isTestEnv) {
      this.memoryClaims.set(claim.id, claim);
      return;
    }
    await this.initSchema();
    if (!this.client) return;

    await this.client.execute({
      sql: `INSERT OR REPLACE INTO claims (
        id, concept_id, claim_type, claim_text, canonical, confidence,
        evidence_level, status, version, source_ids, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        claim.id,
        claim.conceptId,
        claim.claimType,
        claim.claimText,
        claim.canonical ? 1 : 0,
        claim.confidence ?? 1.0,
        claim.evidenceLevel,
        claim.status,
        claim.version || 1,
        JSON.stringify(claim.sourceIds || []),
        claim.createdAt || new Date().toISOString(),
        claim.updatedAt || new Date().toISOString(),
      ],
    });
  }

  // --- Sources ---
  async getAllSources(): Promise<KnowledgeSource[]> {
    if (this.isTestEnv) return Array.from(this.memorySources.values());
    await this.initSchema();
    if (!this.client) return [];

    const res = await this.client.execute("SELECT * FROM sources;");
    return res.rows.map((r) => this.mapRowToSource(r));
  }

  async getSourcesByIds(ids: string[]): Promise<KnowledgeSource[]> {
    if (this.isTestEnv) {
      return ids
        .map((id) => this.memorySources.get(id))
        .filter(Boolean) as KnowledgeSource[];
    }
    if (!ids || ids.length === 0) return [];
    await this.initSchema();
    if (!this.client) return [];

    const placeholders = ids.map(() => "?").join(",");
    const res = await this.client.execute({
      sql: `SELECT * FROM sources WHERE id IN (${placeholders});`,
      args: ids,
    });
    return res.rows.map((r) => this.mapRowToSource(r));
  }

  async createSource(source: KnowledgeSource): Promise<void> {
    if (this.isTestEnv) {
      this.memorySources.set(source.id, source);
      return;
    }
    await this.initSchema();
    if (!this.client) return;

    await this.client.execute({
      sql: `INSERT OR REPLACE INTO sources (
        id, organization, title, author, url, source_type,
        publication_date, region, language, retrieved_at, status, citation, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        source.id,
        source.organization || null,
        source.title,
        source.author || null,
        source.url,
        source.sourceType,
        source.publicationDate || null,
        source.region || null,
        source.language || null,
        source.retrievedAt || new Date().toISOString().split("T")[0],
        source.status,
        source.citation || null,
        new Date().toISOString(),
      ],
    });
  }

  // --- Relations ---
  async getAllRelations(): Promise<KnowledgeRelation[]> {
    if (this.isTestEnv) return [...this.memoryRelations];
    await this.initSchema();
    if (!this.client) return [];

    const res = await this.client.execute("SELECT * FROM relations;");
    return res.rows.map((r) => this.mapRowToRelation(r));
  }

  async getRelatedConcepts(
    conceptId: string
  ): Promise<{ relation: KnowledgeRelation; concept: KnowledgeConcept }[]> {
    if (this.isTestEnv) {
      const rels = this.memoryRelations.filter(
        (r) =>
          r.sourceConceptId === conceptId || r.targetConceptId === conceptId
      );
      const result: {
        relation: KnowledgeRelation;
        concept: KnowledgeConcept;
      }[] = [];
      for (const r of rels) {
        const targetId =
          r.sourceConceptId === conceptId
            ? r.targetConceptId
            : r.sourceConceptId;
        const targetConcept = this.memoryConcepts.get(targetId);
        if (targetConcept) {
          result.push({ relation: r, concept: targetConcept });
        }
      }
      return result;
    }

    await this.initSchema();
    if (!this.client) return [];

    const relRes = await this.client.execute({
      sql: "SELECT * FROM relations WHERE source_concept_id = ? OR target_concept_id = ?;",
      args: [conceptId, conceptId],
    });
    if (relRes.rows.length === 0) return [];

    const relations = relRes.rows.map((r) => this.mapRowToRelation(r));
    const targetIds = relations.map((r) =>
      r.sourceConceptId === conceptId ? r.targetConceptId : r.sourceConceptId
    );

    const placeholders = targetIds.map(() => "?").join(",");
    const conceptRes = await this.client.execute({
      sql: `SELECT * FROM concepts WHERE id IN (${placeholders});`,
      args: targetIds,
    });

    const conceptMap = new Map<string, KnowledgeConcept>();
    conceptRes.rows.forEach((r) => {
      conceptMap.set(String(r.id), this.mapRowToConcept(r));
    });

    const results: {
      relation: KnowledgeRelation;
      concept: KnowledgeConcept;
    }[] = [];
    for (const r of relations) {
      const targetId =
        r.sourceConceptId === conceptId
          ? r.targetConceptId
          : r.sourceConceptId;
      const targetConcept = conceptMap.get(targetId);
      if (targetConcept) {
        results.push({ relation: r, concept: targetConcept });
      }
    }
    return results;
  }

  async createRelation(relation: KnowledgeRelation): Promise<void> {
    if (this.isTestEnv) {
      this.memoryRelations.push(relation);
      return;
    }
    await this.initSchema();
    if (!this.client) return;

    await this.client.execute({
      sql: `INSERT OR REPLACE INTO relations (
        id, source_concept_id, relation_type, target_concept_id,
        confidence, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      args: [
        relation.id,
        relation.sourceConceptId,
        relation.relationType,
        relation.targetConceptId,
        relation.confidence,
        relation.createdBy || null,
        relation.createdAt || new Date().toISOString(),
      ],
    });
  }

  async search(keyword: string): Promise<KnowledgeCard[]> {
    const clean = keyword.trim().toLowerCase();
    if (!clean) return [];

    if (this.isTestEnv) {
      return Array.from(this.memoryCards.values()).filter((card) => {
        const inTitle = card.title.toLowerCase().includes(clean);
        const inOneLine = card.oneLine.toLowerCase().includes(clean);
        const inBody = card.body?.toLowerCase().includes(clean) || false;
        const inTags = card.tags?.some((t) => t.toLowerCase().includes(clean)) || false;
        return inTitle || inOneLine || inBody || inTags;
      });
    }

    await this.initSchema();
    if (!this.client) return [];

    const pattern = `%${clean}%`;
    const res = await this.client.execute({
      sql: `SELECT * FROM cards WHERE status = 'published' AND (
        title LIKE ? OR one_line LIKE ? OR body LIKE ? OR misconception LIKE ? OR tags LIKE ?
      ) ORDER BY published_at DESC;`,
      args: [pattern, pattern, pattern, pattern, pattern],
    });

    return res.rows.map((r) => this.mapRowToCard(r));
  }

  async clearAll(): Promise<void> {
    this.cardCache = null;
    this.conceptCache = null;
    if (this.isTestEnv) {
      this.memoryConcepts.clear();
      this.memoryClaims.clear();
      this.memoryCards.clear();
      this.memorySources.clear();
      this.memoryRelations = [];
      return;
    }

    await this.initSchema();
    if (!this.client) return;

    await this.client.execute("DELETE FROM relations;");
    await this.client.execute("DELETE FROM cards;");
    await this.client.execute("DELETE FROM claims;");
    await this.client.execute("DELETE FROM concepts;");
    await this.client.execute("DELETE FROM sources;");
  }
}
