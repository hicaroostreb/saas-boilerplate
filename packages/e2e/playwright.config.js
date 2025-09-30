import { defineConfig, devices } from '@playwright/test';

/**
 * ✅ ENTERPRISE: Environment-based configuration
 */
const isCI = !!process.env.CI;
const isDev = process.env.NODE_ENV === 'development';
const basePort = process.env.PORT || 3001;

export default defineConfig({
  testDir: './tests',

  // ✅ ENTERPRISE: Optimized timeouts for different environments
  timeout: isCI ? 45 * 1000 : 30 * 1000,
  expect: {
    timeout: isCI ? 8 * 1000 : 5 * 1000,
  },

  // ✅ ENTERPRISE: Performance optimization
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : isDev ? 0 : 1,
  workers: isCI ? 1 : process.env.WORKERS || undefined,

  // ✅ ENTERPRISE: Enhanced reporting for different environments
  reporter: [
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: isDev ? 'always' : 'never',
      },
    ],
    ['list', { printSteps: !isCI }],
    ...(isCI
      ? [['github'], ['junit', { outputFile: 'test-results/junit.xml' }]]
      : []),
  ],

  use: {
    // ✅ ENTERPRISE: Dynamic base URL with fallbacks
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${basePort}`,

    // ✅ ENTERPRISE: Optimized debugging and artifacts
    trace: isCI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',

    // ✅ ENTERPRISE: Optimized action timeouts
    actionTimeout: isCI ? 15 * 1000 : 10 * 1000,
    navigationTimeout: isCI ? 45 * 1000 : 30 * 1000,

    // ✅ ENTERPRISE: Browser context optimization
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: 'en-US',

    // ✅ ENTERPRISE: Enhanced headers for API testing
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    },
  },

  projects: [
    // ✅ ENTERPRISE: Primary browser for CI/CD
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // ✅ ENTERPRISE: Chrome-specific optimizations
        launchOptions: {
          args: isCI
            ? [
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=TranslateUI',
                '--disable-extensions',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
              ]
            : [],
        },
      },
    },

    // ✅ ENTERPRISE: Additional browsers for comprehensive testing (only in specific scenarios)
    ...(process.env.CROSS_BROWSER_TESTING
      ? [
          {
            name: 'firefox',
            use: {
              ...devices['Desktop Firefox'],
              launchOptions: {
                firefoxUserPrefs: {
                  'dom.webnotifications.enabled': false,
                  'dom.push.enabled': false,
                },
              },
            },
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ]
      : []),

    // ✅ ENTERPRISE: Mobile testing (conditional)
    ...(process.env.MOBILE_TESTING
      ? [
          {
            name: 'mobile-chrome',
            use: {
              ...devices['Pixel 5'],
              // ✅ ENTERPRISE: Mobile-specific optimizations
              hasTouch: true,
              isMobile: true,
            },
          },
        ]
      : []),

    // ✅ ENTERPRISE: API testing project
    {
      name: 'api',
      use: {
        baseURL: process.env.API_BASE_URL || `http://localhost:${basePort}/api`,
        // ✅ ENTERPRISE: API-specific headers
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
      testMatch: '**/api/**/*.spec.{js,ts}',
    },
  ],

  // ✅ ENTERPRISE: Enhanced web server configuration
  webServer: {
    command: isCI
      ? 'pnpm build && pnpm start'
      : 'pnpm turbo dev --filter=@workspace/dashboard',
    url: `http://localhost:${basePort}`,
    port: parseInt(basePort),
    reuseExistingServer: !isCI,
    timeout: isCI ? 180 * 1000 : 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
    // ✅ ENTERPRISE: Environment variables for web server
    env: {
      NODE_ENV: isCI ? 'test' : 'development',
      PORT: basePort,
      // Add other required env vars
      ...process.env,
    },
  },

  // ✅ ENTERPRISE: Organized output structure
  outputDir: 'test-results/',

  // ✅ ENTERPRISE: Global setup and teardown (CORRIGIDO - opcional)
  // globalSetup: './global-setup.js',
  // globalTeardown: './global-teardown.js',

  // ✅ ENTERPRISE: Test matching patterns
  testMatch: [
    '**/tests/**/*.spec.{js,ts}',
    '**/e2e/**/*.spec.{js,ts}',
    '**/integration/**/*.spec.{js,ts}',
  ],

  // ✅ ENTERPRISE: Test ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    // Temporarily ignore failing tests during development
    ...(isDev ? ['**/flaky/**/*.spec.{js,ts}'] : []),
  ],

  // ✅ ENTERPRISE: Metadata for reporting
  metadata: {
    testType: 'e2e',
    environment: isCI ? 'ci' : 'local',
    version: process.env.npm_package_version || '1.0.0',
    buildId: process.env.GITHUB_RUN_ID || process.env.BUILD_ID || 'local',
  },
});
