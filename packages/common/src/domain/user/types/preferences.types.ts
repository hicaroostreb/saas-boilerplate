// packages/common/src/domain/user/types/preferences.types.ts

/**
 * Temas disponíveis para interface
 */
export type UserTheme = 'light' | 'dark' | 'system';

/**
 * Idiomas suportados
 */
export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES';

/**
 * Frequência de notificações
 */
export type NotificationFrequency = 'immediate' | 'daily' | 'weekly' | 'never';

/**
 * Tipos de notificação disponíveis
 */
export type NotificationType =
  | 'team_invitation'
  | 'payment_success'
  | 'payment_failed'
  | 'plan_changed'
  | 'security_alert'
  | 'product_updates'
  | 'marketing';

/**
 * Configurações de notificação por tipo
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  frequency: NotificationFrequency;
}

/**
 * Preferências gerais do usuário
 */
export interface UserPreferences {
  theme: UserTheme;
  language: SupportedLanguage;
  timezone: string;
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  timeFormat: '12h' | '24h';
  emailNotifications: boolean;
  marketingEmails: boolean;
}

/**
 * Configurações completas de notificação
 */
export interface UserNotificationPreferences {
  notifications: Record<NotificationType, NotificationSettings>;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
  summaryEmail: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6, only for weekly
    dayOfMonth?: number; // 1-31, only for monthly
  };
}

/**
 * Configurações de privacidade
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'team_members' | 'private';
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  shareUsageData: boolean;
  shareAnalytics: boolean;
}

/**
 * Preferências completas do usuário
 */
export interface CompleteUserPreferences extends UserPreferences {
  notifications: UserNotificationPreferences;
  privacy: PrivacySettings;
  updatedAt: Date;
}
