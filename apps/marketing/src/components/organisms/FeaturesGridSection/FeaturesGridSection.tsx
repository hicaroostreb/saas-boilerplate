'use client';

import { Button } from '@workspace/ui';
import { motion } from 'framer-motion';
import { BarChart3, Globe, Shield, Smartphone, Users, Zap } from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className: string;
  accent: string;
}

const features: Feature[] = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Get deep insights into your business performance with real-time dashboards and custom reports.',
    className: 'md:col-span-2',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built for speed with modern architecture and global CDN.',
    className: '',
    accent: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-grade security with SOC2 compliance and data encryption.',
    className: '',
    accent: 'from-green-500 to-emerald-500',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Work together seamlessly with real-time collaboration tools and shared workspaces.',
    className: 'md:col-span-2',
    accent: 'from-purple-500 to-pink-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Access everything on any device with our responsive design.',
    className: '',
    accent: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description:
      'Deploy worldwide with automatic scaling and 99.9% uptime SLA.',
    className: '',
    accent: 'from-teal-500 to-cyan-500',
  },
];

export const FeaturesGridSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4 sm:text-4xl">
            Everything you need to scale
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features your
            growing business needs to succeed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`p-8 rounded-2xl border bg-background hover:shadow-lg transition-all duration-300 group ${feature.className}`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-gradient-to-r ${feature.accent} text-white`}
              >
                <feature.icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" className="group">
            Explore all features
            <BarChart3 className="ml-2 w-4 h-4 transition-transform group-hover:scale-110" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
