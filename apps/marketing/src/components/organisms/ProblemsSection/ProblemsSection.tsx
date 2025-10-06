'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Clock, DollarSign } from 'lucide-react';

interface Problem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  stats: string;
}

const problems: Problem[] = [
  {
    icon: Clock,
    title: 'Wasting time on manual tasks',
    description:
      'Your team spends hours on repetitive processes that could be automated, reducing productivity and increasing frustration.',
    stats: '40% of work time lost',
  },
  {
    icon: AlertTriangle,
    title: 'Lack of real-time insights',
    description:
      'Making decisions based on outdated data leads to missed opportunities and poor strategic choices.',
    stats: '60% miss opportunities',
  },
  {
    icon: DollarSign,
    title: 'Rising operational costs',
    description:
      'Legacy systems and inefficient workflows are draining your budget without delivering proportional value.',
    stats: '30% budget waste',
  },
];

export const ProblemsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4 sm:text-4xl">
            The problems keeping you up at night
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We understand the challenges modern businesses face. That&aposs why
            we built a solution that addresses your biggest pain points.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl border bg-background hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                <problem.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-4">
                {problem.title}
              </h3>

              <p className="text-muted-foreground mb-4 leading-relaxed">
                {problem.description}
              </p>

              <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium dark:bg-red-900 dark:text-red-200">
                {problem.stats}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
