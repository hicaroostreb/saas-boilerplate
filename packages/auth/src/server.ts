// packages/auth/src/server.ts - SERVER EXPORTS (compatibility)

// Re-export from new architecture
export { authConfig } from './lib/nextauth/config';
export * from './lib/nextauth/handlers';

// Re-export moved files for backward compatibility
export * from './core/services/audit.service';
export * from './core/services/password.service';
export * from './core/services/security.service';
