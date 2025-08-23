import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema"


console.log("POSTGRES_URL:", process.env.POSTGRES_URL);
const sql = neon(process.env.POSTGRES_URL as string);
export const db = drizzle(sql,{schema,logger:true});