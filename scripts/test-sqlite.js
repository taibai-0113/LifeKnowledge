const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

async function test() {
  const dbPath = path.resolve(__dirname, "../data/knowledge.db");
  const client = createClient({ url: `file:${dbPath.replace(/\\/g, "/")}` });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS test (
      id TEXT PRIMARY KEY,
      title TEXT
    );
  `);

  await client.execute({
    sql: "INSERT OR REPLACE INTO test (id, title) VALUES (?, ?);",
    args: ["1", "安全带常识"],
  });

  const res = await client.execute("SELECT * FROM test;");
  console.log("Rows:", res.rows);
  console.log("knowledge.db file exists:", fs.existsSync(dbPath));
  console.log("knowledge.db size:", fs.statSync(dbPath).size, "bytes");

  await client.execute("DROP TABLE test;");
}

test().catch(console.error);
