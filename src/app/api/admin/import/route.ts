import { NextRequest, NextResponse } from "next/server";
import { knowledgeRepository } from "@/repositories/knowledge.repository";
import {
  KnowledgeCard,
  KnowledgeConcept,
  KnowledgeClaim,
  KnowledgeSource,
  CardModule,
  CardType,
  CardGrade,
} from "@/types/knowledge";

interface ImportItemInput {
  title: string;
  oneLine?: string;
  one_line?: string;
  module?: CardModule | string;
  domain?: string;
  type?: CardType | string;
  grade?: CardGrade | string;
  misconception?: string;
  you_might_think?: string;
  reality?: string;
  why?: string;
  cost?: string;
  benefit?: string;
  remember?: string;
  actionSteps?: string[] | string;
  action_steps?: string[] | string;
  source?: string;
  source_ids?: string[];
  tags?: string[] | string;
}

function parseCSV(text: string): ImportItemInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const sep = headerLine.includes("\t") ? "\t" : ",";

  const splitRow = (row: string): string[] => {
    const results: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === sep && !inQuotes) {
        results.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    results.push(current.trim());
    return results.map((v) => v.replace(/^["']|["']$/g, "").trim());
  };

  const headers = splitRow(headerLine).map((h) => h.toLowerCase());
  const items: ImportItemInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    if (values.length === 0 || !values[0]) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (values[idx] !== undefined) {
        rowObj[h] = values[idx];
      }
    });

    const title = rowObj.title || rowObj["标题"] || values[0];
    if (!title) continue;

    const oneLine =
      rowObj.oneline ||
      rowObj.one_line ||
      rowObj["一句话结论"] ||
      rowObj["一句话"] ||
      rowObj.summary ||
      title;
    const cardModule = (rowObj.module || rowObj["模块"] || "life_archive").toLowerCase();
    const domain = rowObj.domain || rowObj["分类"] || rowObj["领域"] || "health";
    const type = rowObj.type || rowObj["类型"] || (cardModule === "blindspot" ? "blindspot" : "action");
    const grade = (rowObj.grade || rowObj["等级"] || "A") as CardGrade;
    const misconception =
      rowObj.misconception || rowObj.you_might_think || rowObj["误区"] || rowObj["你以为"] || "";
    const reality = rowObj.reality || rowObj["真相"] || rowObj["实际上"] || "";
    const why = rowObj.why || rowObj["解释"] || rowObj["原因"] || "";
    const cost = rowObj.cost || rowObj["成本"] || "";
    const benefit = rowObj.benefit || rowObj.remember || rowObj["收益"] || "";
    const actionStepsRaw =
      rowObj.actionsteps || rowObj.action_steps || rowObj["步骤"] || rowObj["怎么做"] || "";
    const source = rowObj.source || rowObj["信源"] || rowObj["来源"] || "";
    const tagsRaw = rowObj.tags || rowObj["标签"] || "";

    const actionSteps = actionStepsRaw
      ? actionStepsRaw.split(/[;；|]/).map((s) => s.trim()).filter(Boolean)
      : [oneLine];
    const tags = tagsRaw
      ? tagsRaw.split(/[,，;；|]/).map((t) => t.trim()).filter(Boolean)
      : [domain];

    items.push({
      title,
      oneLine,
      module: cardModule.includes("blind") ? "blindspot" : "life_archive",
      domain,
      type: (type as CardType) || (cardModule.includes("blind") ? "blindspot" : "action"),
      grade: ["A+", "A", "B", "C"].includes(grade) ? grade : "A",
      misconception,
      reality,
      why,
      cost,
      benefit,
      actionSteps,
      source,
      tags,
    });
  }

  return items;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { format, content } = body;

    let rawItems: ImportItemInput[] = [];

    if (format === "csv") {
      rawItems = parseCSV(typeof content === "string" ? content : "");
    } else if (format === "json") {
      const parsed = typeof content === "string" ? JSON.parse(content) : content;
      if (Array.isArray(parsed)) {
        rawItems = parsed;
      } else if (parsed && Array.isArray(parsed.items)) {
        rawItems = parsed.items;
      } else if (parsed && Array.isArray(parsed.cards)) {
        rawItems = parsed.cards;
      } else if (parsed && Array.isArray(parsed.data)) {
        rawItems = parsed.data;
      } else if (parsed && typeof parsed === "object") {
        rawItems = [parsed];
      }
    } else {
      const text = String(content).trim();
      if (text.startsWith("[") || text.startsWith("{")) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          rawItems = parsed;
        } else if (parsed && Array.isArray(parsed.items)) {
          rawItems = parsed.items;
        } else if (parsed && Array.isArray(parsed.cards)) {
          rawItems = parsed.cards;
        } else {
          rawItems = [parsed];
        }
      } else {
        rawItems = parseCSV(text);
      }
    }

    if (!rawItems || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "未解析到任何有效知识数据，请检查格式" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    let importedCards = 0;
    let importedConcepts = 0;

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      if (!item.title) continue;

      const randomSuffix = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
      const conceptId = `concept_imported_${randomSuffix}`;
      const cardId = `card_imported_${randomSuffix}`;
      const claimId = `claim_imported_${randomSuffix}`;
      const sourceId = item.source ? `src_imported_${randomSuffix}` : undefined;

      const domain = item.domain || "health";
      const cardModule: CardModule =
        item.module === "blindspot" ||
        item.type === "blindspot" ||
        Boolean(item.misconception || item.you_might_think)
          ? "blindspot"
          : "life_archive";

      const oneLine = item.oneLine || item.one_line || item.title;
      const misconception = item.misconception || item.you_might_think || undefined;
      const reality = item.reality || undefined;
      const why = item.why || undefined;
      const benefit = item.benefit || item.remember || oneLine;
      const cost = item.cost || undefined;

      const tags = Array.isArray(item.tags)
        ? item.tags
        : typeof item.tags === "string"
        ? item.tags.split(/[,，;；]/).map((t) => t.trim()).filter(Boolean)
        : [domain];

      // 1. Source (权威信源)
      if (item.source && sourceId) {
        const createdSource: KnowledgeSource = {
          id: sourceId,
          organization: item.source.split(/[(:;]/)[0]?.trim() || "权威科学来源",
          title: item.source,
          url: "https://example.com/source",
          sourceType: "guideline",
          retrievedAt: timestamp.split("T")[0],
          status: "active",
          citation: item.source,
        };
        await knowledgeRepository.createSource(createdSource);
      }

      // 2. Concept (主概念)
      const newConcept: KnowledgeConcept = {
        id: conceptId,
        name: item.title,
        canonicalQuestion:
          item.title.includes("？") || item.title.includes("?")
            ? item.title
            : `为什么${item.title}？`,
        canonicalSummary: oneLine,
        domain: domain,
        topic: tags[0] || "综合常识",
        status: "published",
        difficulty: 1,
        origin: "imported",
        qualityScore: 90,
        tags: tags,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await knowledgeRepository.createConcept(newConcept);
      importedConcepts++;

      // 3. Claim (主张/事实)
      const newClaim: KnowledgeClaim = {
        id: claimId,
        conceptId: conceptId,
        claimType: cardModule === "blindspot" ? "fact" : "recommendation",
        claimText: reality || benefit || oneLine,
        canonical: true,
        evidenceLevel: "strong",
        status: "supported",
        version: 1,
        sourceIds: sourceId ? [sourceId] : [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await knowledgeRepository.createClaim(newClaim);

      // 4. Card (卡片展示层)
      const actionSteps = Array.isArray(item.actionSteps)
        ? item.actionSteps
        : Array.isArray(item.action_steps)
        ? item.action_steps
        : typeof item.actionSteps === "string"
        ? item.actionSteps.split(/[;；\n]/).map((s) => s.trim()).filter(Boolean)
        : typeof item.action_steps === "string"
        ? item.action_steps.split(/[;；\n]/).map((s) => s.trim()).filter(Boolean)
        : [oneLine];

      const newCard: KnowledgeCard = {
        id: cardId,
        conceptId: conceptId,
        primaryClaimId: claimId,
        type:
          (item.type as CardType) ||
          (cardModule === "blindspot" ? "blindspot" : "action"),
        module: cardModule,
        title: item.title,
        subtitle: tags.slice(0, 2).join(" · ") || "日常知识",
        oneLine: oneLine,
        body: why || benefit || oneLine,
        misconception: misconception,
        reality: reality,
        why: why,
        cost: cost || "依具体情形而定",
        benefit: benefit,
        actionSteps: actionSteps,
        grade: (item.grade as CardGrade) || "A",
        difficulty: 1,
        evidenceLevel: "strong",
        riskLevel: "medium",
        angle: cardModule === "blindspot" ? "misconception" : "action",
        status: "published",
        tags: tags,
        publishedAt: timestamp,
        updatedAt: timestamp,
      };
      await knowledgeRepository.createCard(newCard);
      importedCards++;
    }

    const storageType = knowledgeRepository.getStorageType();

    return NextResponse.json({
      success: true,
      message: `成功导入 ${importedCards} 条生活常识知识卡片到数据库！`,
      importedCount: importedCards,
      conceptCount: importedConcepts,
      storageType:
        storageType === "supabase" ? "Supabase (PostgreSQL)" : "SQLite 数据库 (data/knowledge.db)",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `导入解析失败: ${String(error)}` },
      { status: 500 }
    );
  }
}
