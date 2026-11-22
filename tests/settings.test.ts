import { describe, expect, it } from 'vitest';
import { DEFAULT_TEMPLATES } from '../src/shared/default-templates.js';
import { isLanguage } from '../src/shared/languages.js';
import { parseStoredSettings, resolveTemplate } from '../src/shared/settings.js';

describe('parseStoredSettings', () => {
  it('returns defaults for empty storage', () => {
    expect(parseStoredSettings({})).toEqual({
      language: 'zh-TW',
      templatesByLanguage: {},
      legacyTemplate: ''
    });
  });

  it('keeps valid stored values', () => {
    const settings = parseStoredSettings({
      language: 'en',
      descriptionTemplates: { en: '<p>en</p>' },
      descriptionTemplate: '<p>old</p>'
    });
    expect(settings).toEqual({
      language: 'en',
      templatesByLanguage: { en: '<p>en</p>' },
      legacyTemplate: '<p>old</p>'
    });
  });

  it('falls back when stored values have the wrong type', () => {
    const settings = parseStoredSettings({
      language: 'fr',
      descriptionTemplates: 'nope',
      descriptionTemplate: 42
    });
    expect(settings.language).toBe('zh-TW');
    expect(settings.templatesByLanguage).toEqual({});
    expect(settings.legacyTemplate).toBe('');
  });

  it('drops unknown languages and non-string templates', () => {
    const settings = parseStoredSettings({ descriptionTemplates: { en: 'x', fr: 'y', 'zh-TW': 3 } });
    expect(settings.templatesByLanguage).toEqual({ en: 'x' });
  });

  it('ignores v1.x domain keys', () => {
    expect(parseStoredSettings({ jiraDomains: ['a.com'], blacklistDomains: [] })).not.toHaveProperty('jiraDomains');
  });

  it('treats null templates as empty', () => {
    expect(parseStoredSettings({ descriptionTemplates: null }).templatesByLanguage).toEqual({});
  });
});

describe('resolveTemplate', () => {
  it('prefers the saved template for the language', () => {
    expect(resolveTemplate({ en: 'saved' }, 'legacy', 'en')).toBe('saved');
  });

  it('falls back to the legacy template when the saved one is blank', () => {
    expect(resolveTemplate({ en: '   ' }, 'legacy', 'en')).toBe('legacy');
  });

  it('falls back to the built-in default last', () => {
    expect(resolveTemplate({}, ' ', 'zh-TW')).toBe(DEFAULT_TEMPLATES['zh-TW']);
  });
});

describe('isLanguage', () => {
  it('accepts only supported languages', () => {
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('zh-TW')).toBe(true);
    expect(isLanguage('ja')).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
  });
});
