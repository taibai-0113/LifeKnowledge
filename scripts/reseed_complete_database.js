const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

// ==========================================
// 20 大标准一级分类定义
// ==========================================
const PRIMARY_CATEGORY_CODES = [
  "health",      // 健康与身体
  "diet",        // 饮食与营养
  "oral",        // 口腔
  "sleep",       // 睡眠
  "exercise",    // 运动
  "medical",     // 医疗与就医
  "medication",  // 用药
  "home_safety", // 家庭安全
  "kitchen",     // 食品与厨房
  "living",      // 居住
  "traffic",     // 交通
  "money",       // 金钱
  "legal",       // 法律与权益
  "digital",     // 网络与数字生活
  "work",        // 工作
  "family",      // 家庭与关系
  "fertility",   // 性与生育
  "travel",      // 出行与旅行
  "shopping",    // 消费与购物
  "social",      // 社会生活
];

function refineDomain(title, tags, defaultDomain) {
  const text = `${title} ${(tags || []).join(" ")}`.toLowerCase();

  // 优先细分特定领域
  if (/牙齿|牙刷|洗牙|牙线|龋齿|蛀牙|智齿|牙膏|口腔/.test(text)) return "oral";
  if (/睡眠|失眠|睡着|打鼾|浅睡|深度睡眠|褪黑素|昼夜节律/.test(text)) return "sleep";
  if (/运动|有氧|力量训练|肌肉|跑步|拉伸|热身|步数|久坐/.test(text)) return "exercise";
  if (/感冒药|退烧药|阿司匹林|布洛芬|对乙酰氨基酚|抗生素|头孢|药片|处方药|吃药|用药|药房|药效/.test(text)) return "medication";
  if (/急救|120|心肺复苏|海姆立克|挂号|就诊|住院|门诊|医保|医院|病历|医生|体检|慢病/.test(text)) return "medical";
  if (/食品安全|菜刀|砧板|冰箱|微波炉|洗洁精|油烟机|洗碗机|厨具|厨房|烹饪|油温/.test(text)) return "kitchen";
  if (/营养|膳食|卡路里|蛋白质|维生素|钠盐|糖分|反式脂肪|喝水|控糖|减盐/.test(text)) return "diet";
  if (/安全带|头盔|高速公路|疲劳驾驶|变道|红绿灯|刹车|追尾|行车记录仪|斑马线|行人/.test(text)) return "traffic";
  if (/烟雾报警|灭火器|燃气泄漏|插座|漏电|防跌倒|防滑|火灾|逃生|烫伤/.test(text)) return "home_safety";
  if (/租房|房东|中介|押金|退租|验房|买房|公积金|装修|甲醛|通风|物业/.test(text)) return "living";
  if (/记账|社保|五险一金|理财|基金|股票|借贷|征信|信用卡|利息|避坑/.test(text)) return "money";
  if (/合同|借条|诉讼|起诉|仲裁|侵权|诈骗|帮信罪|刑事|民法典|律师|权益|违法/.test(text)) return "legal";
  if (/密码|双重认证|2fa|钓鱼|网络安全|开源|隐私|备份|域名|服务器|建站|数据泄露/.test(text)) return "digital";
  if (/职场|离职|试用期|年假|加班|工伤|竞业协议|劳动合同|求职|面试/.test(text)) return "work";
  if (/结婚|彩礼|婚前财产|父母|老人|养老|育儿|学龄|辅导班|家庭/.test(text)) return "family";
  if (/怀孕|产检|叶酸|新生儿|避孕|生育|生殖|哺乳|产假/.test(text)) return "fertility";
  if (/旅行|出国|签证|护照|海关|机票|行李|境外|留学/.test(text)) return "travel";
  if (/网购|退货|三包|假货|差评|保修|退款|消费主义|比价|折扣/.test(text)) return "shopping";
  if (/心理|情绪|焦虑|抑郁|丧亲|创伤|减压|朋友|人际|沟通|交往/.test(text)) return "social";

  return defaultDomain;
}

