const fs = require("fs");
const path = require("path");

// 1. 解析 《高性价比人生指南 · 全书 34 节》
function parseLifeArchiveGuide(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const chapterSections = html.split(/<h2[^>]*>/);
  const result = {
    concepts: [],
    claims: [],
    cards: [],
    sources: [],
    relations: [],
  };

  const domainMap = {
    "1. 不要早死": "safety",
    "2. 不要慢慢死": "health",
    "3. 不要浪费精力": "psychology",
    "4. 不要浪费时间": "efficiency",
    "5. 不要浪费钱": "finance",
    "6. 反面清单": "consumer",
    "7. 没钱的时候怎么活": "living",
    "8. 别把自己搭进去：法律与财产安全": "legal",
    "9. 普通人容易踩的法律红线": "legal",
    "10. 恋爱和结婚划不划算": "relationship",
    "11. 要不要生孩子": "family",
    "12. 养孩子怎么少花冤枉钱": "parenting",
    "13. 怎么吃：营养与健康": "diet",
    "14. 怎么做饭：厨房与烹饪": "kitchen",
    "15. 怎么买菜：菜场与超市": "grocery",
    "16. 怎么穿：衣服与鞋": "clothing",
    "17. 怎么住：租房与买房": "housing",
    "18. 怎么装修：装修与家居": "renovation",
    "19. 怎么打扫：家务与清洁": "cleaning",
    "20. 怎么出行：交通与旅行": "travel",
    "21. 怎么运动：健身与防伤": "fitness",
    "22. 怎么放松：娱乐场所和减压": "relaxation",
    "23. 怎么看病：挂号、就医与用药": "medical",
    "24. 怎么买保险：医保与商业保险": "insurance",
    "25. 怎么工作：求职、跳槽与副业": "career",
    "26. 怎么选专业和转行": "education",
    "27. 怎么学习：技能与考证": "learning",
    "28. 怎么交朋友：朋友与社交圈": "social",
    "29. 怎么养老：父母与自己的晚年": "eldercare",
    "30. 怎么面对亲人离世：临终与丧葬": "endoflife",
    "31. 怎么处理纠纷：邻里、消费与劳动纠纷": "disputes",
    "32. 怎么保护隐私：个人信息与网络安全": "privacy",
    "33. 怎么做决定：重大人生选择清单": "decision",
    "34. 核心清单速查": "checklist",
  };

  for (let c = 1; c < chapterSections.length; c++) {
    const chSection = chapterSections[c];
    const h2End = chSection.indexOf("</h2>");
    if (h2End === -1) continue;
    const chapterTitle = chSection.substring(0, h2End).replace(/<[^>]+>/g, "").trim();
    const domain = domainMap[chapterTitle] || "living";

    const rawCards = chSection.split(/<article class="card"/);
    for (let i = 1; i < rawCards.length; i++) {
      const cardHtml = rawCards[i];

      const idMatch = cardHtml.match(/id="([^"]+)"/);
      const gradeMatch = cardHtml.match(/data-grade="([^"]+)"/);
      const ratioMatch = cardHtml.match(/data-ratio="([^"]+)"/);

      const rawId = idMatch ? idMatch[1] : `s${c}-${i}`;
      const cardId = `card_archive_${rawId}`;
      const conceptId = `concept_archive_${rawId}`;
      const claimId = `claim_archive_${rawId}`;
      const sourceId = `src_archive_${rawId}`;

      const grade = gradeMatch ? gradeMatch[1] : "A";
      const ratio = ratioMatch ? ratioMatch[1] : "高";

      // 标题
      const titleMatch = cardHtml.match(/<h3[^>]*>(.*?)<\/h3>/);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      if (!title) continue;

      // 标签与Chips
      const chipsMatch = cardHtml.match(/<div class="chips">(.*?)<\/div>/s);
      const tags = [chapterTitle];
      if (chipsMatch) {
        const chipTexts = (chipsMatch[1].match(/<span[^>]*>(.*?)<\/span>/g) || []).map((s) =>
          s.replace(/<[^>]+>/g, "").trim()
        );
        tags.push(...chipTexts);
      }

      // 一句话正文
      const plainMatch = cardHtml.match(/<p class="plain">(.*?)<\/p>/s);
      const plain = plainMatch ? plainMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      const oneLine = plain || title;

      // 成本, 收益, 备注
      const extractField = (fieldName) => {
        const regex = new RegExp(`<b>${fieldName}<\\/b>\\s*<div>(.*?)<\\/div>`, "s");
        const m = cardHtml.match(regex);
        return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
      };

      const cost = extractField("成本");
      const benefit = extractField("收益");
      const note = extractField("备注");

      // 来源
      const srcMatch = cardHtml.match(/<div class="sbody">(.*?)<\/div>/s);
      const sourceText = srcMatch ? srcMatch[1].replace(/<[^>]+>/g, "").trim() : "";

      const timestamp = "2026-10-08T00:00:00.000Z";

      // 1. Source
      if (sourceText) {
        result.sources.push({
          id: sourceId,
          organization: sourceText.split(/[(:;]/)[0]?.trim() || "权威科学来源",
          title: sourceText.substring(0, 200),
          url: (sourceText.match(/https?:\/\/[^\s<;]+/)?.[0]) || "https://cdyforever.github.io/how-to-live-better/",
          sourceType: "guideline",
          retrievedAt: "2026-10-08",
          status: "active",
          citation: sourceText,
        });
      }

      // 2. Concept
      result.concepts.push({
        id: conceptId,
        name: title,
        canonicalQuestion: title.includes("？") || title.includes("?") ? title : `为什么${title}？`,
        canonicalSummary: oneLine,
        domain: domain,
        topic: chapterTitle,
        status: "published",
        difficulty: 1,
        origin: "reference_book",
        qualityScore: 95,
        tags: tags,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      // 3. Claim
      result.claims.push({
        id: claimId,
        conceptId: conceptId,
        claimType: "recommendation",
        claimText: benefit || oneLine,
        canonical: true,
        evidenceLevel: grade === "A+" || grade === "A" ? "very_strong" : "strong",
        status: "supported",
        version: 1,
        sourceIds: sourceText ? [sourceId] : [],
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      // 4. Card
      result.cards.push({
        id: cardId,
        conceptId: conceptId,
        primaryClaimId: claimId,
        type: "action",
        module: "life_archive",
        title: title,
        subtitle: chapterTitle,
        oneLine: oneLine,
        body: note || benefit || oneLine,
        cost: cost || "不花钱",
        benefit: benefit || oneLine,
        notes: note || undefined,
        ratio: ratio,
        grade: ["A+", "A", "B", "C"].includes(grade) ? grade : "A",
        difficulty: 1,
        evidenceLevel: grade === "A+" || grade === "A" ? "very_strong" : "strong",
        riskLevel: "low",
        angle: "action",
        status: "published",
        tags: tags,
        publishedAt: timestamp,
        updatedAt: timestamp,
      });
    }
  }

  return result;
}

// 2. 解析 扫清生活盲区 150 条 (life_blindspots_150.json)
function parseBlindspots150(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const result = {
    concepts: [],
    claims: [],
    cards: [],
    sources: [],
    relations: [],
  };

  const sourceIndex = new Map();
  (data.source_index || []).forEach((s) => {
    sourceIndex.set(s.id, s);
  });

  const cardsList = data.cards || data.items || [];
  const timestamp = "2026-10-08T00:00:00.000Z";

  for (const c of cardsList) {
    const cardId = `card_blindspot_${c.id}`;
    const conceptId = `concept_blindspot_${c.concept_id || c.id}`;
    const claimId = `claim_blindspot_${c.id}`;

    // 处理信源
    const cardSources = (c.source_ids || [])
      .map((sid) => sourceIndex.get(sid))
      .filter(Boolean);

    const sourceIds = [];
    for (const src of cardSources) {
      const sId = `src_b150_${src.id}`;
      sourceIds.push(sId);
      if (!result.sources.some((s) => s.id === sId)) {
        result.sources.push({
          id: sId,
          organization: src.name?.split(/[(:;—]/)[0]?.trim() || "权威来源",
          title: src.name || "权威参考",
          url: src.url || "https://example.com/source",
          sourceType: "official",
          retrievedAt: "2026-10-08",
          status: "active",
          citation: src.note ? `${src.name} (${src.note})` : src.name,
        });
      }
    }

    const title = c.title;
    const oneLine = c.one_line || title;
    const youMightThink = c.you_might_think || undefined;
    const reality = c.reality || undefined;
    const why = c.why || undefined;
    const remember = c.remember || undefined;

    // 格式化为高性价比人生指南排版
    const cost = "阅读约 30 秒。认知纠偏零金钱成本，无需额外消费。";
    const benefit = remember || reality || oneLine;
    const noteParts = [];
    if (why) noteParts.push(why);
    if (reality && !noteParts.includes(reality)) noteParts.push(`实际上：${reality}`);
    const notes = noteParts.join("\n\n");

    const tags = ["生活盲区", c.domain || "常识", ...(c.tags || [])];

    // Concept
    result.concepts.push({
      id: conceptId,
      name: title,
      canonicalQuestion: title.includes("？") || title.includes("?") ? title : `为什么${title}？`,
      canonicalSummary: oneLine,
      domain: c.domain || "living",
      topic: tags[1] || "生活常识",
      status: "published",
      difficulty: 1,
      origin: "imported",
      qualityScore: 92,
      tags: tags,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Claim
    result.claims.push({
      id: claimId,
      conceptId: conceptId,
      claimType: "fact",
      claimText: reality || why || oneLine,
      canonical: true,
      evidenceLevel: c.evidence_level || "strong",
      status: "supported",
      version: 1,
      sourceIds: sourceIds,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Card
    result.cards.push({
      id: cardId,
      conceptId: conceptId,
      primaryClaimId: claimId,
      type: "blindspot",
      module: "blindspot",
      title: title,
      subtitle: c.domain ? `${c.domain} · 生活盲区` : "生活盲区",
      oneLine: oneLine,
      body: notes || oneLine,
      misconception: youMightThink,
      reality: reality,
      why: why,
      cost: cost,
      benefit: benefit,
      notes: notes,
      ratio: "极高",
      grade: "A",
      difficulty: 1,
      evidenceLevel: c.evidence_level || "strong",
      riskLevel: c.risk_level || "low",
      angle: "misconception",
      status: "published",
      tags: tags,
      publishedAt: timestamp,
      updatedAt: timestamp,
    });
  }

  return result;
}

// 3. 解析 扫清生活盲区 1000 条 (life_blindspots_1000_new.json)
function parseBlindspots1000(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const result = {
    concepts: [],
    claims: [],
    cards: [],
    sources: [],
    relations: [],
  };

  const sourceIndex = new Map();
  (data.source_index || []).forEach((s) => {
    sourceIndex.set(s.id, s);
  });

  // 导入官方预设 Concepts
  (data.concepts || []).forEach((c) => {
    result.concepts.push({
      id: `concept_b1000_${c.id}`,
      name: c.name,
      canonicalQuestion: c.canonical_question || `为什么${c.name}？`,
      canonicalSummary: c.canonical_summary || c.name,
      domain: c.category || "living",
      topic: c.subcategory || c.category,
      status: "published",
      difficulty: 1,
      origin: "imported",
      qualityScore: 90,
      tags: ["生活盲区", c.category, c.subcategory].filter(Boolean),
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    });
  });

  // 导入官方预设 Claims
  (data.claims || []).forEach((cl) => {
    const sIds = (cl.source_ids || []).map((sid) => `src_b1000_${sid}`);
    result.claims.push({
      id: `claim_b1000_${cl.id}`,
      conceptId: `concept_b1000_${cl.concept_id}`,
      claimType: cl.claim_type || "fact",
      claimText: cl.claim_text,
      canonical: Boolean(cl.canonical),
      evidenceLevel: cl.evidence_level || "strong",
      status: "supported",
      version: 1,
      sourceIds: sIds,
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    });
  });

  // 导入官方预设 Sources
  (data.source_index || []).forEach((s) => {
    result.sources.push({
      id: `src_b1000_${s.id}`,
      organization: s.name?.split(/[(:;—]/)[0]?.trim() || "权威来源",
      title: s.name,
      url: s.url || "https://example.com/source",
      sourceType: "official",
      retrievedAt: "2026-10-09",
      status: "active",
      citation: s.name,
    });
  });

  // 导入官方预设 Cards
  (data.cards || []).forEach((cd) => {
    const cardId = `card_b1000_${cd.id}`;
    const conceptId = `concept_b1000_${cd.concept_id}`;
    const claimId = `claim_b1000_${cd.primary_claim_id}`;

    const tags = cd.tags || ["生活盲区", cd.domain];

    result.cards.push({
      id: cardId,
      conceptId: conceptId,
      primaryClaimId: claimId,
      type: "blindspot",
      module: "blindspot",
      title: cd.title,
      subtitle: cd.domain ? `${cd.domain} · 机制解读` : "机制解读",
      oneLine: cd.one_line || cd.title,
      body: cd.notes || cd.why || cd.one_line,
      misconception: cd.you_might_think || undefined,
      reality: cd.reality || undefined,
      why: cd.why || undefined,
      cost: cd.cost || "认知型内容，不需额外金钱成本。",
      benefit: cd.benefit || cd.one_line,
      notes: cd.notes || cd.why,
      ratio: "极高",
      grade: "A",
      difficulty: 1,
      evidenceLevel: cd.evidence_level || "strong",
      riskLevel: cd.risk_level || "low",
      angle: cd.angle || "explanation",
      status: "published",
      tags: tags,
      publishedAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    });
  });

  return result;
}

// 主流程执行合并
async function main() {
  console.log("=== 开始读取并处理全部数据 ===");

  const pArchive = path.resolve(__dirname, "../data/how-to-live-better.html");
  const p150 = path.resolve(__dirname, "../data/life_blindspots_150_new_bundle/life_blindspots_150.json");
  const p1000 = path.resolve(__dirname, "../data/life_blindspots_1000_new_bundle/life_blindspots_1000_new.json");

  console.log("1. 解析《高性价比人生指南 · 全书 34 节》...");
  const archiveData = parseLifeArchiveGuide(pArchive);
  console.log(`   完成！生成档案卡片 ${archiveData.cards.length} 张，概念 ${archiveData.concepts.length} 个`);

  console.log("2. 解析《扫清生活盲区 150 条》...");
  const b150Data = parseBlindspots150(p150);
  console.log(`   完成！生成盲区卡片 ${b150Data.cards.length} 张，概念 ${b150Data.concepts.length} 个`);

  console.log("3. 解析《扫清生活盲区 1000 条》...");
  const b1000Data = parseBlindspots1000(p1000);
  console.log(`   完成！生成盲区卡片 ${b1000Data.cards.length} 张，概念 ${b1000Data.concepts.length} 个`);

  // 合并全部数据
  const allConceptsMap = new Map();
  [...archiveData.concepts, ...b150Data.concepts, ...b1000Data.concepts].forEach((c) => {
    allConceptsMap.set(c.id, c);
  });

  const allClaimsMap = new Map();
  [...archiveData.claims, ...b150Data.claims, ...b1000Data.claims].forEach((cl) => {
    allClaimsMap.set(cl.id, cl);
  });

  const allCardsMap = new Map();
  [...archiveData.cards, ...b150Data.cards, ...b1000Data.cards].forEach((cd) => {
    allCardsMap.set(cd.id, cd);
  });

  const allSourcesMap = new Map();
  [...archiveData.sources, ...b150Data.sources, ...b1000Data.sources].forEach((s) => {
    allSourcesMap.set(s.id, s);
  });

  const totalDump = {
    concepts: Array.from(allConceptsMap.values()),
    claims: Array.from(allClaimsMap.values()),
    cards: Array.from(allCardsMap.values()),
    sources: Array.from(allSourcesMap.values()),
    relations: [],
  };

  console.log("\n=== 数据聚合统计 ===");
  console.log(`总 Concepts 概念数: ${totalDump.concepts.length}`);
  console.log(`总 Cards 卡片数: ${totalDump.cards.length}`);
  console.log(`  - 人生知识档案: ${totalDump.cards.filter((c) => c.module === "life_archive").length}`);
  console.log(`  - 扫清生活盲区: ${totalDump.cards.filter((c) => c.module === "blindspot").length}`);
  console.log(`总 Claims 事实数: ${totalDump.claims.length}`);
  console.log(`总 Sources 权威信源数: ${totalDump.sources.length}`);

  // 写入本地数据库文件 data/knowledge-db.json
  const dbFile = path.resolve(__dirname, "../data/knowledge-db.json");
  fs.writeFileSync(dbFile, JSON.stringify(totalDump, null, 2), "utf8");
  console.log(`\n已成功持久化写入本地数据库: ${dbFile}`);
}

main().catch((err) => {
  console.error("执行出错:", err);
  process.exit(1);
});
