const { createClient } = require("@libsql/client");

async function main() {
  const client = createClient({ url: "file:data/knowledge.db" });
  const conceptDomains = await client.execute("SELECT domain, COUNT(*) as cnt FROM concepts GROUP BY domain ORDER BY cnt DESC;");
  console.log("Concept domains:");
  console.log(conceptDomains.rows);

  const cardDomains = await client.execute("SELECT module, COUNT(*) as cnt FROM cards GROUP BY module;");
  console.log("Card modules:");
  console.log(cardDomains.rows);
}

main().catch(console.error);
