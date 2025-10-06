'use client';

import { motion } from 'framer-motion';

const companies = [
  { name: 'Acme Corp', logo: '🏢' },
  { name: 'TechStart', logo: '🚀' },
  { name: 'InnovaCorp', logo: '💡' },
  { name: 'DataFlow', logo: '📊' },
  { name: 'CloudTech', logo: '☁️' },
  { name: 'NextGen', logo: '🔮' },
];

export const SocialProofSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="mb-8 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Trusted by leading companies
          </p>

          <div className="grid grid-cols-3 gap-8 md:grid-cols-6">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center"
              >
                <div className="text-3xl mb-2">{company.logo}</div>
                <span className="text-xs font-medium text-muted-foreground">
                  {company.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
