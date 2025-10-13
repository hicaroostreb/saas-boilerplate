/**
 * @fileoverview Utilitários para manipulação de números e moedas
 * Funções helpers para formatação, cálculos numéricos e moedas
 */

/**
 * Opções de formatação de moeda
 */
export interface CurrencyOptions {
  readonly currency?: string;
  readonly locale?: string;
  readonly minimumFractionDigits?: number;
  readonly maximumFractionDigits?: number;
  readonly showSymbol?: boolean;
}

/**
 * Opções de formatação de números
 */
export interface NumberFormatOptions {
  readonly locale?: string;
  readonly minimumFractionDigits?: number;
  readonly maximumFractionDigits?: number;
  readonly useGrouping?: boolean;
}

/**
 * Formata valor como moeda usando optional chaining e nullish coalescing
 */
export const formatCurrency = (
  amount: number,
  options: CurrencyOptions = {}
): string => {
  const {
    currency = 'BRL',
    locale = 'pt-BR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options;

  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    throw new Error('Valor deve ser um número válido');
  }

  return new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? currency : undefined,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};

/**
 * Formata valor em dólar americano
 */
export const formatUSD = (amount: number): string => {
  return formatCurrency(amount, {
    currency: 'USD',
    locale: 'en-US',
  });
};

/**
 * Formata valor em euro
 */
export const formatEUR = (amount: number): string => {
  return formatCurrency(amount, {
    currency: 'EUR',
    locale: 'de-DE',
  });
};

/**
 * Formata número com separadores de milhar
 */
export const formatNumber = (
  num: number,
  options: NumberFormatOptions = {}
): string => {
  const {
    locale = 'pt-BR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true,
  } = options;

  if (typeof num !== 'number' || Number.isNaN(num)) {
    throw new Error('Valor deve ser um número válido');
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
  }).format(num);
};

/**
 * Formata número como inteiro
 */
export const formatInteger = (num: number): string => {
  return formatNumber(num, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Formata números grandes com sufixos (K, M, B)
 */
export const formatCompactNumber = (num: number, locale = 'pt-BR'): string => {
  if (typeof num !== 'number' || Number.isNaN(num)) {
    throw new Error('Valor deve ser um número válido');
  }

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

/**
 * Formata valor como porcentagem
 */
export const formatPercentage = (
  value: number,
  options: { readonly locale?: string; readonly decimals?: number } = {}
): string => {
  const { locale = 'pt-BR', decimals = 2 } = options;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error('Valor deve ser um número válido');
  }

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Converte centavos para reais formatados
 */
export const formatCentsToReais = (cents: number): string => {
  if (typeof cents !== 'number' || Number.isNaN(cents)) {
    throw new Error('Valor deve ser um número válido');
  }

  return formatCurrency(cents / 100);
};
