// packages/common/src/shared/formatters/number.formatter.ts

/**
 * Opções de formatação de números
 */
export interface NumberFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

/**
 * Formata número com separadores de milhar brasileiros
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

  if (typeof num !== 'number' || isNaN(num)) {
    throw new Error('Valor deve ser um número válido');
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
  }).format(num);
};

/**
 * Formata número como inteiro (sem casas decimais)
 */
export const formatInteger = (num: number): string => {
  return formatNumber(num, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Formata número com precisão específica
 */
export const formatDecimal = (num: number, precision: number): string => {
  return formatNumber(num, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

/**
 * Formata números grandes com sufixos (K, M, B)
 */
export const formatCompactNumber = (num: number, locale = 'pt-BR'): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new Error('Valor deve ser um número válido');
  }

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

/**
 * Formata número ordinal (1º, 2º, 3º...) - implementação manual
 */
export const formatOrdinal = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num) || num < 1) {
    throw new Error('Valor deve ser um número inteiro positivo');
  }

  return `${num}º`;
};

/**
 * Formata número como fração
 */
export const formatFraction = (
  numerator: number,
  denominator: number
): string => {
  if (typeof numerator !== 'number' || typeof denominator !== 'number') {
    throw new Error('Numerador e denominador devem ser números válidos');
  }

  if (denominator === 0) {
    throw new Error('Denominador não pode ser zero');
  }

  // Simplifica a fração
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));

  const simpleNumerator = numerator / divisor;
  const simpleDenominator = denominator / divisor;

  return `${simpleNumerator}/${simpleDenominator}`;
};

/**
 * Formata range de números (ex: "10 - 50")
 */
export const formatNumberRange = (min: number, max: number): string => {
  const minFormatted = formatNumber(min);
  const maxFormatted = formatNumber(max);

  return `${minFormatted} - ${maxFormatted}`;
};

/**
 * Formata número com sinal explícito (+/-)
 */
export const formatNumberWithSign = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new Error('Valor deve ser um número válido');
  }

  const formatted = formatNumber(Math.abs(num));

  if (num > 0) {
    return `+${formatted}`;
  } else if (num < 0) {
    return `-${formatted}`;
  }

  return formatted;
};

/**
 * Converte número para texto por extenso (limitado)
 */
export const formatNumberToWords = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new Error('Valor deve ser um número válido');
  }

  const units = [
    '',
    'um',
    'dois',
    'três',
    'quatro',
    'cinco',
    'seis',
    'sete',
    'oito',
    'nove',
  ];
  const teens = [
    'dez',
    'onze',
    'doze',
    'treze',
    'quatorze',
    'quinze',
    'dezesseis',
    'dezessete',
    'dezoito',
    'dezenove',
  ];
  const tens = [
    '',
    '',
    'vinte',
    'trinta',
    'quarenta',
    'cinquenta',
    'sessenta',
    'setenta',
    'oitenta',
    'noventa',
  ];

  if (num === 0) return 'zero';
  if (num < 0) return `menos ${formatNumberToWords(-num)}`;
  if (num >= 1000) return formatCompactNumber(num);

  let result = '';

  // Centenas
  if (num >= 100) {
    const hundreds = Math.floor(num / 100);
    if (hundreds === 1) {
      result += 'cem';
    } else {
      result += `${units[hundreds]}centos`;
    }
    num %= 100;
    if (num > 0) result += ' e ';
  }

  // Dezenas e unidades
  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) result += ` e ${units[num]}`;
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += units[num];
  }

  return result;
};
