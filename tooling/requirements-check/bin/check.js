#!/usr/bin/env node

import { execSync } from 'child_process';
import semver from 'semver';
import chalk from 'chalk';

const REQUIREMENTS = {
  node: '>=18.17.0',
  pnpm: '>=8.0.0',
};

async function checkRequirements() {
  console.log(chalk.blue('🔍 Checking development requirements...\n'));
  
  let passed = 0;
  let failed = 0;

  // Check Node.js
  const nodeVersion = process.version;
  if (semver.satisfies(nodeVersion, REQUIREMENTS.node)) {
    console.log(chalk.green(`✅ Node.js ${nodeVersion}`));
    passed++;
  } else {
    console.log(chalk.red(`❌ Node.js ${nodeVersion} (required: ${REQUIREMENTS.node})`));
    failed++;
  }

  // Check pnpm
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    if (semver.satisfies(pnpmVersion, REQUIREMENTS.pnpm)) {
      console.log(chalk.green(`✅ pnpm ${pnpmVersion}`));
      passed++;
    } else {
      console.log(chalk.red(`❌ pnpm ${pnpmVersion} (required: ${REQUIREMENTS.pnpm})`));
      failed++;
    }
  } catch (error) {
    console.log(chalk.red('❌ pnpm not found'));
    failed++;
  }

  // Check Git
  try {
    execSync('git --version', { stdio: 'pipe' });
    console.log(chalk.green('✅ Git available'));
    passed++;
  } catch (error) {
    console.log(chalk.red('❌ Git not found'));
    failed++;
  }

  console.log(`\n📊 Results: ${chalk.green(passed + ' passed')}, ${failed > 0 ? chalk.red(failed + ' failed') : '0 failed'}`);

  if (failed > 0) {
    console.log(chalk.red('\n❌ Some requirements are missing. Please install them and try again.'));
    process.exit(1);
  }

  console.log(chalk.green('\n🎉 All requirements satisfied!'));
}

checkRequirements().catch(console.error);
