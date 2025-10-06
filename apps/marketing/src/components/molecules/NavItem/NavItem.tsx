// apps/marketing/src/components/molecules/NavItem/NavItem.tsx
'use client';

export interface NavItemProps {
  label: string;
  href?: string;
  children?: Array<{ label: string; href: string }>;
  isOpen?: boolean;
  onToggle?: () => void;
  _onChildClick?: () => void;
}

export const NavItem = ({
  label,
  href,
  children,
  isOpen,
  onToggle,
  _onChildClick,
}: NavItemProps) => {
  const baseClasses =
    'group inline-flex h-9 w-max items-center justify-center bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 rounded-xl text-[15px] font-normal data-[active]:bg-accent';

  if (children) {
    return (
      <button
        onClick={onToggle}
        className={baseClasses}
        data-state={isOpen ? 'open' : 'closed'}
        aria-expanded={isOpen}
        data-radix-collection-item=""
      >
        {label}
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
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </button>
    );
  }

  return (
    <a href={href ?? '#'} className={baseClasses} data-radix-collection-item="">
      {label}
    </a>
  );
};
