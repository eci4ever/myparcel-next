import postgres, { type Sql } from "postgres";

declare global {
  // supaya singleton boleh guna di dev tanpa duplicate
  var sqlInstance: Sql | undefined;
}

export function getDatabaseConnection(): Sql {
  if (global.sqlInstance) return global.sqlInstance;

  const connectionOptions = {
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 10, // Maximum pool size
  };

  const isProduction = process.env.NODE_ENV === "production";

  const sql = postgres(process.env.DATABASE_URL!, {
    ...connectionOptions,
    ssl: isProduction ? "require" : false,
  });

  if (!isProduction) global.sqlInstance = sql;

  return sql;
}

// Default export (boleh terus import sql dari mana-mana file)
const sql = getDatabaseConnection();
export default sql;