// 1. 高性价比人生指南 34 章节基础配置
const SECTION_CONFIG = {
  sec1: { domain: "traffic", topic: "意外防护与重大风险防范", subtitle: "不要早死" },
  sec2: { domain: "health", topic: "生活习惯与慢性病防范", subtitle: "不要慢慢死" },
  sec3: { domain: "sleep", topic: "精力管理与减负", subtitle: "不要浪费精力" },
  sec4: { domain: "work", topic: "效率与专注", subtitle: "不要浪费时间" },
  sec5: { domain: "money", topic: "个人财务与消费避坑", subtitle: "不要浪费钱" },
  sec6: { domain: "shopping", topic: "反面清单与伪科学", subtitle: "反面清单" },
  sec7: { domain: "money", topic: "低谷期生存与社保", subtitle: "没钱的时候怎么活" },
  sec8: { domain: "legal", topic: "法律常识与财产保护", subtitle: "法律与财产安全" },
  sec9: { domain: "legal", topic: "刑事民事红线", subtitle: "法律红线" },
  sec10: { domain: "family", topic: "婚恋经济学与权益", subtitle: "恋爱与结婚" },
  sec11: { domain: "digital", topic: "技术人红线与网络安全", subtitle: "技术人红线" },
  sec12: { domain: "work", topic: "商业与创业风控", subtitle: "创业与做生意" },
  sec13: { domain: "medical", topic: "急症急救与第一响应", subtitle: "紧急情况" },
  sec14: { domain: "digital", topic: "账号、隐私与数字资产", subtitle: "账号与信息安全" },
  sec15: { domain: "living", topic: "租房买房与居住权益", subtitle: "租房与买房" },
  sec16: { domain: "medical", topic: "慢病管理与规范治疗", subtitle: "慢性病生活" },
  sec17: { domain: "family", topic: "养老照护与适老安全", subtitle: "家里有老人" },
  sec18: { domain: "family", topic: "育儿财务与规划", subtitle: "养孩子" },
  sec19: { domain: "work", topic: "职场权益与工伤保障", subtitle: "在职与离职" },
  sec20: { domain: "fertility", topic: "新生儿护理与喂养", subtitle: "新生儿照料" },
  sec21: { domain: "travel", topic: "出境与跨国旅行安全", subtitle: "境外安全" },
  sec22: { domain: "social", topic: "健康放松与心理减压", subtitle: "放松与减压" },
  sec23: { domain: "work", topic: "高回报技能学习", subtitle: "学什么技能" },
  sec24: { domain: "medical", topic: "就医流程与医疗开销优化", subtitle: "看病指南" },
  sec25: { domain: "legal", topic: "身后事手续与善后", subtitle: "善后事宜" },
  sec26: { domain: "digital", topic: "建站、备案与合规", subtitle: "平台搭建与合规" },
  sec27: { domain: "fertility", topic: "孕产保健与生育登记", subtitle: "怀孕和生产" },
  sec28: { domain: "health", topic: "审美陷阱与身体健康", subtitle: "外形与身体" },
  sec29: { domain: "social", topic: "心理创伤与危机干预", subtitle: "重大打击应对" },
  sec30: { domain: "family", topic: "学龄儿童身心健康", subtitle: "上学后的孩子" },
  sec31: { domain: "social", topic: "青年路径选择与职业发展", subtitle: "成年后选择" },
  sec32: { domain: "travel", topic: "留学签证、身份与认证", subtitle: "出国留学" },
  sec33: { domain: "social", topic: "伤残康复、保障与无障碍", subtitle: "残疾与康复" },
  sec34: { domain: "medication", topic: "家庭常备药与安全用药", subtitle: "家庭常备药" },
};

