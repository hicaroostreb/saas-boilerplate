// packages/database/tests/security/rls-audit.test.ts
// ============================================
// RLS SECURITY AUDIT - STATIC CODE ANALYSIS
// ============================================

import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const REPO_DIR = resolve(__dirname, '../../src/repositories/implementations');

function getRepositoryFiles(): string[] {
  return readdirSync(REPO_DIR)
    .filter(f => f.endsWith('.ts') && !f.includes('index'))
    .map(f => join(REPO_DIR, f));
}

function readFile(path: string): string {
  return readFileSync(path, 'utf-8');
}

describe('RLS Security Audit', () => {
  const files = getRepositoryFiles();

  describe('Critical - Direct Database Queries', () => {
    it('should NOT bypass RLS with direct db access', () => {
      const violations: string[] = [];

      files.forEach(file => {
        const content = readFile(file);
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (
            /this\.db\.(select|update|delete|insert)/.test(line) &&
            !/\/\/ OK:|transactionWithRLS|private get db/.test(line)
          ) {
            violations.push(`${file.split('/').pop()}:${index + 1}`);
          }
        });
      });

      expect(violations).toEqual([]);
    });
  });

  describe('Authorization Guards', () => {
    it('should have guards on delete methods', () => {
      const violations: string[] = [];

      files.forEach(file => {
        const content = readFile(file);

        const deleteMatches = content.matchAll(
          /async delete\([^)]*\)[^{]*{[^}]*}/gs
        );
        for (const match of deleteMatches) {
          const methodBody = match[0];
          if (
            !/requireOwner|requirePermission|requestingUserId|ForbiddenError/.test(
              methodBody
            ) &&
            !/deleteExpired|deleteMany|checkBuildTime/.test(methodBody)
          ) {
            violations.push(file.split('/').pop() || file);
          }
        }
      });

      expect(violations).toEqual([]);
    });
  });

  describe('TenantContext Usage', () => {
    it('should import tenantContext in all repositories', () => {
      const violations: string[] = [];

      files.forEach(file => {
        const content = readFile(file);
        if (!/tenantContext/.test(content)) {
          violations.push(file.split('/').pop() || file);
        }
      });

      expect(violations).toEqual([]);
    });
  });
});
