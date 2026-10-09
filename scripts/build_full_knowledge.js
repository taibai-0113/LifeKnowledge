const fs = require('fs');
const path = require('path');

// 1. 读取高性价比人生指南 HTML
const htmlPath = path.resolve('e:/LifeKnowledge/data/how-to-live-better.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// 2. 读取扫清生活盲区 JSON
const blindspotsPath = path.resolve('e:/LifeKnowledge/data/life_blindspots_150.json');
const blindspotsJson = JSON.parse(fs.readFileSync(blindspotsPath, 'utf-8'));

console.log('--- Starting Knowledge Base Expansion ---');

const SECTION_CONFIG = {
  sec1: { domain: 'home_safety', topic: '意外防护与重大风险防范', subtitle: '不要早死' },
  sec2: { domain: 'health', topic: '生活习惯与慢性病防范', subtitle: '不要慢慢死' },
  sec3: { domain: 'health', topic: '精力管理与减负', subtitle: '不要浪费精力' },
  sec4: { domain: 'work', topic: '效率与专注', subtitle: '不要浪费时间' },
  sec5: { domain: 'money', topic: '个人财务与消费避坑', subtitle: '不要浪费钱' },
  sec6: { domain: 'health', topic: '反面清单与伪科学', subtitle: '反面清单' },
  sec7: { domain: 'money', topic: '低谷期生存与社保', subtitle: '没钱的时候怎么活' },
  sec8: { domain: 'legal', topic: '法律常识与财产保护', subtitle: '法律与财产安全' },
  sec9: { domain: 'legal', topic: '刑事民事红线', subtitle: '法律红线' },
  sec10: { domain: 'family', topic: '婚恋经济学与权益', subtitle: '恋爱与结婚' },
  sec11: { domain: 'digital', topic: '技术安全与合规', subtitle: '技术人红线' },
  sec12: { domain: 'work', topic: '商业与创业风控', subtitle: '创业与做生意' },
  sec13: { domain: 'medical', topic: '急症急救与第一响应', subtitle: '紧急情况' },
  sec14: { domain: 'digital', topic: '账号、隐私与数字资产', subtitle: '账号与信息安全' },
  sec15: { domain: 'living', topic: '租房买房与居住权益', subtitle: '租房与买房' },
  sec16: { domain: 'medical', topic: '慢病管理与规范治疗', subtitle: '慢性病生活' },
  sec17: { domain: 'family', topic: '养老照护与适老安全', subtitle: '家里有老人' },
  sec18: { domain: 'family', topic: '育儿财务与规划', subtitle: '养孩子' },
  sec19: { domain: 'work', topic: '职场权益与工伤保障', subtitle: '在职与离职' },
  sec20: { domain: 'family', topic: '新生儿护理与喂养', subtitle: '新生儿照料' },
  sec21: { domain: 'travel', topic: '出境与跨国旅行安全', subtitle: '境外安全' },
  sec22: { domain: 'social', topic: '健康放松与心理减压', subtitle: '放松与减压' },
  sec23: { domain: 'work', topic: '高回报技能学习', subtitle: '学什么技能' },
  sec24: { domain: 'medical', topic: '就医流程与医疗开销优化', subtitle: '看病指南' },
  sec25: { domain: 'social', topic: '身后事手续与善后', subtitle: '善后事宜' },
  sec26: { domain: 'digital', topic: '建站、备案与合规', subtitle: '平台搭建与合规' },
  sec27: { domain: 'fertility', topic: '孕产保健与生育登记', subtitle: '怀孕和生产' },
  sec28: { domain: 'health', topic: '审美陷阱与身体健康', subtitle: '外形与身体' },
  sec29: { domain: 'social', topic: '心理创伤与危机干预', subtitle: '重大打击应对' },
  sec30: { domain: 'family', topic: '学龄儿童身心健康', subtitle: '上学后的孩子' },
  sec31: { domain: 'social', topic: '青年路径选择与入伍职业', subtitle: '成年后选择' },
  sec32: { domain: 'travel', topic: '留学签证、身份与认证', subtitle: '出国留学' },
  sec33: { domain: 'social', topic: '伤残康复、保障与无障碍', subtitle: '残疾与康复' },
  sec34: { domain: 'medication', topic: '家庭常备药与安全用药', subtitle: '家庭常备药' },
};

function refineDomain(title, defaultDomain) {
  const t = title.toLowerCase();
  if (t.includes('刷牙') || t.includes('牙线') || t.includes('牙齿') || t.includes('洗牙') || t.includes('龋齿')) return 'oral';
  if (t.includes('睡眠') || t.includes('失眠') || t.includes('打鼾') || t.includes('睡前')) return 'sleep';
  if (t.includes('吃') || t.includes('喝') || t.includes('盐') || t.includes('糖') || t.includes('脂肪') || t.includes('蛋白质') || t.includes('膳食')) return 'diet';
  if (t.includes('药') || t.includes('阿司匹林') || t.includes('布洛芬') || t.includes('抗生素') || t.includes('对乙酰氨基酚')) return 'medication';
  if (t.includes('车') || t.includes('安全带') || t.includes('头盔') || t.includes('驾照') || t.includes('高速公路')) return 'traffic';
  if (t.includes('火') || t.includes('烟雾报警') || t.includes('插座') || t.includes('燃气') || t.includes('灭火')) return 'home_safety';
  if (t.includes('房') || t.includes('租房') || t.includes('退租') || t.includes('押金') || t.includes('中介')) return 'living';
  if (t.includes('合同') || t.includes('劳动法') || t.includes('侵权') || t.includes('诈骗') || t.includes('仲裁')) return 'legal';
  if (t.includes('密码') || t.includes('双重认证') || t.includes('账号') || t.includes('网络') || t.includes('数据')) return 'digital';
  return defaultDomain;
}

// ==========================================
// Part A: Parse 670 cards from how-to-live-better
// ==========================================
const archiveCards = [];
const archiveConcepts = [];
const archiveClaims = [];
const archiveSourcesMap = new Map();

const secRegex = /<section id="(sec\d+)">[\s\S]*?<div class="sec-h">[\s\S]*?<h2>(.*?)<\/h2>[\s\S]*?<span class="meta">([^<]*)<\/span>[\s\S]*?<\/div>([\s\S]*?)(?=<section id="sec\d+"|<\/main>)/g;

let secMatch;
let parsedArchiveCardCount = 0;

while ((secMatch = secRegex.exec(html)) !== null) {
  const secId = secMatch[1];
  const secNum = parseInt(secId.replace('sec', ''), 10);
  const secConfig = SECTION_CONFIG[secId] || { domain: 'health', topic: '综合常识', subtitle: '日常须知' };
  const secContent = secMatch[4];

  const cardMatches = [...secContent.matchAll(/<article class="card" id="([^"]+)"([^>]*)>([\s\S]*?)<\/article>/g)];

  for (const cm of cardMatches) {
    const rawId = cm[1]; // e.g. s1-1
    const cardAttrs = cm[2];
    const cardHtml = cm[3];

    // Grade and ratio
    const gMatch = cardAttrs.match(/data-grade="([^"]+)"/);
    const rawGrade = gMatch ? gMatch[1] : 'B';
    const rMatch = cardAttrs.match(/data-ratio="([^"]+)"/);
    const ratio = rMatch ? rMatch[1] : '';

    let grade = rawGrade;
    if (rawGrade === 'A' && ratio === '极高') {
      grade = 'A+';
    }

    // Title
    const titleMatch = cardHtml.match(/<h3>(.*?)<\/h3>/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '生活常识建议';

    // Plain text (说人话)
    const plainMatch = cardHtml.match(/<p class="plain">([\s\S]*?)<\/p>/);
    const oneLine = plainMatch ? plainMatch[1].replace(/<[^>]+>/g, '').trim() : title;

    // Chips tags
    const tagsMatches = [...cardHtml.matchAll(/<span class="tag">([^<]+)<\/span>/g)].map(m => m[1].trim());
    const tags = Array.from(new Set([secConfig.subtitle, ...tagsMatches]));

    // Fields: 成本, 收益, 备注, 怎么做
    let cost = '';
    let benefit = '';
    let note = '';
    let how = '';

    const fieldMatches = [...cardHtml.matchAll(/<div class="f(?:\s+note)?"><b>(.*?)<\/b><div>([\s\S]*?)<\/div><\/div>/g)];
    for (const fm of fieldMatches) {
      const fLabel = fm[1].trim();
      const fVal = fm[2].replace(/<[^>]+>/g, '').trim();
      if (fLabel.includes('成本')) cost = fVal;
      else if (fLabel.includes('收益')) benefit = fVal;
      else if (fLabel.includes('备注')) note = fVal;
      else if (fLabel.includes('怎么做')) how = fVal;
    }

    let actionSteps = [];
    if (how) {
      actionSteps = how.split(/[；;\n]/).map(s => s.trim()).filter(Boolean);
    }
    if (actionSteps.length === 0) {
      actionSteps = [oneLine];
    }

    // Sources
    const srcMatches = [...cardHtml.matchAll(/<details class="src">[\s\S]*?<div class="sbody">([\s\S]*?)<\/div><\/details>/g)];
    const cardSourceIds = [];
    if (srcMatches.length > 0) {
      const srcText = srcMatches[0][1].replace(/<[^>]+>/g, '').trim();
      const srcUrlMatches = [...srcMatches[0][1].matchAll(/<a href="([^"]+)"/g)].map(m => m[1]);
      const srcId = `src_book_${rawId.replace('-', '_')}`;
      archiveSourcesMap.set(srcId, {
        id: srcId,
        title: title,
        organization: srcText.split(/[(:;]/)[0]?.trim() || '权威科学文献 / 官方指引',
        url: srcUrlMatches[0] || 'https://cdyforever.github.io/how-to-live-better/',
        sourceType: 'guideline',
        retrievedAt: '2026-10-08',
        status: 'active',
        citation: srcText.substring(0, 300),
      });
      cardSourceIds.push(srcId);
    }

    const domain = refineDomain(title, secConfig.domain);
    const conceptId = `concept_archive_${rawId.replace('-', '_')}`;
    const cardId = `card_archive_${rawId.replace('-', '_')}`;
    const claimId = `claim_archive_${rawId.replace('-', '_')}`;

    // Risk level estimation
    let riskLevel = 'medium';
    if (secNum === 1 || secNum === 13 || title.includes('死亡') || title.includes('致死') || title.includes('触电') || title.includes('火灾')) {
      riskLevel = 'critical';
    } else if (grade === 'A+' || grade === 'A') {
      riskLevel = 'high';
    } else if (grade === 'C') {
      riskLevel = 'low';
    }

    // Evidence level
    let evidenceLevel = 'strong';
    if (grade === 'A+' || grade === 'A') evidenceLevel = 'very_strong';
    else if (grade === 'C') evidenceLevel = 'moderate';

    // 1. Concept
    const canonicalQ = title.includes('？') || title.includes('?')
      ? title
      : (title.length <= 16 ? `为什么${title}？` : title);

    archiveConcepts.push({
      id: conceptId,
      name: title,
      canonicalQuestion: canonicalQ,
      canonicalSummary: oneLine,
      domain: domain,
      topic: secConfig.topic,
      status: 'published',
      difficulty: 1,
      origin: 'reference_book',
      qualityScore: grade === 'A+' ? 98 : grade === 'A' ? 92 : 85,
      createdAt: '2026-10-08T00:00:00Z',
      updatedAt: '2026-10-08T00:00:00Z',
      tags: tags,
    });

    // 2. Claim
    archiveClaims.push({
      id: claimId,
      conceptId: conceptId,
      claimType: 'recommendation',
      claimText: benefit || oneLine,
      canonical: true,
      evidenceLevel: evidenceLevel,
      status: 'supported',
      version: 1,
      sourceIds: cardSourceIds,
      createdAt: '2026-10-08T00:00:00Z',
      updatedAt: '2026-10-08T00:00:00Z',
    });

    // 3. Card
    archiveCards.push({
      id: cardId,
      conceptId: conceptId,
      primaryClaimId: claimId,
      type: secNum === 13 ? 'emergency' : 'action',
      module: 'life_archive',
      title: title,
      subtitle: `${secConfig.subtitle} · ${secConfig.topic}`,
      oneLine: oneLine,
      body: note || benefit || oneLine,
      cost: cost || '依具体情形而定',
      benefit: benefit || oneLine,
      actionSteps: actionSteps,
      grade: grade,
      difficulty: 1,
      evidenceLevel: evidenceLevel,
      riskLevel: riskLevel,
      angle: 'action',
      status: 'published',
      tags: tags,
      publishedAt: '2026-10-08T00:00:00Z',
      updatedAt: '2026-10-08T00:00:00Z',
    });

    parsedArchiveCardCount++;
  }
}

console.log(`Parsed ${parsedArchiveCardCount} archive cards from how-to-live-better.html`);
console.log(`Collected ${archiveSourcesMap.size} unique sources from book`);

// ==========================================
// Part B: Parse 170 cards from life_blindspots_150.json
// ==========================================
const blindspotCards = [];
const blindspotConcepts = [];
const blindspotClaims = [];
const blindspotSourcesMap = new Map();
const blindspotRelations = [];

// Index sources from JSON
(blindspotsJson.source_index || []).forEach(src => {
  blindspotSourcesMap.set(src.id, {
    id: src.id,
    organization: src.name.split('—')[0]?.trim() || src.name,
    title: src.name,
    url: src.url || 'https://howeverythingworks.org',
    sourceType: src.type === 'official' ? 'official' : 'peer_reviewed',
    retrievedAt: '2026-10-08',
    status: 'active',
    citation: src.note || src.name,
  });
});

const BLINDSPOT_DOMAIN_MAP = {
  food: 'kitchen',
  health: 'health',
  home: 'home_safety',
  technology: 'digital',
  consumer: 'shopping',
  money: 'money',
  transport: 'traffic',
  science: 'kitchen',
};

(blindspotsJson.cards || []).forEach((c, idx) => {
  const conceptId = `concept_blindspot_${c.id}`;
  const cardId = `card_blindspot_${c.id}`;
  const claimId = `claim_blindspot_${c.id}`;
  const domain = BLINDSPOT_DOMAIN_MAP[c.domain] || 'health';

  blindspotConcepts.push({
    id: conceptId,
    name: c.title,
    canonicalQuestion: c.title.includes('？') || c.title.includes('?') ? c.title : `为什么说${c.title}？`,
    canonicalSummary: c.one_line,
    domain: domain,
    topic: c.tags ? c.tags[0] : '生活盲区认知',
    status: 'published',
    difficulty: 2,
    origin: 'editorial',
    qualityScore: 90,
    tags: c.tags || [],
    createdAt: '2026-10-08T00:00:00Z',
    updatedAt: '2026-10-08T00:00:00Z',
  });

  blindspotClaims.push({
    id: claimId,
    conceptId: conceptId,
    claimType: 'fact',
    claimText: c.reality || c.one_line,
    canonical: true,
    evidenceLevel: c.evidence_level === 'strong' ? 'strong' : 'very_strong',
    status: 'supported',
    version: 1,
    sourceIds: c.source_ids || [],
    createdAt: '2026-10-08T00:00:00Z',
    updatedAt: '2026-10-08T00:00:00Z',
  });

  blindspotCards.push({
    id: cardId,
    conceptId: conceptId,
    primaryClaimId: claimId,
    type: 'blindspot',
    module: 'blindspot',
    title: c.title,
    subtitle: `${c.tags ? c.tags.join(' · ') : '日常盲区'}`,
    oneLine: c.one_line,
    misconception: c.you_might_think,
    reality: c.reality,
    why: c.why,
    difficulty: 2,
    evidenceLevel: c.evidence_level === 'strong' ? 'strong' : 'very_strong',
    riskLevel: c.risk_level || 'medium',
    angle: c.angle || 'misconception',
    status: 'published',
    tags: c.tags || [],
    publishedAt: '2026-10-08T00:00:00Z',
    updatedAt: '2026-10-08T00:00:00Z',
  });

  // Relations
  if (Array.isArray(c.related_concept_ids)) {
    c.related_concept_ids.forEach((relTargetId, relIdx) => {
      blindspotRelations.push({
        id: `rel_bs_${c.id}_${relIdx}`,
        sourceConceptId: conceptId,
        relationType: 'related_to',
        targetConceptId: `concept_blindspot_${relTargetId}`,
        confidence: 0.7,
        createdAt: '2026-10-08T00:00:00Z',
      });
    });
  }
});

console.log(`Parsed ${blindspotCards.length} blindspot cards from life_blindspots_150.json`);

// ==========================================
// Part C: Write modular data files
// ==========================================
const dataDir = path.resolve('e:/LifeKnowledge/src/data');

// 1. archive-expanded.data.ts
const archiveDataCode = `// Generated from 《高性价比人生指南 · 全书 34 节》 (670 条行动建议)
import { KnowledgeCard, KnowledgeConcept, KnowledgeClaim, KnowledgeSource } from "../types/knowledge";

export const EXPANDED_ARCHIVE_CONCEPTS: KnowledgeConcept[] = ${JSON.stringify(archiveConcepts, null, 2)};

export const EXPANDED_ARCHIVE_CLAIMS: KnowledgeClaim[] = ${JSON.stringify(archiveClaims, null, 2)};

export const EXPANDED_ARCHIVE_CARDS: KnowledgeCard[] = ${JSON.stringify(archiveCards, null, 2)};

export const EXPANDED_ARCHIVE_SOURCES: KnowledgeSource[] = ${JSON.stringify(Array.from(archiveSourcesMap.values()), null, 2)};
`;

fs.writeFileSync(path.join(dataDir, 'archive-expanded.data.ts'), archiveDataCode, 'utf-8');
console.log('Saved src/data/archive-expanded.data.ts');

// 2. blindspots-expanded.data.ts
const blindspotsDataCode = `// Generated from life_blindspots_150.json (170 条扫清生活盲区)
import { KnowledgeCard, KnowledgeConcept, KnowledgeClaim, KnowledgeSource, KnowledgeRelation } from "../types/knowledge";

export const EXPANDED_BLINDSPOT_CONCEPTS: KnowledgeConcept[] = ${JSON.stringify(blindspotConcepts, null, 2)};

export const EXPANDED_BLINDSPOT_CLAIMS: KnowledgeClaim[] = ${JSON.stringify(blindspotClaims, null, 2)};

export const EXPANDED_BLINDSPOT_CARDS: KnowledgeCard[] = ${JSON.stringify(blindspotCards, null, 2)};

export const EXPANDED_BLINDSPOT_SOURCES: KnowledgeSource[] = ${JSON.stringify(Array.from(blindspotSourcesMap.values()), null, 2)};

export const EXPANDED_BLINDSPOT_RELATIONS: KnowledgeRelation[] = ${JSON.stringify(blindspotRelations, null, 2)};
`;

fs.writeFileSync(path.join(dataDir, 'blindspots-expanded.data.ts'), blindspotsDataCode, 'utf-8');
console.log('Saved src/data/blindspots-expanded.data.ts');

console.log('--- Summary ---');
console.log(`Archive Cards: ${archiveCards.length}`);
console.log(`Blindspot Cards: ${blindspotCards.length}`);
console.log(`Total New Cards: ${archiveCards.length + blindspotCards.length}`);
console.log('All files generated successfully!');
