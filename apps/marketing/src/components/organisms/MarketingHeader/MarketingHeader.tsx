'use client';

import { Logo } from '@components/atoms/Logo';
import { routes } from '@lib/constants/routes';
import { Button, ThemeToggle } from '@workspace/ui';
import { ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

interface MarketingHeaderProps {
  logoText?: string;
  signInUrl?: string;
  signUpUrl?: string;
}

const navigationItems: NavItem[] = [
  {
    label: 'Product',
    children: [
      { label: 'Features', href: '/features' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'API', href: '/api' },
    ],
  },
  {
    label: 'Resources',
    children: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community' },
    ],
  },
  { label: 'Pricing', href: routes.marketing.pricing },
  { label: 'Blog', href: routes.marketing.blog },
  { label: 'Story', href: routes.marketing.story },
];

export const MarketingHeader = ({
  logoText = 'Acme',
  signInUrl = routes.auth.signIn,
  signUpUrl = routes.auth.signUp,
}: MarketingHeaderProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky inset-x-0 top-0 z-40 border-b bg-background py-4">
      <div className="container">
        <nav className="hidden justify-between lg:flex">
          {/* Logo + Navigation */}
          <div className="flex items-center gap-x-9">
            <Logo text={logoText} />

            <div className="flex items-center">
              <ul className="flex items-center space-x-1">
                {navigationItems.map(item => (
                  <li key={item.label}>
                    {item.children ? (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === item.label ? null : item.label
                            )
                          }
                          className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-xl text-[15px] font-normal"
                        >
                          {item.label}
                          <ChevronDown
                            className={`relative top-px ml-1 size-3 transition duration-300 ${
                              openDropdown === item.label ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {openDropdown === item.label && (
                          <div className="absolute left-0 top-full mt-1 w-48 rounded-md border bg-background shadow-lg">
                            <div className="py-1">
                              {item.children.map(child => (
                                <Link
                                  key={child.label}
                                  href={child.href ?? '#'}
                                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href ?? '#'}
                        className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-xl text-[15px] font-normal"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="rounded-xl">
              <a href={signInUrl}>Sign in</a>
            </Button>
            <Button variant="primary" size="sm" className="rounded-xl">
              <a href={signUpUrl}>Start for free</a>
            </Button>
          </div>
        </nav>

        {/* Mobile Layout */}
        <div className="flex items-center justify-between lg:hidden">
          <Logo text={logoText} />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9 flex aspect-square h-fit select-none flex-col items-center justify-center rounded-full"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="pt-4 pb-2 space-y-2">
              {navigationItems.map(item => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === item.label ? null : item.label
                          )
                        }
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-md flex items-center justify-between"
                      >
                        {item.label}
                        <ChevronDown
                          className={`size-3 transition duration-300 ${
                            openDropdown === item.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openDropdown === item.label && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.children.map(child => (
                            <Link
                              key={child.label}
                              href={child.href ?? '#'}
                              className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md"
                              onClick={() => {
                                setOpenDropdown(null);
                                setMobileMenuOpen(false);
                              }}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href ?? '#'}
                      className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 space-y-2">
                <a
                  href={signInUrl}
                  className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                >
                  Sign in
                </a>
                <a
                  href={signUpUrl}
                  className="block px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
                >
                  Start for free
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
