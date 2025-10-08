import type { Metadata } from 'next';
import { MarketingHeader } from '../../components/organisms/MarketingHeader';
import { generateSeoMetadata } from '../../lib/seo/metadata';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Preços - SaaS Universal',
  description: 'Planos simples e transparentes para seu negócio.',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Nossos planos
          </h1>
          <p className="text-lg text-muted-foreground">
            PricingTable será implementado em breve.
          </p>
        </div>
      </main>
    </div>
  );
}
