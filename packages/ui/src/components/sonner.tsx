'use client';

import { Toaster as SonnerToaster } from 'sonner';

interface ToasterProps {
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center';
  theme?: 'light' | 'dark' | 'system';
  richColors?: boolean;
  closeButton?: boolean;
  expand?: boolean;
  className?: string;
}

export function Toaster({
  position = 'bottom-right',
  theme = 'system',
  richColors = true,
  closeButton = true,
  expand = true,
  className,
  ...props
}: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      theme={theme}
      richColors={richColors}
      closeButton={closeButton}
      expand={expand}
      className={className}
      {...props}
    />
  );
}

// Re-export toast function para uso em server actions
export { toast } from 'sonner';
