import type { Metadata } from 'next';

export function generateSeoMetadata(options: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  return {
    title: options.title,
    description: options.description,
    openGraph: {
      title: options.title,
      description: options.description,
      type: 'website',
    },
  };
}
