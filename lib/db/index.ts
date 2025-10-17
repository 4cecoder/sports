import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create postgres connection with options to handle IPv6 issues
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString, {
      prepare: false,
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30, // 30 minutes
      // Add connection options to handle network issues
      connection: {
        application_name: 'fastbreak_app',
      },
    });

    // Create drizzle instance
    dbInstance = drizzle(client, { schema });
  }

  return dbInstance;
}

// Export a getter to ensure lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle<typeof schema>>];
  },
});
