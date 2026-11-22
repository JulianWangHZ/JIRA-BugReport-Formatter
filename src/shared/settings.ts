import { DEFAULT_TEMPLATES } from './default-templates.js';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from './languages.js';

/**
 * Storage key names. They are the same as in v1.x, so saved user settings keep working.
 * `descriptionTemplate` is the pre-i18n single template; it is still read as a fallback.
 * v1.x also stored `jiraDomains` and `blacklistDomains`; they are no longer read.
 */
export const STORAGE_KEYS = {
  language: 'language',
  templatesByLanguage: 'descriptionTemplates',
  legacyTemplate: 'descriptionTemplate'
} as const;

export type TemplatesByLanguage = Readonly<Partial<Record<Language, string>>>;

export interface Settings {
  readonly language: Language;
  readonly templatesByLanguage: TemplatesByLanguage;
  readonly legacyTemplate: string;
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function toTemplatesByLanguage(value: unknown): TemplatesByLanguage {
  if (value === null || typeof value !== 'object') {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter(([language, template]) => isLanguage(language) && typeof template === 'string')
  );
}

/** Turns raw storage data into typed settings. Values of the wrong type fall back to defaults. */
export function parseStoredSettings(raw: Readonly<Record<string, unknown>>): Settings {
  const language = raw[STORAGE_KEYS.language];
  const legacyTemplate = raw[STORAGE_KEYS.legacyTemplate];
  return {
    language: isLanguage(language) ? language : DEFAULT_LANGUAGE,
    templatesByLanguage: toTemplatesByLanguage(raw[STORAGE_KEYS.templatesByLanguage]),
    legacyTemplate: typeof legacyTemplate === 'string' ? legacyTemplate : ''
  };
}

/** Picks the template for a language: saved one, then the legacy one, then the built-in default. */
export function resolveTemplate(
  templatesByLanguage: TemplatesByLanguage,
  legacyTemplate: string,
  language: Language
): string {
  const saved = templatesByLanguage[language];
  if (isNonBlankString(saved)) {
    return saved;
  }
  if (isNonBlankString(legacyTemplate)) {
    return legacyTemplate;
  }
  return DEFAULT_TEMPLATES[language];
}
