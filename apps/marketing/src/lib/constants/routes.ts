const getDashboardUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar o domínio do dashboard
    return (
      process.env.NEXT_PUBLIC_DASHBOARD_URL_PROD ??
      'https://dashboard.seudominio.com'
    );
  }
  // Em desenvolvimento, usar localhost:3001 (onde está o Auth.js)
  return process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3001';
};

const DASHBOARD_URL = getDashboardUrl();

export const routes = {
  home: '/',
  pricing: '/pricing',
  about: '/about',
  contact: '/contact',
  dashboard: DASHBOARD_URL,
  auth: {
    signIn: `${DASHBOARD_URL}/auth/sign-in`,
    signUp: `${DASHBOARD_URL}/auth/sign-up`,
  },
  marketing: {
    pricing: '/pricing',
    contact: '/contact',
    about: '/about',
  },
} as const;
