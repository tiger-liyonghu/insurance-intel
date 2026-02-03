import crypto from 'crypto';

/**
 * Generate a hash of content for deduplication
 */
export function generateContentHash(content: string): string {
  // Normalize content: lowercase, remove extra whitespace
  const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 32);
}

/**
 * Detect language from text (simple heuristic)
 */
export function detectLanguage(text: string): string {
  // Chinese characters
  if (/[\u4e00-\u9fff]/.test(text)) {
    // Traditional vs Simplified (rough heuristic)
    if (/[\u7e41\u9ad4]/.test(text)) return 'zh-TW';
    return 'zh-CN';
  }

  // Japanese (Hiragana, Katakana)
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';

  // Korean
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';

  // Thai
  if (/[\u0e00-\u0e7f]/.test(text)) return 'th';

  // Arabic
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';

  // German (common characters)
  if (/[äöüß]/i.test(text)) return 'de';

  // French (common characters)
  if (/[éèêëàâùûçœæ]/i.test(text)) return 'fr';

  // Spanish (common characters)
  if (/[ñáéíóú¿¡]/i.test(text)) return 'es';

  // Portuguese
  if (/[ãõçáéíóú]/i.test(text)) return 'pt';

  // Default to English
  return 'en';
}

/**
 * Extract region from URL or content
 */
export function inferRegion(url: string, content: string): string {
  const urlLower = url.toLowerCase();
  const contentLower = content.toLowerCase();

  // URL-based detection
  if (urlLower.includes('.cn') || urlLower.includes('china')) return 'china';
  if (urlLower.includes('.hk') || urlLower.includes('hongkong')) return 'hong_kong';
  if (urlLower.includes('.tw') || urlLower.includes('taiwan')) return 'taiwan';
  if (urlLower.includes('.jp') || urlLower.includes('japan')) return 'japan';
  if (urlLower.includes('.kr') || urlLower.includes('korea')) return 'south_korea';
  if (urlLower.includes('.sg') || urlLower.includes('singapore')) return 'singapore';
  if (urlLower.includes('.in') || urlLower.includes('india')) return 'india';
  if (urlLower.includes('.uk') || urlLower.includes('britain')) return 'uk';
  if (urlLower.includes('.de') || urlLower.includes('germany')) return 'germany';
  if (urlLower.includes('.fr') || urlLower.includes('france')) return 'france';
  if (urlLower.includes('.au') || urlLower.includes('australia')) return 'australia';

  // Content-based detection (keywords)
  if (contentLower.includes('china') || contentLower.includes('中国')) return 'china';
  if (contentLower.includes('hong kong') || contentLower.includes('香港')) return 'hong_kong';
  if (contentLower.includes('japan') || contentLower.includes('日本')) return 'japan';
  if (contentLower.includes('india')) return 'india';
  if (contentLower.includes('singapore')) return 'singapore';
  if (contentLower.includes('united states') || contentLower.includes('u.s.')) return 'usa';
  if (contentLower.includes('united kingdom') || contentLower.includes('u.k.')) return 'uk';
  if (contentLower.includes('germany') || contentLower.includes('deutschland')) return 'germany';

  return 'global';
}

/**
 * Clean and normalize text content
 */
export function cleanContent(content: string): string {
  return content
    // Remove HTML tags if any slipped through
    .replace(/<[^>]*>/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x1f\x7f]/g, '')
    // Trim
    .trim();
}

/**
 * Extract company names from text (simple pattern matching)
 */
export function extractCompanyNames(text: string): string[] {
  const companies: Set<string> = new Set();

  // Common insurance company patterns
  const patterns = [
    // Company suffixes
    /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:Insurance|Assurance|Re|Life|Health|Group|Holdings)/g,
    // Known InsurTech patterns
    /\b(Lemonade|Root|Oscar|Hippo|Metromile|Clover|Bright\s*Health|Devoted\s*Health)\b/gi,
    // Chinese company patterns
    /([平安|人保|太平洋|中国人寿|泰康|众安|水滴|轻松筹]+(?:保险|集团|人寿|财险)?)/g,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        companies.add(match[1].trim());
      }
    }
  }

  return Array.from(companies);
}

/**
 * Truncate text to a maximum length while preserving word boundaries
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Parse date strings in various formats
 */
export function parseDate(dateStr: string): Date | null {
  const formats = [
    // ISO format
    /^(\d{4})-(\d{2})-(\d{2})/,
    // US format
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // European format
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})/,
    // Chinese format
    /^(\d{4})年(\d{1,2})月(\d{1,2})日/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      try {
        // Handle different date formats
        if (format.source.includes('年')) {
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        } else if (format.source.startsWith('^(\\d{4})')) {
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        } else if (format.source.includes('\\.')) {
          return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        } else {
          return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
        }
      } catch {
        continue;
      }
    }
  }

  // Try native parsing as fallback
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onError?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, onError } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      onError?.(lastError, attempt);

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Batch an array into chunks
 */
export function batch<T>(array: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

/**
 * Format date for logging
 */
export function formatLogDate(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Simple logger
 */
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[${formatLogDate()}] INFO: ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[${formatLogDate()}] WARN: ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[${formatLogDate()}] ERROR: ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.DEBUG) {
      console.log(`[${formatLogDate()}] DEBUG: ${message}`, ...args);
    }
  },
};
