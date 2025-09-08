import postgres, { Sql } from "postgres";

// Define a type for our database connection
type DatabaseConnection = Sql;

// Create a singleton database instance
let sqlInstance: DatabaseConnection | null = null;

export async function getDatabaseConnection(): Promise<DatabaseConnection> {
  if (sqlInstance) {
    return sqlInstance;
  }

  const connectionOptions = {
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 10, // Maximum number of connections in the pool
  };

  try {
    // First try without SSL
    sqlInstance = postgres(process.env.POSTGRES_URL_NO_SSL!, {
      ...connectionOptions,
      ssl: false,
    });
    
    await sqlInstance`SELECT 1`;
    console.log("Database connected without SSL");
    
    return sqlInstance;
  } catch (error) {
    console.error("Connection without SSL failed:", error);
    
    // Fallback to SSL connection
    try {
      sqlInstance = postgres(process.env.POSTGRES_URL!, {
        ...connectionOptions,
        ssl: "require",
      });
      
      await sqlInstance`SELECT 1`;
      console.log("Database connected with SSL");
      
      return sqlInstance;
    } catch (sslError) {
      console.error("Connection with SSL also failed:", sslError);
      throw new Error("Failed to connect to database with both SSL and non-SSL options");
    }
  }
}

// Initialize the connection when the module is imported
const sql = await getDatabaseConnection();

export default sql;