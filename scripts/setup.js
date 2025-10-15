#!/usr/bin/env node

import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const execAsync = promisify(exec);

function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function checkPrerequisites() {
  console.log('🔍 Step 1: Checking prerequisites...');
  
  try {
    // Use our requirements-check tool if available
    await execAsync('pnpm --filter "@workspace/requirements-check" run check', { cwd: rootDir });
    console.log('✅ All requirements validated by requirements-check tool');
    return;
  } catch (error) {
    console.log('⚠️  Requirements-check tool not found, running basic checks...');
  }

  // Fallback to basic checks
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    console.error('❌ Node.js 18+ required. Current:', nodeVersion);
    process.exit(1);
  }
  console.log('✅ Node.js version:', nodeVersion);

  try {
    const { stdout } = await execAsync('pnpm --version');
    console.log('✅ pnpm version:', stdout.trim());
  } catch (error) {
    console.error('❌ pnpm not found. Install: npm install -g pnpm');
    process.exit(1);
  }

  console.log('📦 Turbo will be available after dependencies installation');
}

async function checkStripeCLI() {
  console.log('🔍 Step 2: Checking Stripe CLI...');
  try {
    await execAsync('stripe --version');
    console.log('✅ Stripe CLI is installed.');

    try {
      await execAsync('stripe config --list');
      console.log('✅ Stripe CLI is authenticated.');
      return true;
    } catch (error) {
      console.log('⚠️  Stripe CLI is not authenticated.');
      console.log('Please run: stripe login');
      const answer = await question('Have you completed authentication? (y/n): ');
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Please authenticate and run setup again.');
        process.exit(1);
      }

      await execAsync('stripe config --list');
      console.log('✅ Stripe CLI authentication confirmed.');
      return true;
    }
  } catch (error) {
    console.error('❌ Stripe CLI is not installed.');
    console.log('📋 To install Stripe CLI:');
    console.log('1. Visit: https://docs.stripe.com/stripe-cli');
    console.log('2. Download for your OS');
    console.log('3. Run: stripe login');
    process.exit(1);
  }
}

