import { generateSeoMetadata } from '@lib/seo/metadata';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = generateSeoMetadata({
  title: 'SaaS Universal - A Plataforma Definitiva para seu Negócio',
  description:
    'Template universal para SaaS com Next.js 14, TypeScript e Tailwind. Acelere o desenvolvimento do seu produto.',
  path: '/',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
