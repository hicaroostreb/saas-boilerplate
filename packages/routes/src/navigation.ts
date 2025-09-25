// Navigation structure for UI components
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  badge?: string;
}

export const mainNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
  },
  {
    title: 'Teams',
    href: '/dashboard/teams',
    icon: 'teams',
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: 'settings',
  },
  {
    title: 'Cobrança',
    href: '/dashboard/billing',
    icon: 'billing',
  },
];

export const settingsNavigation: NavItem[] = [
  {
    title: 'Perfil',
    href: '/dashboard/settings',
    icon: 'user',
  },
  {
    title: 'Segurança',
    href: '/dashboard/settings/security',
    icon: 'shield',
  },
  {
    title: 'Notificações',
    href: '/dashboard/settings/notifications',
    icon: 'bell',
  },
  {
    title: 'Preferências',
    href: '/dashboard/settings/preferences',
    icon: 'settings',
  },
];

export const teamNavigation = (teamId: string): NavItem[] => [
  {
    title: 'Visão Geral',
    href: `/dashboard/teams/${teamId}`,
    icon: 'overview',
  },
  {
    title: 'Membros',
    href: `/dashboard/teams/${teamId}/members`,
    icon: 'users',
  },
  {
    title: 'Configurações',
    href: `/dashboard/teams/${teamId}/settings`,
    icon: 'settings',
  },
  {
    title: 'Atividade',
    href: `/dashboard/teams/${teamId}/activity`,
    icon: 'activity',
  },
];
