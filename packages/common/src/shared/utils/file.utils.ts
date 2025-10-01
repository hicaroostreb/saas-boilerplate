// packages/common/src/shared/utils/file.utils.ts

/**
 * Informações sobre um arquivo
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
}

/**
 * Opções para formatação de tamanho de arquivo
 */
export interface FileSizeOptions {
  precision?: number;
  separator?: string;
  units?: 'binary' | 'decimal';
}

/**
 * Formata tamanho de arquivo em bytes para formato legível
 */
export const formatFileSize = (
  bytes: number,
  options: FileSizeOptions = {}
): string => {
  const { precision = 2, separator = ' ', units = 'binary' } = options;

  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    throw new Error('Tamanho deve ser um número não negativo');
  }

  if (bytes === 0) return `0${separator}Bytes`;

  const base = units === 'binary' ? 1024 : 1000;
  const sizes =
    units === 'binary'
      ? ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
      : ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(base));
  const size = bytes / Math.pow(base, i);

  return `${size.toFixed(precision)}${separator}${sizes[i]}`;
};

/**
 * Extrai extensão de um nome de arquivo
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
  allowedTypes: string[]
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
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Texto
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',

    // Vídeo
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',

    // Áudio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',

    // Compactados
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
  };

  return mimeTypes[extension] ?? 'application/octet-stream';
};

/**
 * Verifica se o arquivo é uma imagem
 */
export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  return isValidFileType(fileName, imageExtensions);
};

/**
 * Verifica se o arquivo é um documento
 */
export const isDocumentFile = (fileName: string): boolean => {
  const documentExtensions = [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
  ];
  return isValidFileType(fileName, documentExtensions);
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
