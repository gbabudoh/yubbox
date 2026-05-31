import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import path from 'path';

// Prisma CLI doesn't load .env.local automatically (Next.js convention),
// so we load it explicitly for all prisma CLI commands.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // fallback

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
