import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const meetings = await sql`SELECT id, status, name, transcript_url FROM meetings ORDER BY started_at DESC NULLS LAST LIMIT 5`;
  for(const m of meetings) { console.log(m.id, m.name, m.status, !!m.transcript_url); }
}

main();
