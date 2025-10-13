/**
 * @fileoverview Utilitários para manipulação de arquivos
 * Funções helpers para upload e processamento de arquivos
 */

/**
 * Informações sobre um arquivo
 */
export interface FileInfo {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly extension: string;
}

/**
 * Opções para formatação de tamanho de arquivo
 */
export interface FileSizeOptions {
  readonly precision?: number;
  readonly separator?: string;
  readonly units?: 'binary' | 'decimal';
}

/**
 * Formata tamanho de arquivo em bytes para formato legível
 */
export const formatFileSize = (
  bytes: number,
  options: FileSizeOptions = {}
): string => {
  const { precision = 2, separator = ' ', units = 'binary' } = options;

  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes < 0) {
    throw new Error('Tamanho deve ser um número não negativo');
  }

  if (bytes === 0) {
    return `0${separator}Bytes`;
  }

  const base = units === 'binary' ? 1024 : 1000;
  const sizes =
    units === 'binary'
      ? ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
      : ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(base));
  const size = bytes / Math.pow(base, i);

  return `${size.toFixed(precision)}${separator}${sizes[i] ?? 'PB'}`;
};

/**
 * Extrai extensão de um nome de arquivo usando optional chaining
 */
export const getFileExtension = (fileName: string): string => {
  if (typeof fileName !== 'string') {
    throw new Error('Nome do arquivo deve ser uma string');
  }

  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.slice(lastDot + 1).toLowerCase();
};

/**
 * Remove extensão de um nome de arquivo
 */
export const getFileNameWithoutExtension = (fileName: string): string => {
  if (typeof fileName !== 'string') {
    throw new Error('Nome do arquivo deve ser uma string');
  }

  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? fileName : fileName.slice(0, lastDot);
};

/**
 * Valida se o arquivo é de um tipo permitido
 */
export const isValidFileType = (
  fileName: string,
  allowedTypes: readonly string[]
): boolean => {
  const extension = getFileExtension(fileName);
  return allowedTypes.map(type => type.toLowerCase()).includes(extension);
};

/**
 * Valida se o tamanho do arquivo está dentro do limite
 */
export const isValidFileSize = (fileSize: number, maxSize: number): boolean => {
  return typeof fileSize === 'number' && fileSize > 0 && fileSize <= maxSize;
};

/**
 * Sanitiza nome de arquivo removendo caracteres inválidos
 */
export const sanitizeFileName = (fileName: string): string => {
  if (typeof fileName !== 'string') {
    throw new Error('Nome do arquivo deve ser uma string');
  }

  return fileName
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/[\p{C}]/gu, '') // Remove caracteres de controle Unicode
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Gera nome único para arquivo adicionando timestamp
 */
export const generateUniqueFileName = (fileName: string): string => {
  const name = getFileNameWithoutExtension(fileName);
  const extension = getFileExtension(fileName);
  const timestamp = Date.now();

  return extension
    ? `${name}_${timestamp}.${extension}`
    : `${name}_${timestamp}`;
};

/**
 * Detecta tipo MIME baseado na extensão do arquivo
 */
export const getMimeType = (fileName: string): string => {
  const extension = getFileExtension(fileName);

  const mimeTypes: Record<string, string> = {
    // Imagens
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',

    // Documentos
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',

    // Compactados
    zip: 'application/zip',
    rar: 'application/vnd.rar',
  };

  return mimeTypes[extension] ?? 'application/octet-stream';
};

/**
 * Verifica se o arquivo é uma imagem
 */
export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'svg',
    'bmp',
  ] as const;
  return isValidFileType(fileName, imageExtensions);
};

/**
 * Cria objeto FileInfo a partir de nome e tamanho
 */
export const createFileInfo = (name: string, size: number): FileInfo => {
  return {
    name: sanitizeFileName(name),
    size,
    type: getMimeType(name),
    extension: getFileExtension(name),
  };
};
