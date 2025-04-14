import dotenv from 'dotenv'; 
import { defineConfig } from 'drizzle-kit';

dotenv.config({path: '.env.local'}); // Load environment variables from .env.local

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
