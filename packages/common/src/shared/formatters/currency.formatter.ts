// packages/common/src/shared/formatters/currency.formatter.ts

/**
 * Opções de formatação de moeda
 */
export interface CurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
}

/**
 * Formata valor como moeda brasileira (R$)
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

  if (typeof amount !== 'number' || isNaN(amount)) {
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
 * Formata valor sem símbolo de moeda (apenas número formatado)
 */
export const formatCurrencyValue = (amount: number): string => {
  return formatCurrency(amount, { showSymbol: false });
};

/**
 * Formata valor como porcentagem
 */
export const formatPercentage = (
  value: number,
  options: { locale?: string; decimals?: number } = {}
): string => {
  const { locale = 'pt-BR', decimals = 2 } = options;

  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Valor deve ser um número válido');
  }

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Formata desconto (ex: "-R$ 10,00" ou "R$ 10,00 OFF")
 */
export const formatDiscount = (
  amount: number,
  options: { style?: 'negative' | 'suffix'; currency?: string } = {}
): string => {
  const { style = 'negative', currency = 'BRL' } = options;

  const formattedAmount = formatCurrency(Math.abs(amount), { currency });

  if (style === 'suffix') {
    return `${formattedAmount} OFF`;
  }

  return `-${formattedAmount}`;
};

/**
 * Converte centavos para reais formatados
 */
export const formatCentsToReais = (cents: number): string => {
  if (typeof cents !== 'number' || isNaN(cents)) {
    throw new Error('Valor deve ser um número válido');
  }

  return formatCurrency(cents / 100);
};

/**
 * Formata range de valores (ex: "R$ 10,00 - R$ 50,00")
 */
export const formatCurrencyRange = (
  min: number,
  max: number,
  currency = 'BRL'
): string => {
  const minFormatted = formatCurrency(min, { currency });
  const maxFormatted = formatCurrency(max, { currency });

  return `${minFormatted} - ${maxFormatted}`;
};
