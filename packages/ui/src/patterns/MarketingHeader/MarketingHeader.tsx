'use client';

import { useState } from 'react';
import { ThemeToggle } from '../../primitives/ThemeToggle';
import { cn } from '../../utils/cn';

export interface MarketingHeaderProps {
  logoText?: string;
  signInUrl?: string;
  signUpUrl?: string;
  className?: string;
}

/**
 * MarketingHeader component for marketing websites
 * Features responsive navigation, theme toggle, and auth buttons
 *
 * @example
 * ```
 * function MarketingPage() {
 *   return (
 *     <MarketingHeader
 *       logoText="Acme Corp"
 *       signInUrl="/auth/sign-in"
 *       signUpUrl="/auth/sign-up"
 *     />
 *   );
 * }
 * ```
 */
export function MarketingHeader({
  logoText = 'Acme',
  signInUrl = '/auth/sign-in',
  signUpUrl = '/auth/sign-up',
  className,
}: MarketingHeaderProps): JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownToggle = (dropdown: string): void => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <section
      className={cn(
        'sticky inset-x-0 top-0 z-40 border-b bg-background py-4',
        className
      )}
    >
      <div className="container mx-auto max-w-7xl px-4">
        {/* Desktop Navigation */}
        <nav className="hidden justify-between lg:flex">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-x-9">
            {/* Logo */}
            <Logo logoText={logoText} />

            {/* Desktop Menu */}
            <div className="flex items-center">
              <nav
                aria-label="Main"
                className="relative z-10 flex max-w-max flex-1 items-center justify-center"
              >
                <div className="relative">
                  <ul className="group flex flex-1 list-none items-center justify-center space-x-1">
                    <DropdownItem
                      label="Product"
                      isOpen={openDropdown === 'product'}
                      onToggle={() => handleDropdownToggle('product')}
                    />
                    <DropdownItem
                      label="Resources"
                      isOpen={openDropdown === 'resources'}
                      onToggle={() => handleDropdownToggle('resources')}
                    />
                    <NavItem href="/pricing" label="Pricing" />
                    <NavItem href="/blog" label="Blog" />
                    <NavItem href="/story" label="Story" />
                  </ul>
                </div>
              </nav>
            </div>
          </div>

          {/* Right Side - Theme Toggle + Auth Buttons */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              <a href={signInUrl}>Sign in</a>
            </div>
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              <a href={signUpUrl}>Start for free</a>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center justify-between lg:hidden">
          <Logo logoText={logoText} />
          <MobileMenuToggle
            isOpen={isMobileMenuOpen}
            onToggle={toggleMobileMenu}
          />
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <MobileMenu
            signInUrl={signInUrl}
            signUpUrl={signUpUrl}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </section>
  );
}

// Sub-components
function Logo({ logoText }: { logoText: string }): JSX.Element {
  return (
    <a className="flex items-center gap-2" href="/">
      <div className="flex items-center space-x-2">
        <div className="flex size-9 items-center justify-center p-1">
          <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z"
                fill="currentColor"
              />
              <path
                d="M4.32142 15.3572L8.44635 24H-1.14809e-06L4.32142 15.3572Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        <span className="font-bold">{logoText}</span>
      </div>
    </a>
  );
}

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}): JSX.Element {
  return (
    <li>
      <a
        className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-xl text-[15px] font-normal"
        href={href}
      >
        {label}
      </a>
    </li>
  );
}

function DropdownItem({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}): JSX.Element {
  return (
    <li>
      <button
        onClick={onToggle}
        className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 rounded-xl text-[15px] font-normal"
        aria-expanded={isOpen}
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'relative top-px ml-1 size-3 transition duration-300',
            isOpen && 'rotate-180'
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </li>
  );
}

function MobileMenuToggle({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}): JSX.Element {
  return (
    <button
      onClick={onToggle}
      className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9 flex aspect-square h-fit select-none flex-col items-center justify-center rounded-full"
      aria-expanded={isOpen}
      aria-label="Toggle Mobile Menu"
    >
      <div
        className="w-5 origin-center border-t-2 border-primary"
        style={{
          transform: isOpen
            ? 'translateY(0px) rotate(45deg)'
            : 'translateY(-3px)',
        }}
      />
      <div
        className="w-5 origin-center border-t-2 border-primary"
        style={{
          transform: isOpen
            ? 'translateY(0px) rotate(-45deg)'
            : 'translateY(3px)',
        }}
      />
    </button>
  );
}

function MobileMenu({
  signInUrl,
  signUpUrl,
  onClose,
}: {
  signInUrl: string;
  signUpUrl: string;
  onClose: () => void;
}): JSX.Element {
  return (
    <div className="lg:hidden mt-4 border-t pt-4">
      <div className="flex flex-col space-y-2">
        <MobileNavItem href="/pricing" label="Pricing" onClick={onClose} />
        <MobileNavItem href="/blog" label="Blog" onClick={onClose} />
        <MobileNavItem href="/story" label="Story" onClick={onClose} />
        <div className="flex gap-2 px-3 py-2">
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1">
            <a href={signInUrl} onClick={onClose}>
              Sign in
            </a>
          </div>
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1">
            <a href={signUpUrl} onClick={onClose}>
              Start for free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileNavItem({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <a
      href={href}
      className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-md"
      onClick={onClick}
    >
      {label}
    </a>
  );
}
