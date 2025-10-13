/**
 * @fileoverview Utilitários para manipulação de strings
 * Funções helpers para formatação e validação de texto
 */

/**
 * Capitaliza primeira letra de uma string
 */
export const capitalize = (str: string): string => {
  if (typeof str !== 'string' || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Trunca string adicionando reticências se necessário
 */
export const truncate = (str: string, maxLength: number): string => {
  if (typeof str !== 'string') {
    return str;
  }

  if (str.length <= maxLength) {
    return str;
  }

  return `${str.slice(0, maxLength - 3)}...`;
};

/**
 * Remove acentos de string
 */
export const removeAccents = (str: string): string => {
  if (typeof str !== 'string') {
    return str;
  }

  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Gera slug a partir de string
 */
export const slugify = (str: string): string => {
  if (typeof str !== 'string') {
    return '';
  }

  return removeAccents(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Máscara para CPF
 */
export const formatCPF = (cpf: string): string => {
  if (typeof cpf !== 'string') {
    return cpf;
  }

  const numbers = cpf.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Máscara para telefone brasileiro
 */
export const formatPhone = (phone: string): string => {
  if (typeof phone !== 'string') {
    return phone;
  }

  const numbers = phone.replace(/\D/g, '');

  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
};
