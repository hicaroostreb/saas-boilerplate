'use client';

import { routes } from '@lib/constants/routes';
import { Button } from '@workspace/ui';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  title: string;
  description: string;
}

const heroTabs: Tab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    title: 'Visualize tudo em um só lugar',
    description:
      'Dashboard intuitivo com métricas em tempo real, relatórios avançados e insights personalizados.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    title: 'Dados que realmente importam',
    description:
      'Analytics avançado com segmentação inteligente, funis de conversão e previsões baseadas em IA.',
  },
  {
    id: 'automation',
    label: 'Automation',
    title: 'Automatize tarefas repetitivas',
    description:
      'Workflows inteligentes que economizam horas da sua equipe e reduzem erros humanos.',
  },
];

export const HeroSection = () => {
  const [activeTab, setActiveTab] = useState(heroTabs[0].id);
  const currentTab = heroTabs.find(tab => tab.id === activeTab) ?? heroTabs[0];

  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-medium">
              <CheckCircle className="mr-2 size-4 text-primary" />
              Mais de 10.000 empresas confiam em nós
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Your revolutionary
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Next.js SaaS
              </span>
            </h1>

            <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
              This is a demo application built with Achromatic. It will save you
              time and effort building your next SaaS.
            </p>

            <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="group">
                <a href={routes.auth.signUp} className="flex items-center">
                  Start for free
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>

              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 size-4" />
                Watch demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="mx-auto max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-8 flex justify-center">
              <div className="inline-flex rounded-xl bg-muted p-1">
                {heroTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-6 py-3 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border bg-background/50 p-8 backdrop-blur-sm"
            >
              <h3 className="mb-4 text-2xl font-semibold text-foreground">
                {currentTab.title}
              </h3>
              <p className="mb-6 text-lg text-muted-foreground">
                {currentTab.description}
              </p>

              <div className="aspect-video rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-4xl">📊</div>
                  <p className="text-sm text-muted-foreground">
                    Demo interativo em desenvolvimento
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
