const fs = require("fs");
const path = require("path");

const htmlPath = path.resolve(__dirname, "../data/how-to-live-better.html");
const html = fs.readFileSync(htmlPath, "utf8");

// Split chapters by <h2>
const chapterSections = html.split(/<h2[^>]*>/);
console.log("Total chapter sections:", chapterSections.length);

// Let's inspect chapter 1
if (chapterSections.length > 1) {
  const ch1 = chapterSections[1];
  const h2End = ch1.indexOf("</h2>");
  const chTitle = ch1.substring(0, h2End).trim();
  console.log("Chapter 1 Title:", chTitle);

  const cardsHtml = ch1.split(/<article class="card"/);
  console.log("Chapter 1 Card count:", cardsHtml.length - 1);

  if (cardsHtml.length > 1) {
    const card1 = cardsHtml[1];
    console.log("Card 1 raw snippet (first 600 chars):\n", card1.substring(0, 600));
  }
}