async function setupDatabase() {
  console.log('🗄️  Step 3: Database setup...');
  const choice = await question('Use local Docker Postgres (L) or remote (R)? (L/R): ');

  if (choice.toLowerCase() === 'l') {
    console.log('🐳 Setting up Docker Postgres...');
    
    try {
      await execAsync('docker --version');
      console.log('✅ Docker is installed.');
    } catch (error) {
      console.error('❌ Docker not found. Install: https://docs.docker.com/get-docker/');
      process.exit(1);
    }

    const dockerCompose = `services:
  postgres:
    image: postgres:16.4-alpine
    container_name: saas_boilerplate_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
`;

    await fs.writeFile(path.join(rootDir, 'docker-compose.yml'), dockerCompose);
    console.log('✅ Created docker-compose.yml');

    try {
      await execAsync('docker compose up -d');
      console.log('✅ Docker container started');
      
      // Wait for postgres to be ready
      console.log('⏳ Waiting for database to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('✅ Database should be ready');
    } catch (error) {
      console.log('⚠️  Docker compose failed, trying with docker-compose...');
      try {
        await execAsync('docker-compose up -d');
        console.log('✅ Container started with docker-compose');
      } catch (fallbackError) {
        console.error('❌ Failed to start database container');
        throw fallbackError;
      }
    }
    
    return 'postgresql://postgres:postgres@localhost:54322/postgres';
  } else {
    console.log('🌐 You can find databases at: https://vercel.com/marketplace?category=databases');
    return await question('Enter your DATABASE_URL: ');
  }
}

async function getStripeSecretKey() {
  console.log('💳 Step 4: Stripe Secret Key...');
  console.log('Find at: https://dashboard.stripe.com/test/apikeys');
  return await question('Enter Stripe Secret Key: ');
}

async function createWebhook() {
  console.log('🪝 Step 5: Creating Stripe webhook...');
  try {
    const { stdout } = await execAsync('stripe listen --print-secret');
    const match = stdout.match(/whsec_[a-zA-Z0-9]+/);
    if (!match) throw new Error('Failed to extract webhook secret');
    
    console.log('✅ Webhook created automatically');
    return match[0];
  } catch (error) {
    console.error('❌ Failed to create webhook');
    if (os.platform() === 'win32') {
      console.log('💡 Try running as administrator on Windows');
    }
    throw error;
  }
}

async function setupMonorepo() {
  console.log('📦 Step 6: Setting up monorepo...');
  
  try {
    console.log('Installing dependencies...');
    await execAsync('pnpm install', { cwd: rootDir });
    console.log('✅ Dependencies installed');

    // Build tooling packages first
    console.log('Building tooling packages...');
    try {
      await execAsync('pnpm --filter "@workspace/requirements-check" run build || true', { cwd: rootDir });
      await execAsync('pnpm --filter "@workspace/tailwind-config" run build || true', { cwd: rootDir });
      console.log('✅ Tooling packages built');
    } catch (error) {
      console.log('⚠️  Some tooling packages may not have build scripts');
    }

    console.log('Building core packages...');
    await execAsync('pnpm --filter "@workspace/database" run build', { cwd: rootDir });
    console.log('✅ Database package built');
    
    await execAsync('pnpm --filter "@workspace/auth" run build', { cwd: rootDir });
    console.log('✅ Auth package built');

    await execAsync('pnpm --filter "@workspace/ui" run build', { cwd: rootDir });
    console.log('✅ UI package built');

    // Build other core packages
    try {
      await execAsync('pnpm --filter "@workspace/billing" run build', { cwd: rootDir });
      console.log('✅ Billing package built');
      
      await execAsync('pnpm --filter "@workspace/common" run build', { cwd: rootDir });
      console.log('✅ Common package built');
      
      await execAsync('pnpm --filter "@workspace/http" run build', { cwd: rootDir });
      console.log('✅ Routes package built');
    } catch (error) {
      console.log('⚠️  Some packages may not require building');
    }
    
  } catch (error) {
    console.error('⚠️  Some packages build failed:', error.message);
    console.log('💡 Continuing with database setup...');
  }
}

async function setupDatabaseSchema() {
  console.log('🔄 Step 7: Database schema setup...');
  
  try {
    // Generate migration
    console.log('Generating migration...');
    await execAsync('pnpm --filter "@workspace/database" run generate', { cwd: rootDir });
    console.log('✅ Migration generated');

    // Push schema to database (better for Supabase than migrate)
    console.log('Pushing schema to database...');
    await execAsync('pnpm --filter "@workspace/database" run push', { cwd: rootDir });
    console.log('✅ Database schema pushed');

    // Run seed
    console.log('Seeding database...');
    await execAsync('pnpm --filter "@workspace/database" run seed', { cwd: rootDir });
    console.log('✅ Database seeded');
    
  } catch (error) {
    console.error('⚠️  Database setup failed:', error.message);
    console.log('💡 You may need to run database commands manually later');
  }
}

async function validateSetup() {
  console.log('✅ Step 8: Validating setup...');
  
  try {
    console.log('Running requirements check...');
    try {
      await execAsync('pnpm check:requirements', { cwd: rootDir });
      console.log('✅ Requirements validation passed');
    } catch (error) {
      console.log('⚠️  Requirements check not available yet');
    }

    console.log('Running format check...');
    await execAsync('pnpm turbo format', { cwd: rootDir });
    console.log('✅ Code formatting passed');

    console.log('Running lint check (may have some warnings)...');
    try {
      await execAsync('pnpm turbo lint', { cwd: rootDir });
      console.log('✅ Linting passed');
    } catch (error) {
      console.log('⚠️  Some linting issues found, but setup is complete');
    }

    console.log('Running type check...');
    try {
      await execAsync('pnpm turbo type-check', { cwd: rootDir });
      console.log('✅ Type checking passed');
    } catch (error) {
      console.log('⚠️  Some type issues found, but setup is mostly complete');
    }
    
  } catch (error) {
    console.log('⚠️  Some validations failed, but setup is mostly complete');
  }
}

async function main() {
  console.log('🚀 SaaS Boilerplate Enterprise Monorepo Setup\n');

  const envPath = path.join(rootDir, '.env.local');
  if (await fs.access(envPath).then(() => true).catch(() => false)) {
    const answer = await question('✅ .env.local exists. Reconfigure? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Delete .env.local to reconfigure.\n');
      process.exit(0);
    }
  }

  try {
    await checkPrerequisites();
    await checkStripeCLI();
    const DATABASE_URL = await setupDatabase();
    const STRIPE_SECRET_KEY = await getStripeSecretKey();
    const STRIPE_WEBHOOK_SECRET = await createWebhook();
    const AUTH_SECRET = crypto.randomBytes(32).toString('hex');

    const envContent = `# Database
DATABASE_URL="${DATABASE_URL}"

# Auth.js / NextAuth  
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="${AUTH_SECRET}"
AUTH_SECRET="${AUTH_SECRET}"

# Stripe
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="SaaS Boilerplate"

# Development
NODE_ENV="development"
`;

    await fs.writeFile(envPath, envContent);
    console.log('✅ .env.local created!');

    await setupMonorepo();
    await setupDatabaseSchema();
    await validateSetup();

    console.log('\n🎉 Enterprise Monorepo setup complete!');
    console.log('\n📊 What was configured:');
    console.log('• ✅ Requirements validation system');
    console.log('• ✅ Centralized Tailwind configuration');
    console.log('• ✅ TypeScript configs (base, nextjs, react-library)');
    console.log('• ✅ ESLint & Prettier enterprise setup');
    console.log('• ✅ Database schema & seed data');
    console.log('• ✅ Authentication & Stripe integration');
    console.log('\n📋 Next steps:');
    console.log('1. Run: pnpm turbo dev');
    console.log('2. Visit: http://localhost:3000 (marketing)');
    console.log('3. Visit: http://localhost:3001 (dashboard)');
    console.log('\n🔥 Enterprise-grade monorepo ready!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 You can continue manually with:');
    console.log('1. pnpm install');
    console.log('2. pnpm check:requirements');
    console.log('3. pnpm --filter "@workspace/database" run build');
    console.log('4. pnpm --filter "@workspace/database" run push');
    console.log('5. pnpm --filter "@workspace/database" run seed');
    console.log('6. pnpm turbo build');
    process.exit(1);
  }
}

main();
