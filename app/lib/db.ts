import postgres from "postgres";

let sql: any;

try {
  // Attempt connection without SSL
  sql = postgres(process.env.POSTGRES_URL_NO_SSL!, { ssl: false });
  await sql`SELECT 1`; // Test the connection
} catch (error) {
  console.error("Connection without SSL failed, retrying with SSL...");
  // Fallback to SSL connection
  sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
}

export default sql;
