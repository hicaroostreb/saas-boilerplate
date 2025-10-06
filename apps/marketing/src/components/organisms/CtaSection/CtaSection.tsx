'use client';

import { Button } from '@workspace/ui';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

const benefits = [
  '14-day free trial',
  'No credit card required',
  'Cancel anytime',
  '24/7 support',
];

export const CtaSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center p-12 rounded-3xl border bg-gradient-to-br from-primary/5 to-primary/10"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4 sm:text-4xl">
            Ready to transform your business?
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using our platform to streamline
            operations and accelerate growth.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {benefits.map(benefit => (
              <div key={benefit} className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group">
              Start your free trial
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button variant="outline" size="lg">
              Schedule a demo
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Trusted by 10,000+ businesses worldwide
          </p>
        </motion.div>
      </div>
    </section>
  );
};
