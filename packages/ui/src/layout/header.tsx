"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "../lib/utils";

interface HeaderProps {
  logoText?: string;
  signInUrl?: string;
  signUpUrl?: string;
  className?: string;
}

export function Header({
  logoText = "Acme",
  signInUrl = "/auth/sign-in",
  signUpUrl = "/auth/sign-up",
  className
}: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    
    // ÚNICA MUDANÇA: Adicionar background preto/branco
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.style.backgroundColor = '#000000';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.style.backgroundColor = '#ffffff';
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownToggle = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <section className={cn("sticky inset-x-0 top-0 z-40 border-b bg-background py-4", className)}>
      <div className="container mx-auto max-w-7xl px-4">
        {/* Desktop Navigation */}
        <nav className="hidden justify-between lg:flex">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-x-9">
            {/* Logo */}
            <a className="flex items-center gap-2" href="/">
              <div className="flex items-center space-x-2">
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
                <span className="font-bold">{logoText}</span>
              </div>
            </a>

            {/* Desktop Menu */}
            <div className="flex items-center">
              <nav aria-label="Main" className="relative z-10 flex max-w-max flex-1 items-center justify-center">
                <div className="relative">
                  <ul className="group flex flex-1 list-none items-center justify-center space-x-1">
                    {/* Product Dropdown */}
                    <li>
                      <button
                        onClick={() => handleDropdownToggle("product")}
                        className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 rounded-xl text-[15px] font-normal"
                        aria-expanded={openDropdown === "product"}
                      >
                        Product
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
                          className={`lucide lucide-chevron-down relative top-px ml-1 size-3 transition duration-300 ${
                            openDropdown === "product" ? "rotate-180" : ""
                          }`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </li>

                    {/* Resources Dropdown */}
                    <li>
                      <button
                        onClick={() => handleDropdownToggle("resources")}
                        className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 rounded-xl text-[15px] font-normal"
                        aria-expanded={openDropdown === "resources"}
                      >
                        Resources
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
                          className={`lucide lucide-chevron-down relative top-px ml-1 size-3 transition duration-300 ${
                            openDropdown === "resources" ? "rotate-180" : ""
                          }`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </li>

                    {/* Regular Navigation Links */}
                    <li>
                      <a
                        className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 rounded-xl text-[15px] font-normal"
                        href="/pricing"
                      >
                        Pricing
                      </a>
                    </li>

                    <li>
                      <a
                        className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 rounded-xl text-[15px] font-normal"
                        href="/blog"
                      >
                        Blog
                      </a>
                    </li>

                    <li>
                      <a
                        className="group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 rounded-xl text-[15px] font-normal"
                        href="/story"
                      >
                        Story
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>

          {/* Right Side - Theme Toggle + Auth Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground size-9 bg-background rounded-xl border-none shadow-none"
            >
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
                className={`lucide lucide-sun size-5 transition-all ${
                  isDarkMode ? "-rotate-90 scale-0" : "rotate-0 scale-100"
                }`}
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
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
                className={`lucide lucide-moon absolute size-5 transition-all ${
                  isDarkMode ? "rotate-0 scale-100" : "rotate-90 scale-0"
                }`}
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
              <span className="sr-only">Toggle theme</span>
            </button>

            {/* Sign In Button */}
            <a
              className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-xl"
              href={signInUrl}
            >
              Sign in
            </a>

            {/* Sign Up Button */}
            <a
              className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-xl"
              href={signUpUrl}
            >
              Start for free
            </a>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center justify-between lg:hidden">
          {/* Mobile Logo */}
          <a href="/">
            <div className="flex items-center space-x-2">
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
              <span className="font-bold">{logoText}</span>
            </div>
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9 flex aspect-square h-fit select-none flex-col items-center justify-center rounded-full"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle Mobile Menu"
          >
            <div
              className="w-5 origin-center border-t-2 border-primary"
              style={{
                transform: isMobileMenuOpen ? "translateY(0px) rotate(45deg)" : "translateY(-3px)",
              }}
            />
            <div
              className="w-5 origin-center border-t-2 border-primary"
              style={{
                transform: isMobileMenuOpen ? "translateY(0px) rotate(-45deg)" : "translateY(3px)",
              }}
            />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              <a
                href="/pricing"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="/blog"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </a>
              <a
                href="/story"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Story
              </a>
              <div className="flex gap-2 px-3 py-2">
                <a
                  href={signInUrl}
                  className="flex-1 text-center inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </a>
                <a
                  href={signUpUrl}
                  className="flex-1 text-center inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start for free
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
