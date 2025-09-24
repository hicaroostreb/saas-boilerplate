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

async function checkStripeCLI() {
  console.log('🔍 Step 1: Checking Stripe CLI...');
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
  console.log('🗄️  Step 2: Database setup...');
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

volumes:
  postgres_data:
`;

    await fs.writeFile(path.join(rootDir, 'docker-compose.yml'), dockerCompose);
    console.log('✅ Created docker-compose.yml');

    await execAsync('docker compose up -d');
    console.log('✅ Docker container started');
    
    return 'postgresql://postgres:postgres@localhost:54322/postgres';
  } else {
    console.log('🌐 You can find databases at: https://vercel.com/marketplace?category=databases');
    return await question('Enter your DATABASE_URL: ');
  }
}

async function getStripeSecretKey() {
  console.log('💳 Step 3: Stripe Secret Key...');
  console.log('Find at: https://dashboard.stripe.com/test/apikeys');
  return await question('Enter Stripe Secret Key: ');
}

async function createWebhook() {
  console.log('🪝 Step 4: Creating Stripe webhook...');
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

async function main() {
  console.log('🚀 SaaS Boilerplate Setup\n');

  const envPath = path.join(rootDir, '.env.local');
  if (await fs.access(envPath).then(() => true).catch(() => false)) {
    console.log('✅ .env.local exists. Delete to reconfigure.\n');
    process.exit(0);
  }

  try {
    await checkStripeCLI();
    const DATABASE_URL = await setupDatabase();
    const STRIPE_SECRET_KEY = await getStripeSecretKey();
    const STRIPE_WEBHOOK_SECRET = await createWebhook();
    const AUTH_SECRET = crypto.randomBytes(32).toString('hex');

    const envContent = `# Database
DATABASE_URL="${DATABASE_URL}"

# Auth.js / NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${AUTH_SECRET}"

# Stripe
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="SaaS Boilerplate"
`;

    await fs.writeFile(envPath, envContent);
    console.log('\n✅ .env.local created!');
    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: pnpm db:migrate');
    console.log('2. Run: pnpm db:seed');
    console.log('3. Run: pnpm dev');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
