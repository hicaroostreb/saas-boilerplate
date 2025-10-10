'use client';

import { routes } from '@lib/constants/routes';
import { ThemeToggle } from '@workspace/ui';
import Link from 'next/link';
import { useState } from 'react';

export interface MarketingHeaderProps {
  className?: string;
}

export const MarketingHeader = ({ className }: MarketingHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section
      className={`sticky inset-x-0 top-0 z-40 border-b bg-background py-4 ${className ?? ''}`}
    >
      <div className="container">
        {/* Desktop Navigation */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-x-9">
            {/* Logo - MESMO PADRÃO DO AuthLayout */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex size-9 items-center justify-center p-1">
                <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g>
                      <path
                        d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z"
                        fill="currentColor"
                      />
                      <path
                        d="M4.32142 15.3572L8.44635 24H-1.14809e-06L4.32142 15.3572Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </div>
              </div>
              <span className="font-bold">Acme</span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center">
              <nav
                aria-label="Main"
                data-orientation="horizontal"
                dir="ltr"
                className="relative z-10 flex max-w-max flex-1 items-center justify-center"
              >
                <div style={{ position: 'relative' }}>
                  <ul
                    data-orientation="horizontal"
                    className="group flex flex-1 list-none items-center justify-center space-x-1"
                    dir="ltr"
                  >
                    {/* Pricing Link */}
                    <li>
                      <Link
                        className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 rounded-xl text-[15px] font-normal data-[active]:bg-accent"
                        href={routes.marketing.pricing}
                      >
                        Pricing
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2">
            {/* ThemeToggle - MESMO PADRÃO DO AuthLayout (rounded-full) */}
            <ThemeToggle className="rounded-full" />

            <Link
              className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-xl"
              href={routes.auth.signIn}
            >
              Sign In
            </Link>

            <Link
              className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-xl"
              href={routes.auth.signUp}
            >
              Start for free
            </Link>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center justify-between lg:hidden">
          {/* Mobile Logo - MESMO PADRÃO */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex size-9 items-center justify-center p-1">
              <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <path
                      d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z"
                      fill="currentColor"
                    />
                    <path
                      d="M4.32142 15.3572L8.44635 24H-1.14809e-06L4.32142 15.3572Z"
                      fill="currentColor"
                    />
                  </g>
                </svg>
              </div>
            </div>
            <span className="font-bold">Acme</span>
          </Link>

          <button
            className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9 flex aspect-square h-fit select-none flex-col items-center justify-center rounded-full"
            aria-expanded="false"
            aria-label="Toggle Mobile Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div
              className="w-5 origin-center border-t-2 border-primary"
              style={{ transform: 'translateY(-3px)' }}
            ></div>
            <div
              className="w-5 origin-center border-t-2 border-primary"
              style={{ transform: 'translateY(3px)' }}
            ></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 border-t pt-4">
            <div className="space-y-2">
              <Link
                href={routes.marketing.pricing}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
              >
                Pricing
              </Link>

              <div className="pt-2 border-t space-y-2">
                <Link
                  href={routes.auth.signIn}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-3 py-2 text-center text-base font-medium border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href={routes.auth.signUp}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-3 py-2 text-center text-base font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
