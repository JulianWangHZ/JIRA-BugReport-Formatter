export const SUPPORTED_LANGUAGES = ['zh-TW', 'en'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'zh-TW';

/** The language the toggle switches to when it is on. */
export const ALTERNATE_LANGUAGE: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
