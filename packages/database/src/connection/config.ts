import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(__dirname, '../../../../.env.local'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(__dirname, '../../../.env.local'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    config({ path: envPath, override: false });
    if (process.env.DATABASE_URL) {
      envLoaded = true;
      break;
    }
  } catch (error) {
    continue;
  }
}

export interface BuildContext {
  isBuild: boolean;
  isCI: boolean;
  isStatic: boolean;
  isRuntime: boolean;
  environment: 'build' | 'ci' | 'development' | 'production' | 'test';
}

export interface DatabaseConfig {
  connectionString: string;
  isProduction: boolean;
  isDevelopment: boolean;
  poolConfig: {
    max: number;
    idleTimeout: number;
    maxLifetime: number;
    connectTimeout: number;
  };
  sslConfig:
    | {
        rejectUnauthorized: boolean;
      }
    | false;
  logging: boolean;
  prepare: boolean;
  transform: boolean;
  buildContext: BuildContext;
}

export interface PostgresTypeConfig {
  bigint: {
    to: number;
    from: number[];
    serialize: (x: any) => string;
    parse: (x: string) => number;
  };
  json: {
    to: number;
    from: number[];
    serialize: (x: any) => string;
    parse: (x: string) => any;
  };
}

export function detectBuildContext(): BuildContext {
  const isBuild =
    process.env.NODE_ENV === 'production' &&
    !process.env.VERCEL_ENV &&
    !process.env.RAILWAY_ENVIRONMENT &&
    !process.env.RUNTIME_ENV;

  const isCI =
    process.env.CI === 'true' ||
    !!process.env.GITHUB_ACTIONS ||
    !!process.env.GITLAB_CI ||
    !!process.env.JENKINS_URL;

  const isStatic = process.env.__NEXT_ROUTER_BASEPATH !== undefined;

  const isRuntime = !!(
    process.env.VERCEL_ENV ||
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RUNTIME_ENV ||
    process.env.DOCKER_ENV
  );

  let environment: BuildContext['environment'] = 'development';

  if (isBuild || isCI) {
    environment = isCI ? 'ci' : 'build';
  } else if (process.env.NODE_ENV === 'production') {
    environment = 'production';
  } else if (process.env.NODE_ENV === 'test') {
    environment = 'test';
  }

  return { isBuild, isCI, isStatic, isRuntime, environment };
}

function validateDatabaseUrl(): string {
  const context = detectBuildContext();

  if (context.isBuild || context.isCI) {
    if (context.environment === 'ci') {
      console.log('CI Environment: Using mock database URL');
    }
    return 'postgresql://mock:mock@localhost:5432/mock';
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL not found');
    throw new Error('DATABASE_URL environment variable is required');
  }

  return connectionString;
}

export function createDatabaseConfig(): DatabaseConfig {
  const context = detectBuildContext();

  if (!context.isBuild && !context.isCI) {
    // Load environment only for runtime
  }

  const connectionString = validateDatabaseUrl();
  const isProduction =
    process.env.NODE_ENV === 'production' && context.isRuntime;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    connectionString,
    isProduction,
    isDevelopment,
    poolConfig: {
      max:
        context.isBuild || context.isCI
          ? 1
          : isProduction
            ? 20
            : isTest
              ? 2
              : 5,
      idleTimeout: context.isBuild || context.isCI ? 1 : isProduction ? 20 : 10,
      maxLifetime:
        context.isBuild || context.isCI ? 1 : isProduction ? 60 * 60 : 60 * 30,
      connectTimeout: context.isBuild || context.isCI ? 1 : 30,
    },
    sslConfig:
      isProduction && context.isRuntime ? { rejectUnauthorized: false } : false,
    logging: isDevelopment && !context.isBuild && !context.isCI,
    prepare: false,
    transform: !context.isBuild && !context.isCI,
    buildContext: context,
  };
}

export function createPostgresTypes(): PostgresTypeConfig {
  return {
    bigint: {
      to: 20,
      from: [20],
      serialize: (x: any) => x.toString(),
      parse: (x: string) => parseInt(x, 10),
    },
    json: {
      to: 114,
      from: [114, 3802],
      serialize: (x: any) => JSON.stringify(x),
      parse: (x: string) => {
        try {
          return JSON.parse(x);
        } catch {
          return x;
        }
      },
    },
  };
}

export function validateEnvironment(): void {
  const context = detectBuildContext();

  if (context.isBuild || context.isCI) {
    return;
  }

  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

export function getConnectionInfo() {
  const config = createDatabaseConfig();

  return {
    isProduction: config.isProduction,
    isDevelopment: config.isDevelopment,
    poolSize: config.poolConfig.max,
    sslEnabled: !!config.sslConfig,
    loggingEnabled: config.logging,
    buildContext: config.buildContext,
  };
}
