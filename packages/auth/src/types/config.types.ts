// packages/auth/src/types/config.types.ts - CONFIGURATION TYPES

/**
 * ✅ ENTERPRISE: Configuration Types
 * Single Responsibility: Advanced configuration type definitions
 */

// ============================================
// ENVIRONMENT CONFIGURATIONS
// ============================================

export interface ConfigOptions {
  database: DatabaseConfig;
  auth: AuthConfig;
  security: SecurityConfig;
  email: EmailConfig;
  features: FeatureConfig;
  monitoring: MonitoringConfig;
}

export interface EnvironmentConfig {
  development: Partial<ConfigOptions>;
  staging: Partial<ConfigOptions>;
  production: Partial<ConfigOptions>;
}

// ============================================
// DATABASE CONFIGURATION
// ============================================

export interface DatabaseConfig {
  url: string;
  ssl?: boolean;
  poolSize?: number;
  timeout?: number;
  retryAttempts?: number;
  migrations?: {
    auto?: boolean;
    path?: string;
  };
}

// ============================================
// AUTH PROVIDER CONFIGURATIONS
// ============================================

export interface AuthConfig {
  providers: ProviderConfig;
  session: SessionConfig;
  jwt: JwtConfig;
  security: AuthSecurityConfig;
}

export interface ProviderConfig {
  google?: GoogleProviderConfig;
  github?: GitHubProviderConfig;
  azure?: AzureProviderConfig;
  okta?: OktaProviderConfig;
  credentials?: CredentialsProviderConfig;
}

export interface GoogleProviderConfig {
  clientId: string;
  clientSecret: string;
  allowedDomains?: string[];
  hostedDomain?: string;
  scopes?: string[];
}

export interface GitHubProviderConfig {
  clientId: string;
  clientSecret: string;
  allowedOrganizations?: string[];
  allowedTeams?: string[];
  scopes?: string[];
}

export interface AzureProviderConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  allowedTenants?: string[];
  scopes?: string[];
}

export interface OktaProviderConfig {
  domain: string;
  clientId: string;
  clientSecret: string;
  authorizationServerId?: string;
}

export interface CredentialsProviderConfig {
  enableSignUp: boolean;
  requireEmailVerification: boolean;
  passwordPolicy: PasswordPolicyConfig;
}

// ============================================
// SESSION CONFIGURATION
// ============================================

export interface SessionConfig {
  strategy: 'jwt' | 'database';
  maxAge: number;
  updateAge: number;
  generateSessionToken?: () => string;
  cookies?: SessionCookieConfig;
}

export interface SessionCookieConfig {
  sessionToken?: {
    name?: string;
    options?: {
      httpOnly?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
      path?: string;
      secure?: boolean;
      domain?: string;
    };
  };
}

// ============================================
// JWT CONFIGURATION
// ============================================

export interface JwtConfig {
  secret?: string;
  signingKey?: string;
  verificationOptions?: {
    algorithms?: string[];
    audience?: string;
    issuer?: string;
    ignoreExpiration?: boolean;
  };
  encode?: (params: unknown) => Promise<string>;
  decode?: (params: unknown) => Promise<unknown>;
}

// ============================================
// SECURITY CONFIGURATIONS
// ============================================

export interface SecurityConfig {
  rateLimit: RateLimitConfig;
  password: PasswordPolicyConfig;
  session: SecuritySessionConfig;
  audit: AuditConfig;
  risk: RiskConfig;
  mfa: MfaConfig;
}

export interface AuthSecurityConfig {
  allowedOrigins?: string[];
  trustedHosts?: string[];
  requireHttps?: boolean;
  frameguard?: boolean;
  contentSecurityPolicy?: Record<string, string[]>;
}

export interface RateLimitConfig {
  enabled: boolean;
  maxAttempts: {
    signIn: number;
    passwordReset: number;
    emailVerification: number;
    mfa: number;
  };
  windowMs: {
    signIn: number;
    passwordReset: number;
    emailVerification: number;
    mfa: number;
  };
  blockDuration: {
    signIn: number;
    passwordReset: number;
    emailVerification: number;
    mfa: number;
  };
}

export interface PasswordPolicyConfig {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minSpecialChars: number;
  preventReuse: number;
  maxAge: number; // milliseconds
  complexity: {
    minScore: number;
    forbiddenPatterns: string[];
    forbiddenWords: string[];
  };
}

export interface SecuritySessionConfig {
  timeouts: Record<string, number>;
  idleTimeouts: Record<string, number>;
  maxConcurrentSessions: number;
  forceLogoutOnPasswordChange: boolean;
  deviceTracking: boolean;
  locationTracking: boolean;
}

export interface AuditConfig {
  enabled: boolean;
  retention: {
    auth: number; // days
    security: number; // days
    compliance: number; // days
    admin: number; // days
  };
  export: {
    formats: ('json' | 'csv' | 'xlsx')[];
    maxRecords: number;
    includePersonalData: boolean;
  };
  realtime: {
    enabled: boolean;
    webhook?: string;
    events: string[];
  };
}

