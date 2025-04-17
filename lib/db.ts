import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the Neon connection
const sql = neon(process.env.DATABASE_URL!)

// Create a Drizzle client with the Neon connection
export const db = drizzle(sql)

// Export the raw SQL client for direct queries
export { sql }
