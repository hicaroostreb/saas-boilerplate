#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import semver from 'semver';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Enterprise requirements configuration
const REQUIREMENTS = {
  node: '>=18.17.0',
  pnpm: '>=8.0.0',
  typescript: '>=5.0.0',
  git: '*', // Any version
};

// Optional tools (warnings, not failures)
const OPTIONAL_TOOLS = {
  docker: '>=20.0.0',
  playwright: '>=1.40.0',
};

// Parse command line arguments
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');
const isStrict = args.includes('--strict');

function getVersion(command, regex = /\d+\.\d+\.\d+/) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim();
    const match = output.match(regex);
    return match ? match[0] : null;
  } catch (error) {
    return null;
  }
}

function checkPackageJson() {
  try {
    const packagePath = join(__dirname, '../../../package.json');
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));

    if (isVerbose) {
      console.log(chalk.blue(`📦 Project: ${pkg.name} v${pkg.version}`));
      console.log(
        chalk.blue(
          `📋 Package Manager: ${pkg.packageManager || 'Not specified'}\n`
        )
      );
    }

    return pkg;
  } catch (error) {
    if (isVerbose) {
      console.log(chalk.yellow('⚠️ Could not read root package.json\n'));
    }
    return null;
  }
}

async function checkRequirements() {
  console.log(
    chalk.blue.bold('🔍 Enterprise Development Requirements Check\n')
  );

  // Check package.json info
  const pkg = checkPackageJson();

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  // Core requirements checks
  console.log(chalk.cyan('📋 Core Requirements:'));

  // Check Node.js
  const nodeVersion = process.version.slice(1); // Remove 'v' prefix
  if (semver.satisfies(nodeVersion, REQUIREMENTS.node)) {
    console.log(chalk.green(`✅ Node.js ${process.version}`));
    passed++;
  } else {
    console.log(
      chalk.red(
        `❌ Node.js ${process.version} (required: ${REQUIREMENTS.node})`
      )
    );
    failed++;
  }

  // Check pnpm
  const pnpmVersion = getVersion('pnpm --version');
  if (pnpmVersion && semver.satisfies(pnpmVersion, REQUIREMENTS.pnpm)) {
    console.log(chalk.green(`✅ pnpm ${pnpmVersion}`));
    passed++;
  } else if (pnpmVersion) {
    console.log(
      chalk.red(`❌ pnpm ${pnpmVersion} (required: ${REQUIREMENTS.pnpm})`)
    );
    failed++;
  } else {
    console.log(chalk.red('❌ pnpm not found'));
    failed++;
  }

  // Check TypeScript
  const tsVersion = getVersion('npx tsc --version', /\d+\.\d+\.\d+/);
  if (tsVersion && semver.satisfies(tsVersion, REQUIREMENTS.typescript)) {
    console.log(chalk.green(`✅ TypeScript ${tsVersion}`));
    passed++;
  } else if (tsVersion) {
    console.log(
      chalk.red(
        `❌ TypeScript ${tsVersion} (required: ${REQUIREMENTS.typescript})`
      )
    );
    failed++;
  } else {
    console.log(chalk.red('❌ TypeScript not found'));
    failed++;
  }

  // Check Git
  const gitVersion = getVersion('git --version', /\d+\.\d+\.\d+/);
  if (gitVersion) {
    console.log(chalk.green(`✅ Git ${gitVersion}`));
    passed++;
  } else {
    console.log(chalk.red('❌ Git not found'));
    failed++;
  }

  // Optional tools checks
  console.log(chalk.cyan('\n🛠️ Optional Development Tools:'));

  // Check Docker
  const dockerVersion = getVersion('docker --version', /\d+\.\d+\.\d+/);
  if (dockerVersion && semver.satisfies(dockerVersion, OPTIONAL_TOOLS.docker)) {
    console.log(chalk.green(`✅ Docker ${dockerVersion}`));
  } else if (dockerVersion) {
    console.log(
      chalk.yellow(
        `⚠️ Docker ${dockerVersion} (recommended: ${OPTIONAL_TOOLS.docker})`
      )
    );
    warnings++;
  } else {
    console.log(
      chalk.yellow('⚠️ Docker not found (optional for containerization)')
    );
    warnings++;
  }

  // Check Playwright
  const playwrightVersion = getVersion(
    'npx playwright --version',
    /\d+\.\d+\.\d+/
  );
  if (playwrightVersion) {
    console.log(chalk.green(`✅ Playwright ${playwrightVersion}`));
  } else {
    console.log(
      chalk.yellow('⚠️ Playwright not installed (run: pnpm test:install)')
    );
    warnings++;
  }

  // Check Turbo
  const turboVersion = getVersion('npx turbo --version', /\d+\.\d+\.\d+/);
  if (turboVersion) {
    console.log(chalk.green(`✅ Turbo ${turboVersion}`));
  } else {
    console.log(chalk.yellow('⚠️ Turbo not found'));
    warnings++;
  }

  // Environment checks
  if (isVerbose) {
    console.log(chalk.cyan('\n🌍 Environment Information:'));
    console.log(chalk.blue(`📍 Platform: ${process.platform} ${process.arch}`));
    console.log(
      chalk.blue(
        `💾 Memory: ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
      )
    );
    console.log(chalk.blue(`📂 Working Directory: ${process.cwd()}`));
  }

  // Results summary
  console.log(`\n📊 ${chalk.bold('Results Summary:')}`);
  console.log(`${chalk.green('✅ Passed:')} ${passed}`);
  console.log(`${chalk.red('❌ Failed:')} ${failed}`);
  console.log(`${chalk.yellow('⚠️ Warnings:')} ${warnings}`);

  // Exit logic
  if (failed > 0) {
    console.log(chalk.red.bold('\n💥 Critical requirements missing!'));
    console.log(
      chalk.red('Please install missing requirements and try again.')
    );

    if (isVerbose) {
      console.log(chalk.blue('\n📚 Installation guides:'));
      console.log(chalk.blue('Node.js: https://nodejs.org/'));
      console.log(chalk.blue('pnpm: https://pnpm.io/installation'));
      console.log(chalk.blue('TypeScript: npm install -g typescript'));
      console.log(chalk.blue('Git: https://git-scm.com/downloads'));
    }

    process.exit(1);
  }

  if (warnings > 0 && isStrict) {
    console.log(chalk.yellow.bold('\n⚠️ Warnings found in strict mode!'));
    process.exit(1);
  }

  console.log(chalk.green.bold('\n🎉 All critical requirements satisfied!'));

  if (warnings > 0) {
    console.log(
      chalk.yellow(
        `\n💡 Consider installing optional tools for enhanced development experience.`
      )
    );
  }

  console.log(chalk.blue('\n🚀 Ready for enterprise development!'));
}

// Error handling
process.on('uncaughtException', error => {
  console.log(chalk.red.bold('\n💥 Unexpected error occurred:'));
  console.log(chalk.red(error.message));
  if (isVerbose) {
    console.log(chalk.gray(error.stack));
  }
  process.exit(1);
});

// Run the checks
checkRequirements().catch(error => {
  console.log(chalk.red.bold('\n💥 Requirements check failed:'));
  console.log(chalk.red(error.message));
  if (isVerbose) {
    console.log(chalk.gray(error.stack));
  }
  process.exit(1);
});
