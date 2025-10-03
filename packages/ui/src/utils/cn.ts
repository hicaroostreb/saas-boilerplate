import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Enterprise utility para merge inteligente de classes CSS
 *
 * Combina a flexibilidade do clsx (condicionais) com o poder do tailwind-merge
 * (resolução de conflitos de classes Tailwind CSS).
 *
 * @example
 * ```
 * // Condicionais simples
 * cn('base-class', isActive && 'active-class')
 *
 * // Condicionais com objeto
 * cn('base-class', {
 *   'active-class': isActive,
 *   'disabled-class': isDisabled
 * })
 *
 * // Resolução de conflitos Tailwind
 * cn('bg-red-500 px-2', 'bg-blue-500 px-4') // Result: 'bg-blue-500 px-4'
 * ```
 *
 * @param inputs - Classes CSS, condicionais ou objetos de classes
 * @returns String com classes merged e conflitos resolvidos
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Variante do cn() otimizada para performance quando não há conflitos
 * Usa apenas clsx, mais rápido mas sem resolução de conflitos Tailwind
 */
export function cnFast(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Utility para criar variantes de componentes usando design tokens
 *
 * @example
 * ```
 * const buttonVariants = createVariants({
 *   base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors',
 *   variants: {
 *     variant: {
 *       primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
 *       secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
 *     },
 *     size: {
 *       sm: 'h-9 px-3 text-sm',
 *       md: 'h-10 px-4 py-2',
 *       lg: 'h-11 px-8 text-lg'
 *     }
 *   },
 *   defaultVariants: {
 *     variant: 'primary',
 *     size: 'md'
 *   }
 * });
 * ```
 */
export function createVariants<
  T extends Record<string, Record<string, string>>,
>(config: {
  base?: string;
  variants?: T;
  defaultVariants?: {
    [K in keyof T]?: keyof T[K];
  };
}) {
  return function getVariantClasses(
    props: {
      [K in keyof T]?: keyof T[K];
    } & {
      className?: string;
    } = {}
  ): string {
    const { className, ...variantProps } = props;

    const classes: string[] = [];

    // Add base classes
    if (config.base) {
      classes.push(config.base);
    }

    // Add variant classes - CORREÇÃO DEFINITIVA SEM ANY
    if (config.variants) {
      for (const [variantKey, variantValues] of Object.entries(
        config.variants
      )) {
        const selectedVariant =
          variantProps[variantKey as keyof typeof variantProps] ||
          config.defaultVariants?.[variantKey as keyof T];

        if (selectedVariant && typeof selectedVariant === 'string') {
          const variantClass = variantValues[selectedVariant];
          if (variantClass) {
            classes.push(variantClass);
          }
        }
      }
    }

    // Add custom className with highest priority
    if (className) {
      classes.push(className);
    }

    return cn(...classes);
  };
}

/**
 * Utility para aplicar focus ring enterprise padrão
 */
export function focusRing(className?: string): string {
  return cn(
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    className
  );
}

/**
 * Utility para estados interativos (hover, focus, active)
 */
export function interactive(className?: string): string {
  return cn(
    'transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    className
  );
}

/**
 * Utility para estado disabled
 */
export function disabled(isDisabled: boolean, className?: string): string {
  return cn(isDisabled && 'pointer-events-none opacity-50', className);
}

// Export default para compatibilidade
export default cn;

// Re-export tipos úteis
export type { ClassValue } from 'clsx';
