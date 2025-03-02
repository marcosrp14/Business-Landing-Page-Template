import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();
export const db = drizzle(client, { schema });