'use client';

import { routes } from '@lib/constants/routes';

export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  announcement?: {
    text: string;
    href?: string;
  };
  primaryAction?: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
}

/**
 * HeroSection - Single Responsibility: Render hero with CTA
 *
 * Follows SOLID principles:
 * - SRP: Only handles hero content display
 * - OCP: Extensible via props without modification
 * - LSP: Different hero variants can substitute this one
 * - ISP: Clean interface with optional props
 * - DIP: Depends on Button abstraction, not implementations
 */
export const HeroSection = ({
  title = 'Your revolutionary\nNext.js SaaS',
  subtitle = 'This is a demo application built with Next.JS. It will save you time and effort building your next SaaS.',
  announcement = {
    text: 'Put an announcement here 🎉',
    href: '#',
  },
  primaryAction = {
    text: 'Start for free',
    href: routes.auth.signUp,
  },
  secondaryAction = {
    text: 'Talk to sales',
    href: routes.marketing.contact ?? '#',
  },
}: HeroSectionProps) => {
  return (
    <section className="overflow-x-hidden">
      <div className="px-2 sm:container">
        <div className="relative grid">
          {/* Template exact grid lines */}
          <div className="absolute inset-y-0 block w-px bg-border"></div>
          <div className="absolute inset-y-0 right-0 w-px bg-border"></div>

          <div className="mx-auto mt-16 flex max-w-4xl flex-col gap-6 px-2 sm:mt-20 sm:px-1 md:mt-24 lg:mt-32">
            <div className="gap-2">
              {/* Announcement Banner - Template exact */}
              <div
                className="flex items-center justify-center"
                style={{ filter: 'blur(0px)', opacity: 1, transform: 'none' }}
              >
                <a href={announcement.href}>
                  <div className="inline-flex items-center border py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground group h-8 rounded-full px-3 text-xs font-medium shadow-sm duration-200 hover:bg-accent/50 sm:text-sm">
                    <div className="w-fit py-0.5 text-center text-xs text-blue-500 sm:text-sm">
                      New!
                    </div>
                    <div
                      data-orientation="vertical"
                      role="none"
                      className="shrink-0 bg-border h-full w-px mx-2"
                    ></div>
                    {announcement.text}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-chevron-right ml-1.5 size-3 shrink-0 text-foreground transition-transform group-hover:translate-x-0.5"
                    >
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                  </div>
                </a>
              </div>

              {/* Title - Template exact classes */}
              <div
                style={{ filter: 'blur(0px)', opacity: 1, transform: 'none' }}
              >
                <h1 className="mt-6 text-center text-[48px] font-bold leading-[54px] tracking-[-1.2px] [font-kerning:none] sm:text-[56px] md:text-[64px] lg:text-[76px] lg:leading-[74px] lg:tracking-[-2px]">
                  {title.split('\n').map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
              </div>
            </div>

            {/* Subtitle - Template exact */}
            <p
              className="mx-auto mt-3 max-w-[560px] text-balance text-center text-lg leading-[26px] text-muted-foreground sm:text-xl lg:mt-6"
              style={{ opacity: 1, transform: 'none' }}
            >
              {subtitle}
            </p>

            {/* CTA Buttons - Template exact */}
            <div
              className="mx-auto flex w-full flex-col gap-2 px-7 sm:w-auto sm:flex-row sm:px-0"
              style={{ opacity: 1, transform: 'none' }}
            >
              <a
                className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 px-4 py-2 h-10 rounded-xl sm:h-9"
                href={primaryAction.href}
              >
                {primaryAction.text}
              </a>
              <a
                className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2 h-10 rounded-xl sm:h-9"
                href={secondaryAction.href}
              >
                {secondaryAction.text}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Template exact bottom border */}
      <div className="h-px w-full bg-border"></div>
    </section>
  );
};
