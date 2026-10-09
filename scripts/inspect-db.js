const { createClient } = require("@libsql/client");
const path = require("path");
const fs = require("fs");

async function inspectDb() {
  const dbPath = path.resolve(__dirname, "../data/knowledge.db");
  console.log("DB File:", dbPath);
  console.log("File Size:", (fs.statSync(dbPath).size / 1024 / 1024).toFixed(2), "MB");
  const client = createClient({ url: `file:${dbPath.replace(/\\/g, "/")}` });

  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
  console.log("Tables in knowledge.db:", tables.rows.map((r) => r.name));

  const cardsCount = await client.execute("SELECT count(*) as cnt FROM cards;");
  const conceptsCount = await client.execute("SELECT count(*) as cnt FROM concepts;");
  const claimsCount = await client.execute("SELECT count(*) as cnt FROM claims;");
  const sourcesCount = await client.execute("SELECT count(*) as cnt FROM sources;");

  console.log("\nRecord Counts in SQLite DB:");
  console.log(" - cards:", cardsCount.rows[0].cnt);
  console.log(" - concepts:", conceptsCount.rows[0].cnt);
  console.log(" - claims:", claimsCount.rows[0].cnt);
  console.log(" - sources:", sourcesCount.rows[0].cnt);

  const sample = await client.execute(
    "SELECT id, title, grade, ratio, cost, benefit, notes FROM cards WHERE id LIKE 'card_archive_s1-1' LIMIT 1;"
  );
  console.log("\nSample Card 1 (系安全带):");
  console.log(sample.rows[0]);

  const sampleBlindspot = await client.execute(
    "SELECT id, title, grade, cost, benefit, notes FROM cards WHERE id LIKE '%LB001%' LIMIT 1;"
  );
  console.log("\nSample Blindspot Card (罐头):");
  console.log(sampleBlindspot.rows[0]);
}

inspectDb().catch(console.error);
