import { describe, expect, it } from 'vitest';
import { createSettingsStore } from '../src/shared/settings-store.js';
import { createFakeStorage } from './helpers/fake-storage.js';

describe('createSettingsStore', () => {
  it('loads and parses stored settings', async () => {
    const store = createSettingsStore(createFakeStorage({ language: 'en', descriptionTemplates: { en: 'E' } }));
    const settings = await store.load();
    expect(settings.language).toBe('en');
    expect(settings.templatesByLanguage).toEqual({ en: 'E' });
  });

  it('saves every field under the v1.x key names and keeps old domain keys', async () => {
    const storage = createFakeStorage({ jiraDomains: ['old.com'] });
    await createSettingsStore(storage).save({
      language: 'en',
      templatesByLanguage: { en: 'T' },
      activeTemplate: 'T'
    });
    expect(storage.data).toEqual({
      jiraDomains: ['old.com'],
      language: 'en',
      descriptionTemplates: { en: 'T' },
      descriptionTemplate: 'T'
    });
  });

  it('saves the language alone', async () => {
    const storage = createFakeStorage({ language: 'zh-TW' });
    await createSettingsStore(storage).saveLanguage('en');
    expect(storage.data).toEqual({ language: 'en' });
  });

  it('saves templates alone', async () => {
    const storage = createFakeStorage();
    await createSettingsStore(storage).saveTemplates({ 'zh-TW': 'Z' }, 'Z');
    expect(storage.data).toEqual({ descriptionTemplates: { 'zh-TW': 'Z' }, descriptionTemplate: 'Z' });
  });

  it('passes storage errors through', async () => {
    const storage = createFakeStorage();
    storage.failNextSet('QUOTA_BYTES_PER_ITEM quota exceeded');
    await expect(createSettingsStore(storage).saveLanguage('en')).rejects.toThrow('QUOTA_BYTES_PER_ITEM');
  });
});
