'use client';

import * as React from 'react';
import { Button } from '../../primitives/Button';
import { cn } from '../../utils/cn';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string | number;
}

export interface NavigationProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Flexible Navigation component for various navigation patterns
 *
 * @example
 * ```
 * const navigationItems: NavigationItem[] = [
 *   {
 *     id: 'dashboard',
 *     label: 'Dashboard',
 *     href: '/dashboard',
 *     icon: <DashboardIcon />,
 *     active: true
 *   },
 *   {
 *     id: 'settings',
 *     label: 'Settings',
 *     href: '/settings',
 *     icon: <SettingsIcon />,
 *     badge: 3
 *   }
 * ];
 *
 * function Sidebar() {
 *   return (
 *     <Navigation
 *       items={navigationItems}
 *       orientation="vertical"
 *       onItemClick={(item) => console.log('Clicked:', item.label)}
 *     />
 *   );
 * }
 * ```
 */
export function Navigation({
  items,
  onItemClick,
  orientation = 'horizontal',
  className,
}: NavigationProps): JSX.Element {
  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal'
          ? 'flex-row space-x-1'
          : 'flex-col space-y-1',
        className
      )}
    >
      {items.map(item => (
        <NavigationItemComponent
          key={item.id}
          item={item}
          onClick={onItemClick || undefined}
        />
      ))}
    </nav>
  );
}

function NavigationItemComponent({
  item,
  onClick,
}: {
  item: NavigationItem;
  onClick?: (item: NavigationItem) => void;
}): JSX.Element {
  const handleClick = (): void => {
    onClick?.(item);
  };

  return (
    <Button
      variant={item.active ? 'secondary' : 'ghost'}
      className={cn(
        'justify-start',
        item.active && 'bg-accent text-accent-foreground'
      )}
      onClick={handleClick}
    >
      {item.icon && <span className="mr-2">{item.icon}</span>}
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
          {item.badge}
        </span>
      )}
    </Button>
  );
}
