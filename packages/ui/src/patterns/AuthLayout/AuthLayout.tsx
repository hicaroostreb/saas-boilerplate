'use client';

import { ThemeToggle } from '../../primitives/ThemeToggle';

export interface AuthLayoutProps {
  children: React.ReactNode;
  logoHref?: string;
  logoText?: string;
}

export const AuthLayout = ({
  children,
  logoHref = '/',
  logoText = 'Acme',
}: AuthLayoutProps) => {
  return (
    <main className="h-screen dark:bg-background bg-gray-50 px-4">
      <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
        <a className="block w-fit mx-auto" href={logoHref}>
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
        {children}
        <ThemeToggle className="fixed bottom-2 right-2 rounded-full" />
      </div>
    </main>
  );
};