export interface RiskConfig {
  enabled: boolean;
  thresholds: RiskThresholdConfig;
  factors: RiskFactorConfig;
  geographic: GeographicRiskConfig;
  temporal: TemporalRiskConfig;
  behavioral: BehavioralRiskConfig;
}

export interface RiskThresholdConfig {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface RiskFactorConfig {
  newDevice: number;
  newLocation: number;
  suspiciousCountry: number;
  untrustedCountry: number;
  suspiciousTime: number;
  noDeviceFingerprint: number;
  noIpAddress: number;
  authenticationFailure: number;
  excessiveSessions: number;
  velocityAnomaly: number;
}

export interface GeographicRiskConfig {
  trustedCountries: string[];
  suspiciousCountries: string[];
  blockedCountries: string[];
  vpnDetection: boolean;
  proxyDetection: boolean;
}

export interface TemporalRiskConfig {
  suspiciousHours: {
    start: number;
    end: number;
  };
  workingDays: number[];
  timezone: string;
}

export interface BehavioralRiskConfig {
  velocityChecks: boolean;
  sessionPatterns: boolean;
  devicePatterns: boolean;
  locationPatterns: boolean;
}

export interface MfaConfig {
  enabled: boolean;
  required: boolean;
  methods: ('totp' | 'sms' | 'email' | 'backup_codes')[];
  backup: {
    codesCount: number;
    codeLength: number;
  };
  totp: {
    issuer: string;
    digits: 6 | 8;
    period: number;
    algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  };
  sms: {
    provider: string;
    template: string;
    codeLength: number;
    expiryMinutes: number;
  };
}

// ============================================
// EMAIL CONFIGURATION
// ============================================

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'ses' | 'postmark' | 'smtp';
  from: {
    email: string;
    name: string;
  };
  templates: EmailTemplateConfig;
  delivery: EmailDeliveryConfig;
}

export interface EmailTemplateConfig {
  passwordReset: string;
  accountVerification: string;
  welcome: string;
  securityAlert: string;
  mfaCode: string;
}

export interface EmailDeliveryConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  rateLimit: {
    maxPerMinute: number;
    maxPerHour: number;
  };
}

// ============================================
// FEATURE FLAGS
// ============================================

export interface FeatureConfig {
  auth: AuthFeatureFlags;
  security: SecurityFeatureFlags;
  compliance: ComplianceFeatureFlags;
  ui: UiFeatureFlags;
}

export interface AuthFeatureFlags {
  enableMfa: boolean;
  enableSocialLogin: boolean;
  enablePasswordless: boolean;
  enableMagicLinks: boolean;
  enableAccountVerification: boolean;
  enablePasswordReset: boolean;
}

export interface SecurityFeatureFlags {
  enableAuditLogging: boolean;
  enableRiskAssessment: boolean;
  enableDeviceTracking: boolean;
  enableLocationTracking: boolean;
  enableAnomalyDetection: boolean;
  enableThreatIntelligence: boolean;
}

export interface ComplianceFeatureFlags {
  gdprCompliance: boolean;
  ccpaCompliance: boolean;
  soc2Compliance: boolean;
  auditExport: boolean;
  dataRetention: boolean;
  rightToDelete: boolean;
}

export interface UiFeatureFlags {
  enableDarkMode: boolean;
  enableCustomBranding: boolean;
  enableAdvancedSettings: boolean;
  enableBulkOperations: boolean;
  enableRealTimeUpdates: boolean;
}

// ============================================
// MONITORING CONFIGURATION
// ============================================

export interface MonitoringConfig {
  metrics: MetricsConfig;
  logging: LoggingConfig;
  health: HealthCheckConfig;
  alerts: AlertConfig;
}

export interface MetricsConfig {
  enabled: boolean;
  provider: 'prometheus' | 'datadog' | 'newrelic' | 'cloudwatch';
  interval: number;
  labels: Record<string, string>;
}

export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'text';
  destinations: ('console' | 'file' | 'syslog' | 'http')[];
  structured: boolean;
  includeTraceId: boolean;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  endpoints: string[];
}

export interface AlertConfig {
  enabled: boolean;
  channels: ('email' | 'slack' | 'webhook' | 'pagerduty')[];
  thresholds: {
    errorRate: number;
    responseTime: number;
    failedLogins: number;
    securityEvents: number;
  };
}

// ============================================
// RUNTIME CONFIGURATION
// ============================================

export interface RuntimeConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildTime: string;
  features: Record<string, boolean>;
  limits: {
    maxUsers: number;
    maxOrganizations: number;
    maxSessionsPerUser: number;
    maxApiCalls: number;
  };
}

// ============================================
// TYPE UTILITIES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ConfigValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export type EnvironmentName = 'development' | 'staging' | 'production';

export type ConfigProvider = 'env' | 'file' | 'vault' | 'remote';
