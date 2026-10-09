const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

async function main() {
  const jsonPath = path.resolve(__dirname, "../data/knowledge-db.json");
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const dbPath = path.resolve(__dirname, "../data/knowledge.db");
  const client = createClient({
    url: `file:${dbPath.replace(/\\/g, "/")}`,
  });

  console.log("=== 初始化 SQLite 数据库 (knowledge.db) ===");

  await client.execute(`
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

  await client.execute(`
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

  await client.execute(`
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

  await client.execute(`
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

  await client.execute(`
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

  await client.execute(`CREATE INDEX IF NOT EXISTS idx_cards_concept_id ON cards(concept_id);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_cards_module ON cards(module);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_claims_concept_id ON claims(concept_id);`);

  console.log("清空旧表数据以确保幂等性...");
  await client.execute("DELETE FROM relations;");
  await client.execute("DELETE FROM cards;");
  await client.execute("DELETE FROM claims;");
  await client.execute("DELETE FROM concepts;");
  await client.execute("DELETE FROM sources;");

  console.log(`1. 写入 Concepts (${data.concepts.length} 条)...`);
  for (const c of data.concepts) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO concepts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        c.id,
        c.name,
        c.canonicalQuestion,
        c.canonicalSummary,
        c.domain,
        c.topic || null,
        c.parentConceptId || null,
        c.status,
        c.difficulty,
        c.origin,
        c.qualityScore || 90,
        JSON.stringify(c.tags || []),
        c.verifiedAt || null,
        c.nextReviewAt || null,
        c.createdAt || new Date().toISOString(),
        c.updatedAt || new Date().toISOString(),
      ],
    });
  }

  console.log(`2. 写入 Sources (${data.sources.length} 条)...`);
  for (const s of data.sources) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO sources VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        s.id,
        s.organization || null,
        s.title,
        s.author || null,
        s.url,
        s.sourceType,
        s.publicationDate || null,
        s.region || null,
        s.language || null,
        s.retrievedAt || "2026-10-08",
        s.status,
        s.citation || null,
        new Date().toISOString(),
      ],
    });
  }

  console.log(`3. 写入 Claims (${data.claims.length} 条)...`);
  for (const cl of data.claims) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO claims VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        cl.id,
        cl.conceptId,
        cl.claimType,
        cl.claimText,
        cl.canonical ? 1 : 0,
        cl.confidence ?? 1.0,
        cl.evidenceLevel,
        cl.status,
        cl.version || 1,
        JSON.stringify(cl.sourceIds || []),
        cl.createdAt || new Date().toISOString(),
        cl.updatedAt || new Date().toISOString(),
      ],
    });
  }

  console.log(`4. 写入 Cards (${data.cards.length} 条)...`);
  for (const cd of data.cards) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        cd.id,
        cd.conceptId,
        cd.primaryClaimId || null,
        cd.type,
        cd.module,
        cd.title,
        cd.subtitle || null,
        cd.oneLine,
        cd.body || null,
        cd.misconception || null,
        cd.reality || null,
        cd.why || null,
        JSON.stringify(cd.actionSteps || []),
        cd.cost || null,
        cd.benefit || null,
        cd.notes || null,
        cd.ratio || null,
        cd.grade || "A",
        cd.evidenceLevel || "strong",
        cd.riskLevel || "low",
        cd.angle || "action",
        cd.difficulty || 1,
        JSON.stringify(cd.region || []),
        JSON.stringify(cd.audience || []),
        JSON.stringify(cd.scenarios || []),
        JSON.stringify(cd.tags || []),
        cd.status,
        cd.publishedAt || new Date().toISOString(),
        cd.updatedAt || new Date().toISOString(),
        cd.verifiedAt || null,
      ],
    });
  }

  // 验证查询
  const countCards = await client.execute("SELECT count(*) as total FROM cards;");
  const countConcepts = await client.execute("SELECT count(*) as total FROM concepts;");
  const countClaims = await client.execute("SELECT count(*) as total FROM claims;");
  const countSources = await client.execute("SELECT count(*) as total FROM sources;");

  console.log("\n=== 数据库写入成功 ===");
  console.log("knowledge.db 文件大小:", (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2), "MB");
  console.log("Cards 表记录数:", countCards.rows[0].total);
  console.log("Concepts 表记录数:", countConcepts.rows[0].total);
  console.log("Claims 表记录数:", countClaims.rows[0].total);
  console.log("Sources 表记录数:", countSources.rows[0].total);
}

main().catch((err) => {
  console.error("写入失败:", err);
  process.exit(1);
});
