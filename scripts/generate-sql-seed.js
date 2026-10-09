const fs = require("fs");
const path = require("path");

const dbPath = path.resolve(__dirname, "../data/knowledge-db.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + String(str).replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
}

function escapeArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "'{}'";
  const escaped = arr.map((item) => '"' + String(item).replace(/"/g, '\\"') + '"').join(",");
  return "'{" + escaped + "}'";
}

const lines = [
  "-- ============================================================",
  "-- 人生常识知识库 - PostgreSQL / Supabase 完整初始数据包",
  `-- 包含 1340 Concepts, 1840 Cards, 1840 Claims, 775 Sources`,
  "-- ============================================================",
  "",
  "BEGIN;",
  "",
  "-- 1. 清空旧数据",
  "TRUNCATE TABLE relations, cards, claims, concepts, sources CASCADE;",
  "",
];

// Concepts
lines.push("-- 2. 插入 Concepts 概念数据");
for (const c of data.concepts) {
  lines.push(
    `INSERT INTO concepts (id, name, canonical_question, canonical_summary, domain, topic, status, difficulty, origin, quality_score, tags, created_at, updated_at) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.canonicalQuestion)}, ${escapeSql(c.canonicalSummary)}, ${escapeSql(c.domain)}, ${escapeSql(c.topic)}, ${escapeSql(c.status)}, ${c.difficulty || 1}, ${escapeSql(c.origin || "imported")}, ${c.qualityScore || 90}, ${escapeArray(c.tags)}, ${escapeSql(c.createdAt)}, ${escapeSql(c.updatedAt)}) ON CONFLICT (id) DO NOTHING;`
  );
}

// Sources
lines.push("\n-- 3. 插入 Sources 权威信源数据");
for (const s of data.sources) {
  lines.push(
    `INSERT INTO sources (id, organization, title, url, source_type, retrieved_at, status, citation) VALUES (${escapeSql(s.id)}, ${escapeSql(s.organization)}, ${escapeSql(s.title)}, ${escapeSql(s.url)}, ${escapeSql(s.sourceType || "official")}, ${escapeSql(s.retrievedAt)}, ${escapeSql(s.status || "active")}, ${escapeSql(s.citation)}) ON CONFLICT (id) DO NOTHING;`
  );
}

// Claims
lines.push("\n-- 4. 插入 Claims 事实数据");
for (const cl of data.claims) {
  lines.push(
    `INSERT INTO claims (id, concept_id, claim_type, claim_text, canonical, confidence, evidence_level, status, version, source_ids, created_at, updated_at) VALUES (${escapeSql(cl.id)}, ${escapeSql(cl.conceptId)}, ${escapeSql(cl.claimType)}, ${escapeSql(cl.claimText)}, ${Boolean(cl.canonical)}, 1.0, ${escapeSql(cl.evidenceLevel || "strong")}, ${escapeSql(cl.status || "supported")}, ${cl.version || 1}, ${escapeArray(cl.sourceIds)}, ${escapeSql(cl.createdAt)}, ${escapeSql(cl.updatedAt)}) ON CONFLICT (id) DO NOTHING;`
  );
}

// Cards
lines.push("\n-- 5. 插入 Cards 卡片数据");
for (const cd of data.cards) {
  lines.push(
    `INSERT INTO cards (id, concept_id, primary_claim_id, type, module, title, subtitle, one_line, body, misconception, reality, why, cost, benefit, notes, ratio, grade, difficulty, evidence_level, risk_level, angle, status, tags, published_at, updated_at) VALUES (${escapeSql(cd.id)}, ${escapeSql(cd.conceptId)}, ${escapeSql(cd.primaryClaimId)}, ${escapeSql(cd.type)}, ${escapeSql(cd.module)}, ${escapeSql(cd.title)}, ${escapeSql(cd.subtitle)}, ${escapeSql(cd.oneLine)}, ${escapeSql(cd.body)}, ${escapeSql(cd.misconception)}, ${escapeSql(cd.reality)}, ${escapeSql(cd.why)}, ${escapeSql(cd.cost)}, ${escapeSql(cd.benefit)}, ${escapeSql(cd.notes)}, ${escapeSql(cd.ratio)}, ${escapeSql(cd.grade || "A")}, ${cd.difficulty || 1}, ${escapeSql(cd.evidenceLevel || "strong")}, ${escapeSql(cd.riskLevel || "low")}, ${escapeSql(cd.angle || "action")}, ${escapeSql(cd.status || "published")}, ${escapeArray(cd.tags)}, ${escapeSql(cd.publishedAt)}, ${escapeSql(cd.updatedAt)}) ON CONFLICT (id) DO NOTHING;`
  );
}

lines.push("\nCOMMIT;");

const outSql = path.resolve(__dirname, "../supabase/seed.sql");
fs.writeFileSync(outSql, lines.join("\n"), "utf8");
console.log(`已成功生成 Supabase SQL 导入脚本: ${outSql} (大小: ${(fs.statSync(outSql).size / (1024 * 1024)).toFixed(2)} MB)`);
