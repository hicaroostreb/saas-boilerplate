// apps/marketing/src/components/molecules/MobileMenuToggle/MobileMenuToggle.tsx
'use client';

export interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const MobileMenuToggle = ({
  isOpen,
  onToggle,
  className,
}: MobileMenuToggleProps) => {
  const classes = `text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9 flex aspect-square h-fit select-none flex-col items-center justify-center rounded-full ${className ?? ''}`;

  return (
    <button
      onClick={onToggle}
      className={classes}
      aria-expanded={isOpen}
      aria-label="Toggle Mobile Menu"
    >
      <div
        className="w-5 origin-center border-t-2 border-primary"
        style={{ transform: 'translateY(-3px)' }}
      />
      <div
        className="w-5 origin-center border-t-2 border-primary"
        style={{ transform: 'translateY(3px)' }}
      />
    </button>
  );
};
