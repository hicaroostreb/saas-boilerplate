// packages/auth/src/server.ts - SERVER EXPORTS (compatibility)

// Re-export from new architecture
export * from './lib/nextauth/handlers';

// Additional server utilities if needed
export { authConfig } from './lib/nextauth/config';
