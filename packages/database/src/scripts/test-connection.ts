#!/usr/bin/env bun
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import { resolve } from 'path';

// Carregar .env.local da RAIZ do monorepo
dotenv.config({ path: resolve(__dirname, '../../../../.env.local') });

console.log('Environment check:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log(
  '  DIRECT_DATABASE_URL:',
  process.env.DIRECT_DATABASE_URL ? 'Set' : 'Not set'
);
console.log('');

import { getConnectionInfo, getDb, healthCheck } from '../connection';

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  try {
    // 1. Connection info
    console.log('[1/5] Connection Info:');
    const info = getConnectionInfo();
    console.log(info);
    console.log('');

    // 2. Health check
    console.log('[2/5] Health Check:');
    const health = await healthCheck();
    console.log(health);
    console.log('');

    // 3. Query database
    console.log('[3/5] Database Info:');
    const db = await getDb();

    const dbInfo = await db.execute(sql`
      SELECT 
        current_database() as database,
        current_user as "user",
        version() as postgres_version
    `);

    if (dbInfo && dbInfo.length > 0) {
      console.log(dbInfo[0]);
    }
    console.log('');

    // 4. Count tables
    console.log('[4/5] Tables Created:');
    const tables = await db.execute(sql`
      SELECT 
        schemaname,
        tablename
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log(`${tables.length} tables found:`);
    tables.forEach((row: any) => console.log(`   - ${row.tablename}`));
    console.log('');

    // 5. Check RLS
    console.log('[5/5] RLS Status:');
    const rlsStatus = await db.execute(sql`
      SELECT 
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const rlsEnabled = rlsStatus.filter((r: any) => r.rls_enabled).length;
    console.log(`${rlsEnabled}/${rlsStatus.length} tables with RLS enabled`);

    rlsStatus.forEach((row: any) => {
      const status = row.rls_enabled ? '[ENABLED]' : '[DISABLED]';
      console.log(`   ${status} ${row.tablename}`);
    });
    console.log('');

    console.log('SUCCESS! All tests passed! Database is ready!\n');
    console.log('Summary:');
    console.log(`   - Connection: ${info.type} (${info.pooling})`);
    console.log(`   - Latency: ${health.latency_ms}ms`);
    console.log(`   - Tables: ${tables.length}`);
    console.log(`   - RLS Enabled: ${rlsEnabled}/${rlsStatus.length}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('ERROR: Test failed:', error);
    process.exit(1);
  }
}

testConnection();
