// packages/common/src/shared/formatters/date.formatter.ts

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Converte string ou Date para objeto Date válido
 */
const toDate = (date: Date | string): Date => {
  if (typeof date === 'string') {
    // Tenta fazer parse ISO primeiro, depois parse normal
    const isoDate = parseISO(date);
    return isValid(isoDate) ? isoDate : new Date(date);
  }
  return date;
};

/**
 * Formata data no padrão brasileiro (dd/MM/yyyy)
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = toDate(date);
  if (!isValid(dateObj)) {
    throw new Error('Data inválida fornecida');
  }
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Formata data e hora no padrão brasileiro
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = toDate(date);
  if (!isValid(dateObj)) {
    throw new Error('Data inválida fornecida');
  }
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

/**
 * Formata data e hora com segundos
 */
export const formatDateTimeWithSeconds = (date: Date | string): string => {
  const dateObj = toDate(date);
  if (!isValid(dateObj)) {
    throw new Error('Data inválida fornecida');
  }
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
};

/**
 * Formata tempo relativo (ex: "há 2 dias")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = toDate(date);
  if (!isValid(dateObj)) {
    throw new Error('Data inválida fornecida');
  }
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ptBR,
  });
};

/**
 * Formata apenas a hora (HH:mm)
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = toDate(date);
  if (!isValid(dateObj)) {
    throw new Error('Data inválida fornecida');
  }
  return format(dateObj, 'HH:mm', { locale: ptBR });
};

/**
 * Formata data no formato ISO (yyyy-MM-dd)
 */
export const formatDateISO = (date: Date | string): string => {
  const dateObj = toDate(date);
  if (!isValid(dateObj)) {
    throw new Error('Data inválida fornecida');
  }
  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Formata data e hora no formato ISO completo
 */
export const formatDateTimeISO = (date: Date | string): string => {
  const dateObj = toDate(date);
  if (!isValid(dateObj)) {
    throw new Error('Data inválida fornecida');
  }
  return dateObj.toISOString();
};

/**
 * Formata mês e ano (ex: "Janeiro 2024")
 */
export const formatMonthYear = (date: Date | string): string => {
  const dateObj = toDate(date);
  if (!isValid(dateObj)) {
    throw new Error('Data inválida fornecida');
  }
  return format(dateObj, 'MMMM yyyy', { locale: ptBR });
};
