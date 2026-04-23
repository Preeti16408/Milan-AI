import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const meetings = await sql`SELECT id, status, name, transcript_url, summary FROM meetings WHERE id = 'rLtpllRxGsnZPMD9IcF4A'`;
  for(const m of meetings) { console.log(m.id, m.transcript_url); }
}

main();
