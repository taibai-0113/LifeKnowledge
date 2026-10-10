const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// 加载环境变量（优先读取 .env.local，其次读取 .env）
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(__dirname, "..", file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const [k, ...v] = trimmed.split("=");
        if (k && v.length) {
          process.env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
        }
      });
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ 缺少 Supabase 环境变量！请在 .env.local 中配置：");
  console.error("  NEXT_PUBLIC_SUPABASE_URL=你的项目URL");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=你的服务角色私钥 (service_role)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function batchInsert(table, rows, chunkSize = 100) {
  console.log(`正在写入 ${table} (共 ${rows.length} 条)...`);
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error(`❌ 写入 ${table} [${i} - ${i + chunk.length}] 失败:`, error.message);
      throw error;
    }
    process.stdout.write(`  已导入 ${Math.min(i + chunkSize, rows.length)} / ${rows.length}\r`);
  }
  console.log(`\n✅ ${table} 导入完成！`);
}

async function main() {
  console.log("=== 开始向云端 Supabase 数据库同步数据 ===");
  console.log("连接目标:", supabaseUrl);

  const dbPath = path.resolve(__dirname, "../data/knowledge-db.json");
  if (!fs.existsSync(dbPath)) {
    console.error("❌ 未找到本地数据文件 data/knowledge-db.json");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  // 1. Concepts
  const concepts = raw.concepts.map((c) => ({
    id: c.id,
    name: c.name,
    canonical_question: c.canonicalQuestion || c.name,
    canonical_summary: c.canonicalSummary || "",
    domain: c.domain,
    topic: c.topic || null,
    status: c.status || "published",
    difficulty: c.difficulty || 1,
    origin: c.origin || "imported",
    quality_score: c.qualityScore || 90,
    tags: c.tags || [],
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString(),
  }));

  // 2. Sources
  const sources = raw.sources.map((s) => ({
    id: s.id,
    organization: s.organization || null,
    title: s.title,
    url: s.url || "",
    source_type: s.sourceType || "official",
    retrieved_at: s.retrievedAt || null,
    status: s.status || "active",
    citation: s.citation || null,
  }));

  // 3. Claims
  const claims = raw.claims.map((cl) => ({
    id: cl.id,
    concept_id: cl.conceptId,
    claim_type: cl.claimType || "fact",
    claim_text: cl.claimText,
    canonical: Boolean(cl.canonical),
    confidence: 1.0,
    evidence_level: cl.evidenceLevel || "strong",
    status: cl.status || "supported",
    version: cl.version || 1,
    source_ids: cl.sourceIds || [],
    created_at: cl.createdAt || new Date().toISOString(),
    updated_at: cl.updatedAt || new Date().toISOString(),
  }));

  // 4. Cards
  const cards = raw.cards.map((cd) => ({
    id: cd.id,
    concept_id: cd.conceptId,
    primary_claim_id: cd.primaryClaimId || null,
    type: cd.type || "standard",
    module: cd.module || "life_archive",
    title: cd.title,
    subtitle: cd.subtitle || null,
    one_line: cd.oneLine || cd.title,
    body: cd.body || null,
    misconception: cd.misconception || null,
    reality: cd.reality || null,
    why: cd.why || null,
    cost: cd.cost || null,
    benefit: cd.benefit || null,
    notes: cd.notes || null,
    ratio: cd.ratio || null,
    grade: cd.grade || "A",
    difficulty: cd.difficulty || 1,
    evidence_level: cd.evidenceLevel || "strong",
    risk_level: cd.riskLevel || "low",
    angle: cd.angle || "action",
    status: cd.status || "published",
    tags: cd.tags || [],
    published_at: cd.publishedAt || new Date().toISOString(),
    updated_at: cd.updatedAt || new Date().toISOString(),
  }));

  await batchInsert("concepts", concepts);
  await batchInsert("sources", sources);
  await batchInsert("claims", claims);
  await batchInsert("cards", cards);

  console.log("\n🎉 全部知识库数据已成功推送到云端 Supabase 数据库！");
}

main().catch((err) => {
  console.error("同步失败:", err);
  process.exit(1);
});
