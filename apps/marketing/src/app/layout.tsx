import { generateSeoMetadata } from '@lib/seo/metadata';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata: Metadata = generateSeoMetadata({
  title: 'Your revolutionary Next.js SaaS - Achromatic Demo',
  description:
    'This is a demo application built with Achromatic. It will save you time and effort building your next SaaS.',
  path: '/',
});

/**
 * RootLayout - Single Responsibility: Document structure, theme provider e CSS
 *
 * Follows SOLID principles:
 * - SRP: Apenas HTML structure, theme provider e global styles
 * - OCP: Extensível via children e providers
 * - DIP: Depende de abstrações (ThemeProvider, metadata)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="size-full">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                let e = document.documentElement, t = "theme", r = "light", n = "dark";
                function c(o) {
                  e.classList.remove(r, n);
                  e.classList.add(o);
                  e.setAttribute("data-theme", o);
                  e.style.colorScheme = o;
                }
                try {
                  let o = localStorage.getItem(t) || "system";
                  if (o === "system") {
                    let s = window.matchMedia("(prefers-color-scheme: dark)").matches ? n : r;
                    c(s);
                  } else {
                    c(o);
                  }
                } catch (e) {
                  c(r);
                }
              })();
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
