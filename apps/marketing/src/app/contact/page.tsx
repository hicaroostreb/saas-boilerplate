import { MarketingHeader } from '@components/organisms/MarketingHeader';
import { generateSeoMetadata } from '@lib/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Contato - SaaS Universal',
  description:
    'Entre em contato conosco. Nossa equipe está pronta para ajudar seu negócio a crescer.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Entre em contato
          </h1>
          <p className="text-lg text-muted-foreground">
            ContactForm será implementado em breve.
          </p>
        </div>
      </main>
    </div>
  );
}
