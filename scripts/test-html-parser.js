const fs = require("fs");
const path = require("path");

function parseHtmlGuide(html) {
  const chapterSections = html.split(/<h2[^>]*>/);
  const cards = [];

  for (let c = 1; c < chapterSections.length; c++) {
    const chSection = chapterSections[c];
    const h2End = chSection.indexOf("</h2>");
    if (h2End === -1) continue;
    const chapterTitle = chSection.substring(0, h2End).replace(/<[^>]+>/g, "").trim();

    const rawCards = chSection.split(/<article class="card"/);
    for (let i = 1; i < rawCards.length; i++) {
      const cardHtml = rawCards[i];

      // id, data-grade, data-ratio
      const idMatch = cardHtml.match(/id="([^"]+)"/);
      const gradeMatch = cardHtml.match(/data-grade="([^"]+)"/);
      const ratioMatch = cardHtml.match(/data-ratio="([^"]+)"/);

      const id = idMatch ? idMatch[1] : `guide_${c}_${i}`;
      const grade = gradeMatch ? gradeMatch[1] : "A";
      const ratio = ratioMatch ? ratioMatch[1] : "高";

      // title: <h3>...</h3>
      const titleMatch = cardHtml.match(/<h3[^>]*>(.*?)<\/h3>/);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      if (!title) continue;

      // chips / tags
      const chipsMatch = cardHtml.match(/<div class="chips">(.*?)<\/div>/s);
      const tags = [chapterTitle];
      if (chipsMatch) {
        const chipTexts = (chipsMatch[1].match(/<span[^>]*>(.*?)<\/span>/g) || []).map((s) =>
          s.replace(/<[^>]+>/g, "").trim()
        );
        tags.push(...chipTexts);
      }

      // plain text summary
      const plainMatch = cardHtml.match(/<p class="plain">(.*?)<\/p>/s);
      const plain = plainMatch ? plainMatch[1].replace(/<[^>]+>/g, "").trim() : "";

      // fields: 成本, 收益, 备注
      const extractField = (fieldName) => {
        const regex = new RegExp(`<b>${fieldName}<\\/b>\\s*<div>(.*?)<\\/div>`, "s");
        const m = cardHtml.match(regex);
        return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
      };

      const cost = extractField("成本");
      const benefit = extractField("收益");
      const note = extractField("备注");

      // sources
      const srcMatch = cardHtml.match(/<div class="sbody">(.*?)<\/div>/s);
      const source = srcMatch ? srcMatch[1].replace(/<[^>]+>/g, "").trim() : "";

      cards.push({
        id: `archive_${id}`,
        chapter: chapterTitle,
        title,
        grade,
        ratio,
        tags,
        oneLine: plain || title,
        cost,
        benefit,
        note,
        source,
      });
    }
  }

  return cards;
}

const htmlPath = path.resolve(__dirname, "../data/how-to-live-better.html");
const html = fs.readFileSync(htmlPath, "utf8");
const parsed = parseHtmlGuide(html);

console.log("Successfully parsed cards count:", parsed.length);
console.log("Sample card 0 (系安全带):", JSON.stringify(parsed[0], null, 2));
console.log("Sample card 100:", JSON.stringify(parsed[100], null, 2));
console.log("Sample card 500:", JSON.stringify(parsed[500], null, 2));
