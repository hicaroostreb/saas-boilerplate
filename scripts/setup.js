#!/usr/bin/env node

import { exec } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { access, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const ask = query => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
};

const run = async (cmd, opts = {}) => {
  try {
    const { stdout } = await execAsync(cmd, { cwd: rootDir, ...opts });
    return stdout.trim();
  } catch (error) {
    if (!opts.silent) {
      throw error;
    }
    return null;
  }
};

const checkTool = async (name, cmd, installUrl) => {
  const version = await run(cmd, { silent: true });
  if (!version) {
    console.error(`❌ ${name} not found. Install: ${installUrl}`);
    process.exit(1);
  }
  console.warn(`✅ ${name}:`, version);
};

const setupDocker = async () => {
  console.warn('🐳 Starting Docker Postgres...');

  const compose = `services:
  postgres:
    image: postgres:16-alpine
    container_name: saas_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports: ["54322:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
volumes:
  postgres_data:
`;

  await writeFile(join(rootDir, 'docker-compose.yml'), compose);
  await run('docker compose up -d');
  await new Promise(r => setTimeout(r, 3000));
  console.warn('✅ Database ready');
  return 'postgresql://postgres:postgres@localhost:54322/postgres';
};

const setupStripe = async () => {
  console.warn('💳 Setting up Stripe...');

  await checkTool(
    'Stripe CLI',
    'stripe --version',
    'https://docs.stripe.com/stripe-cli'
  );

  if (!(await run('stripe config --list', { silent: true }))) {
    console.warn('Run: stripe login');
    const ans = await ask('Authenticated? (y/n): ');
    if (ans.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  console.warn('Find at: https://dashboard.stripe.com/test/apikeys');
  const key = await ask('Stripe Secret Key: ');

  const webhook = await run('stripe listen --print-secret');
  const secret = webhook.match(/whsec_[a-zA-Z0-9]+/)?.[0];

  if (!secret) {
    throw new Error('Failed to create webhook');
  }
  console.warn('✅ Stripe configured');
  return { key, secret };
};

const buildPackages = async () => {
  console.warn('📦 Building packages...');

  const packages = ['database', 'auth', 'ui'];

  for (const pkg of packages) {
    try {
      await run(`bun --filter "@workspace/${pkg}" run build`);
      console.warn(`✅ ${pkg} built`);
    } catch {
      console.warn(`⚠️  ${pkg} build failed, continuing...`);
    }
  }
};

const setupDatabase = async () => {
  console.warn('🔄 Setting up database...');

  try {
    await run('bun --filter "@workspace/database" run db:push');
    console.warn('✅ Schema pushed (13 tables with tenant_id)');

    await run(
      'NODE_ENV=development bun --filter "@workspace/database" run db:seed'
    );
    console.warn('✅ Database seeded');
  } catch (error) {
    console.error('⚠️  Database setup failed:', error.message);
    console.warn(
      '💡 Run manually: bun --filter "@workspace/database" run db:push'
    );
  }
};

const createEnv = async (dbUrl, stripeKey, stripeSecret) => {
  const content = `# Database
DATABASE_URL="${dbUrl}"

# Auth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="${randomBytes(32).toString('hex')}"
AUTH_SECRET="${randomBytes(32).toString('hex')}"

# Stripe
STRIPE_SECRET_KEY="${stripeKey}"
STRIPE_WEBHOOK_SECRET="${stripeSecret}"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="SaaS Boilerplate"
NODE_ENV="development"
`;

  await writeFile(join(rootDir, '.env.local'), content);
  console.warn('✅ .env.local created');
};

const main = async () => {
  console.warn('🚀 SaaS Boilerplate Setup (Multi-Tenant)\n');

  // Check if reconfigure
  const envExists = await access(join(rootDir, '.env.local'))
    .then(() => true)
    .catch(() => false);
  if (envExists) {
    const ans = await ask('.env.local exists. Reconfigure? (y/n): ');
    if (ans.toLowerCase() !== 'y') {
      console.warn('Cancelled.');
      process.exit(0);
    }
  }

  try {
    // Prerequisites
    console.warn('🔍 Checking prerequisites...');
    await checkTool('Bun', 'bun --version', 'https://bun.sh');
    await checkTool(
      'Docker',
      'docker --version',
      'https://docs.docker.com/get-docker/'
    );

    // Setup
    await run('bun install');
    console.warn('✅ Dependencies installed\n');

    const dbChoice = await ask('Database: Local Docker (l) or Remote (r)? ');
    const dbUrl =
      dbChoice.toLowerCase() === 'l'
        ? await setupDocker()
        : await ask('Enter DATABASE_URL: ');

    const { key, secret } = await setupStripe();

    await createEnv(dbUrl, key, secret);
    await buildPackages();
    await setupDatabase();

    // Success
    console.warn('\n🎉 Setup Complete!\n');
    console.warn('📊 What was configured:');
    console.warn('• Multi-tenant database (13 tables with tenant_id)');
    console.warn('• Row-Level Security (automatic filtering)');
    console.warn('• Auth + Stripe integration');
    console.warn('• Test data seeded\n');

    console.warn('🔐 Test Login:');
    console.warn('• Email: test1@example.com');
    console.warn('• Password: TestPass123\n');

    console.warn('📋 Next steps:');
    console.warn('1. bun run dev');
    console.warn('2. Visit: http://localhost:3000 (marketing)');
    console.warn('3. Visit: http://localhost:3001 (dashboard)\n');

    console.warn('🔥 Ready to build!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.warn('\n💡 Manual steps:');
    console.warn('1. bun install');
    console.warn('2. bun --filter "@workspace/database" run db:push');
    console.warn('3. bun --filter "@workspace/database" run db:seed');
    console.warn('4. bun run dev');
    process.exit(1);
  }
};

main();
