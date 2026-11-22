import type { Language } from './languages.js';
import { parseStoredSettings, STORAGE_KEYS, type Settings, type TemplatesByLanguage } from './settings.js';

/** The subset of `chrome.storage.StorageArea` this extension uses. Tests pass a fake. */
export interface KeyValueStorage {
  get(keys: string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

export interface SettingsDraft {
  readonly language: Language;
  readonly templatesByLanguage: TemplatesByLanguage;
  /** The template being saved. Also written to the legacy key, as v1.x did. */
  readonly activeTemplate: string;
}

export function createSettingsStore(storage: KeyValueStorage) {
  return {
    async load(): Promise<Settings> {
      const raw = await storage.get(Object.values(STORAGE_KEYS));
      return parseStoredSettings(raw);
    },

    async save(draft: SettingsDraft): Promise<void> {
      await storage.set({
        [STORAGE_KEYS.language]: draft.language,
        [STORAGE_KEYS.templatesByLanguage]: draft.templatesByLanguage,
        [STORAGE_KEYS.legacyTemplate]: draft.activeTemplate
      });
    },

    async saveLanguage(language: Language): Promise<void> {
      await storage.set({ [STORAGE_KEYS.language]: language });
    },

    async saveTemplates(templatesByLanguage: TemplatesByLanguage, activeTemplate: string): Promise<void> {
      await storage.set({
        [STORAGE_KEYS.templatesByLanguage]: templatesByLanguage,
        [STORAGE_KEYS.legacyTemplate]: activeTemplate
      });
    }
  };
}

export type SettingsStore = ReturnType<typeof createSettingsStore>;
