// Main exports for the database package
export { db } from './client';
export * from './schema';

// Re-export Drizzle utilities that might be needed
export { and, asc, desc, eq, or, sql } from 'drizzle-orm';
export type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
