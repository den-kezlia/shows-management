import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

// Load environment variables: prefer .env.local, fallback to .env
(() => {
  const cwd = process.cwd();
  const envLocal = path.join(cwd, '.env.local');
  const env = path.join(cwd, '.env');
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal });
  } else if (fs.existsSync(env)) {
    dotenv.config({ path: env });
  } else {
    dotenv.config();
  }
})();

const prisma = new PrismaClient();

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error('Missing POSTGRES_URL. Add it to .env.local or export it for this command.');
    process.exit(1);
  }
  const [,, username, email, password] = process.argv;
  if (!username || !email || !password) {
    console.error('Usage: ts-node scripts/create-admin.ts <username> <email> <password>');
    process.exit(1);
  }

  const hashed = await hashPassword(password);

  const admin = await prisma.admin.upsert({
    where: { username },
    update: { email, password: hashed },
    create: { username, email, password: hashed },
  });

  // eslint-disable-next-line no-console
  console.log('Admin ready:', { id: admin.id, username: admin.username, email: admin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
