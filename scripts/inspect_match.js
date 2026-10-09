const { EXPANDED_ARCHIVE_CONCEPTS } = require('../src/data/archive-expanded.data.ts');
const { EXPANDED_BLINDSPOT_CONCEPTS } = require('../src/data/blindspots-expanded.data.ts');

function cleanCharSet(text) {
  const cleaned = text.toLowerCase().replace(/[\s\p{P}为什么怎么如何是不是有没有到底其实了的吗呢吧也一个就会着]/gu, "");
  return new Set(cleaned.split("").filter(Boolean));
}

function calc(title, summary, tags, concept) {
  const charsCand = cleanCharSet(`${title} ${summary}`);
  const charsQ = cleanCharSet(concept.canonicalQuestion);
  const charsN = cleanCharSet(concept.name);

  let countQ = 0;
  for (const c of charsCand) if (charsQ.has(c)) countQ++;
  const ratioQ = charsQ.size > 0 ? countQ / Math.min(charsCand.size, charsQ.size) : 0;

  let countN = 0;
  for (const c of charsCand) if (charsN.has(c)) countN++;
  const ratioN = charsN.size > 0 ? countN / Math.min(charsCand.size, charsN.size) : 0;

  const textMatch = Math.max(ratioQ, ratioN);
  const cTags = new Set(concept.tags || []);
  let tagMatch = 0;
  for (const t of tags) if (cTags.has(t)) tagMatch++;
  const tagRatio = tags.length > 0 ? tagMatch / tags.length : 0;

  return textMatch * 0.7 + tagRatio * 0.3;
}

const all = [...EXPANDED_ARCHIVE_CONCEPTS, ...EXPANDED_BLINDSPOT_CONCEPTS];
const matches = [];

for (const c of all) {
  const s = calc("断桥铝系统门窗壁厚国标要求", "新国标要求外窗铝合金主受力部位壁厚不小于1.8mm", ["装修", "门窗"], c);
  if (s >= 0.3) {
    matches.push({ name: c.name, s });
  }
}

matches.sort((a,b) => b.s - a.s);
console.log('Matches found for window candidate:');
console.log(matches.slice(0, 5));
