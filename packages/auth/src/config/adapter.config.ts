// packages/auth/src/config/adapter.config.ts - DATABASE ADAPTER

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@workspace/database';
import type { Adapter } from 'next-auth/adapters';

/**
 * ✅ ENTERPRISE: Database Adapter Configuration
 * Single Responsibility: Database connection for NextAuth
 */
export const adapterConfig: Adapter = DrizzleAdapter(db);

export default adapterConfig;
