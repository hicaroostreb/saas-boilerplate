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

/**
 * Prompt the user with the given query and return their input.
 *
 * Creates a readline interface against process.stdin/out, displays the prompt,
 * and resolves with the entered string after the interface is closed.
 *
 * @param {string} query - The prompt text displayed to the user.
 * @return {Promise<string>} Resolves to the user's raw input.
 */
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

/**
 * Verify that the Stripe CLI is installed and authenticated.
 *
 * Checks for a working `stripe` executable and confirms authentication by running
 * `stripe config --list`. If the CLI is missing, prints installation guidance and
 * exits the process with code 1. If the CLI is present but not authenticated,
 * prompts the user to run `stripe login`; if the user declines, exits with code 1.
 *
 * @return {Promise<boolean>} Resolves to `true` when the Stripe CLI is installed and authenticated.
 */
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

/**
 * Sets up a PostgreSQL database for the project by either provisioning a local Docker Postgres
 * or prompting for a remote DATABASE_URL.
 *
 * If the user chooses local Docker (answers 'L' or 'l'):
 * - Verifies Docker is installed.
 * - Writes a docker-compose.yml into the project root and runs `docker compose up -d`.
 * - Returns the local connection string: `postgresql://postgres:postgres@localhost:54322/postgres`.
 * - Calls `process.exit(1)` if Docker is not found.
 *
 * If the user chooses remote (any other answer):
 * - Prompts the user for DATABASE_URL and returns the entered value.
 *
 * Side effects: may write files to the project root, run Docker commands, and exit the process.
 * @return {Promise<string>} The DATABASE_URL to use.
 */
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

/**
 * Prompt the user to enter a Stripe Secret Key.
 *
 * Displays the Stripe dashboard URL for reference and returns the value entered by the user.
 *
 * @return {Promise<string>} The Stripe Secret Key entered by the user (e.g. `sk_test_...` or `sk_live_...`).
 */
async function getStripeSecretKey() {
  console.log('💳 Step 3: Stripe Secret Key...');
  console.log('Find at: https://dashboard.stripe.com/test/apikeys');
  return await question('Enter Stripe Secret Key: ');
}

/**
 * Create a Stripe webhook by running `stripe listen --print-secret` and return the webhook secret.
 *
 * Runs the Stripe CLI command to start listening and extracts the first `whsec_...` secret from the command output.
 *
 * @return {string} The extracted Stripe webhook secret (e.g. `whsec_...`).
 * @throws {Error} If the Stripe CLI command fails or a webhook secret cannot be extracted.
 */
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

/**
 * Run the interactive SaaS boilerplate setup and write a `.env.local` file.
 *
 * Performs a multi-step initialization: verifies Stripe CLI availability and authentication, configures a database
 * (offers local Docker Postgres or accepts a remote DATABASE_URL), collects the Stripe secret key, creates a Stripe
 * webhook to obtain its signing secret, generates an application auth secret, and writes these values to
 * `<project_root>/.env.local`.
 *
 * Side effects:
 * - May create and start a local Docker Compose Postgres service (when chosen).
 * - Writes a `.env.local` file in the project root.
 * - Exits the process with code 0 if `.env.local` already exists, or with code 1 on failure.
 *
 * This function is asynchronous and returns a Promise that resolves when setup completes (or does not return if the
 * process is exited).
 */
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