function parseArchiveGuide(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf-8");
  const result = { concepts: [], claims: [], cards: [], sources: [] };

  const secRegex = /<section id="(sec\d+)">[\s\S]*?<div class="sec-h">[\s\S]*?<h2>(.*?)<\/h2>[\s\S]*?<span class="meta">([^<]*)<\/span>[\s\S]*?<\/div>([\s\S]*?)(?=<section id="sec\d+"|<\/main>)/g;
  let secMatch;

  while ((secMatch = secRegex.exec(html)) !== null) {
    const secId = secMatch[1];
    const secNum = parseInt(secId.replace("sec", ""), 10);
    const chapterTitle = secMatch[2].trim();
    const secConfig = SECTION_CONFIG[secId] || { domain: "health", topic: "生活常识", subtitle: "日常须知" };
    const secContent = secMatch[4];

    const cardMatches = [...secContent.matchAll(/<article class="card" id="([^"]+)"([^>]*)>([\s\S]*?)<\/article>/g)];

    for (const cm of cardMatches) {
      const rawId = cm[1];
      const cardAttrs = cm[2];
      const cardHtml = cm[3];

      const gMatch = cardAttrs.match(/data-grade="([^"]+)"/);
      const rawGrade = gMatch ? gMatch[1] : "B";
      const rMatch = cardAttrs.match(/data-ratio="([^"]+)"/);
      const ratio = rMatch ? rMatch[1] : "高";

      let grade = rawGrade;
      if (rawGrade === "A" && ratio === "极高") grade = "A+";

      const h3Match = cardHtml.match(/<h3>(.*?)<\/h3>/);
      const title = h3Match ? h3Match[1].replace(/<[^>]+>/g, "").trim() : "";
      if (!title) continue;

      const chipsMatch = cardHtml.match(/<div class="chips">(.*?)<\/div>/s);
      const tags = [chapterTitle];
      if (chipsMatch) {
        const chipTexts = (chipsMatch[1].match(/<span[^>]*>(.*?)<\/span>/g) || []).map((s) =>
          s.replace(/<[^>]+>/g, "").trim()
        );
        tags.push(...chipTexts);
      }

      const plainMatch = cardHtml.match(/<p class="plain">(.*?)<\/p>/s);
      const plain = plainMatch ? plainMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      const oneLine = plain || title;

      const extractField = (fieldName) => {
        const regex = new RegExp(`<b>${fieldName}<\\/b>\\s*<div>(.*?)<\\/div>`, "s");
        const m = cardHtml.match(regex);
        return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
      };

      const cost = extractField("成本");
      const benefit = extractField("收益");
      const note = extractField("备注");

      const srcMatch = cardHtml.match(/<div class="sbody">(.*?)<\/div>/s);
      const sourceText = srcMatch ? srcMatch[1].replace(/<[^>]+>/g, "").trim() : "";

      const cardId = `card_archive_${rawId}`;
      const conceptId = `concept_archive_${rawId}`;
      const claimId = `claim_archive_${rawId}`;
      const sourceId = `src_archive_${rawId}`;

      const domain = refineDomain(title, tags, secConfig.domain);
      const timestamp = "2026-10-08T00:00:00.000Z";

      if (sourceText) {
        result.sources.push({
          id: sourceId,
          organization: sourceText.split(/[(:;—]/)[0]?.trim() || "权威科学来源",
          title: sourceText.substring(0, 200),
          url: (sourceText.match(/https?:\/\/[^\s<;]+/)?.[0]) || "https://cdyforever.github.io/how-to-live-better/",
          sourceType: "guideline",
          retrievedAt: "2026-10-08",
          status: "active",
          citation: sourceText,
        });
      }

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

      result.cards.push({
        id: cardId,
        conceptId: conceptId,
        primaryClaimId: claimId,
        type: secNum === 13 ? "emergency" : "action",
        module: "life_archive",
        title: title,
        subtitle: `${secConfig.subtitle} · ${chapterTitle}`,
        oneLine: oneLine,
        body: note || benefit || oneLine,
        cost: cost || "依具体情形而定",
        benefit: benefit || oneLine,
        notes: note || undefined,
        ratio: ratio || "极高",
        grade: grade || "A",
        difficulty: 1,
        evidenceLevel: grade === "A+" || grade === "A" ? "very_strong" : "strong",
        riskLevel: secNum === 13 ? "high" : "low",
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

// 2. 扫清生活盲区 150 条 (life_blindspots_150.json)
function parseBlindspots150(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const result = { concepts: [], claims: [], cards: [], sources: [] };

  const sourceIndex = new Map();
  (data.source_index || []).forEach((s) => sourceIndex.set(s.id, s));

  const cardsList = data.cards || [];
  const timestamp = "2026-10-08T00:00:00.000Z";

  for (const c of cardsList) {
    const cardId = `card_blindspot_${c.id}`;
    const conceptId = `concept_blindspot_${c.concept_id || c.id}`;
    const claimId = `claim_blindspot_${c.id}`;

    const cardSources = (c.source_ids || []).map((sid) => sourceIndex.get(sid)).filter(Boolean);
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

    const cost = "阅读约 30 秒。认知纠偏零金钱成本，无需额外消费。";
    const benefit = remember || reality || oneLine;
    const noteParts = [];
    if (why) noteParts.push(why);
    if (reality && !noteParts.includes(reality)) noteParts.push(`实际上：${reality}`);
    const notes = noteParts.join("\n\n");

    const rawB150Map = {
      home: "home_safety",
      technology: "digital",
      consumer: "shopping",
      transport: "traffic",
      science: "kitchen",
      food: "kitchen",
      safety: "home_safety",
      health: "health",
      money: "money",
      legal: "legal",
    };
    const mappedB150Domain = rawB150Map[c.domain] || "living";
    const domain = refineDomain(title, c.tags, mappedB150Domain);
    const tags = ["生活盲区", "A 级", "性价比 极高", ...(c.tags || [])];

    result.concepts.push({
      id: conceptId,
      name: title,
      canonicalQuestion: title.includes("？") || title.includes("?") ? title : `为什么${title}？`,
      canonicalSummary: oneLine,
      domain: domain,
      topic: tags[3] || "生活常识",
      status: "published",
      difficulty: 1,
      origin: "imported",
      qualityScore: 92,
      tags: tags,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

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

    result.cards.push({
      id: cardId,
      conceptId: conceptId,
      primaryClaimId: claimId,
      type: "blindspot",
      module: "blindspot",
      title: title,
      subtitle: `${domain} · 生活盲区`,
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

// 3. 扫清生活盲区 1000 条 (life_blindspots_1000_new.json)
const B1000_CATEGORY_MAP = {
  "人体结构与生理": "health",
  "感官与日常护理": "health",
  "心理与认知": "social",
  "饮食文化与食品史": "diet",
  "烹饪与食品科学": "kitchen",
  "医疗检查与医疗体系": "medical",
  "工具与机械原理": "home_safety",
  "居住与建筑材料": "living",
  "城市基础设施": "living",
  "环境与农业": "living",
  "交通与物流": "traffic",
  "金融与经济": "money",
  "全球贸易与经济": "money",
  "法律与公民常识": "legal",
  "数字生活与媒体": "digital",
  "统计与数据素养": "digital",
  "工作与劳动": "work",
  "动物与宠物": "family",
  "性与生殖健康": "fertility",
  "地理、地球与天气": "travel",
  "消费品与制造": "shopping",
  "衣物与纺织": "shopping",
  "历史与日常发明": "social",
  "艺术、音乐与文化识读": "social",
  "语言、符号与日常标准": "social",
};

function parseBlindspots1000(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const result = { concepts: [], claims: [], cards: [], sources: [] };

  // Sources
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

  // Concepts
  (data.concepts || []).forEach((c) => {
    const rawCat = c.domain || c.category || "居住与建筑材料";
    const mappedDomain = B1000_CATEGORY_MAP[rawCat] || "living";
    const domain = refineDomain(c.name, c.tags, mappedDomain);

    result.concepts.push({
      id: `concept_b1000_${c.id}`,
      name: c.name,
      canonicalQuestion: c.canonical_question || `为什么${c.name}？`,
      canonicalSummary: c.canonical_summary || c.name,
      domain: domain,
      topic: c.topic || rawCat,
      status: "published",
      difficulty: 1,
      origin: "imported",
      qualityScore: 90,
      tags: ["生活盲区", rawCat, ...(c.tags || [])],
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    });
  });

  // Claims
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

  // Cards
  (data.cards || []).forEach((cd) => {
    const cardId = `card_b1000_${cd.id}`;
    const conceptId = `concept_b1000_${cd.concept_id}`;
    const claimId = `claim_b1000_${cd.primary_claim_id}`;

    const rawCat = cd.domain || "居住与建筑材料";
    const mappedDomain = B1000_CATEGORY_MAP[rawCat] || "living";
    const domain = refineDomain(cd.title, cd.tags, mappedDomain);

    const tags = ["生活盲区", "A 级", "性价比 极高", rawCat, ...(cd.tags || [])];

    result.cards.push({
      id: cardId,
      conceptId: conceptId,
      primaryClaimId: claimId,
      type: "blindspot",
      module: "blindspot",
      title: cd.title,
      subtitle: `${rawCat} · 机制解读`,
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

async function main() {
  console.log("=== 开始完整重新构建知识库数据并写入 SQLite ===");

  const pArchive = path.resolve("data/how-to-live-better.html");
  const p150 = path.resolve("data/life_blindspots_150_new_bundle/life_blindspots_150.json");
  const p1000 = path.resolve("data/life_blindspots_1000_new_bundle/life_blindspots_1000_new.json");

  console.log("1. 解析《高性价比人生指南 · 全书 34 节》...");
  const archive = parseArchiveGuide(pArchive);
  console.log(`   档案卡片: ${archive.cards.length}, 概念: ${archive.concepts.length}`);

  console.log("2. 解析《扫清生活盲区 150 条》...");
  const b150 = parseBlindspots150(p150);
  console.log(`   150 盲区卡片: ${b150.cards.length}, 概念: ${b150.concepts.length}`);

  console.log("3. 解析《扫清生活盲区 1000 条》...");
  const b1000 = parseBlindspots1000(p1000);
  console.log(`   1000 盲区卡片: ${b1000.cards.length}, 概念: ${b1000.concepts.length}`);

  const allConcepts = [...archive.concepts, ...b150.concepts, ...b1000.concepts];
  const allClaims = [...archive.claims, ...b150.claims, ...b1000.claims];
  const allCards = [...archive.cards, ...b150.cards, ...b1000.cards];
  const allSources = [...archive.sources, ...b150.sources, ...b1000.sources];

  console.log("\n=== 20 大一级分类分布检查 ===");
  const domainCounts = {};
  PRIMARY_CATEGORY_CODES.forEach((c) => (domainCounts[c] = 0));
  allConcepts.forEach((c) => {
    domainCounts[c.domain] = (domainCounts[c.domain] || 0) + 1;
  });
  console.table(domainCounts);

  // 写入 SQLite
  const dbPath = path.resolve("data/knowledge.db");
  const client = createClient({ url: `file:${dbPath.replace(/\\/g, "/")}` });

  console.log("\n开始写入 SQLite 数据库...");
  await client.execute("PRAGMA journal_mode = WAL;");
  await client.execute("PRAGMA busy_timeout = 10000;");
  await client.execute("PRAGMA synchronous = NORMAL;");

  await client.execute("DELETE FROM cards;");
  await client.execute("DELETE FROM claims;");
  await client.execute("DELETE FROM concepts;");
  await client.execute("DELETE FROM sources;");

  console.log(`写入 Concepts (${allConcepts.length})...`);
  for (const c of allConcepts) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO concepts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        c.id, c.name, c.canonicalQuestion, c.canonicalSummary, c.domain,
        c.topic || null, c.parentConceptId || null, c.status, c.difficulty,
        c.origin, c.qualityScore || 90, JSON.stringify(c.tags || []),
        c.verifiedAt || null, c.nextReviewAt || null, c.createdAt, c.updatedAt
      ],
    });
  }

  console.log(`写入 Sources (${allSources.length})...`);
  for (const s of allSources) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO sources VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        s.id, s.organization || null, s.title, s.author || null, s.url,
        s.sourceType, s.publicationDate || null, s.region || null,
        s.language || null, s.retrievedAt || "2026-10-08", s.status,
        s.citation || null, new Date().toISOString()
      ],
    });
  }

  console.log(`写入 Claims (${allClaims.length})...`);
  for (const cl of allClaims) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO claims VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        cl.id, cl.conceptId, cl.claimType, cl.claimText, cl.canonical ? 1 : 0,
        cl.confidence ?? 1.0, cl.evidenceLevel, cl.status, cl.version || 1,
        JSON.stringify(cl.sourceIds || []), cl.createdAt, cl.updatedAt
      ],
    });
  }

  console.log(`写入 Cards (${allCards.length})...`);
  for (const cd of allCards) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        cd.id, cd.conceptId, cd.primaryClaimId || null, cd.type, cd.module,
        cd.title, cd.subtitle || null, cd.oneLine, cd.body || null,
        cd.misconception || null, cd.reality || null, cd.why || null,
        JSON.stringify(cd.actionSteps || []), cd.cost || null, cd.benefit || null,
        cd.notes || null, cd.ratio || null, cd.grade || "A", cd.evidenceLevel || "strong",
        cd.riskLevel || "low", cd.angle || "action", cd.difficulty || 1,
        JSON.stringify(cd.region || []), JSON.stringify(cd.audience || []),
        JSON.stringify(cd.scenarios || []), JSON.stringify(cd.tags || []),
        cd.status, cd.publishedAt || null, cd.updatedAt, cd.verifiedAt || null
      ],
    });
  }

  console.log("=== 数据写入 SQLite 成功！===");
}

main().catch(console.error);
