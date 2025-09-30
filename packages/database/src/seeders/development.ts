// ============================================
// DEVELOPMENT SEEDERS - SRP: APENAS DEV DATA
// ============================================

import type { SeedOptions } from '../index';
import { runScript } from '../scripts/seed'; // ✅ FIXED: Now exported

export const developmentSeeder = {
  name: 'Development (Achromatic)',
  async run(options: SeedOptions): Promise<void> {
    if (options.verbose) {
      console.log('🚀 Running Achromatic Enterprise development seed...');
    }

    // Execute seu seed existente
    await runScript();

    if (options.verbose) {
      console.log('✅ Achromatic development seed completed');
    }
  },
};
