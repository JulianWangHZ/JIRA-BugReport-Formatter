import { DEFAULT_TEMPLATES } from '../shared/default-templates.js';
import { ALTERNATE_LANGUAGE, DEFAULT_LANGUAGE, type Language } from '../shared/languages.js';
import { translate } from '../shared/messages.js';
import type { SettingsStore } from '../shared/settings-store.js';
import { resolveTemplate, type Settings, type TemplatesByLanguage } from '../shared/settings.js';
import type { SidePanelElements } from './elements.js';
import type { StatusBanner } from './status-banner.js';
import { flashSuccess } from './success-flash.js';

export interface SettingsPanelDeps {
  readonly elements: SidePanelElements;
  readonly store: SettingsStore;
  readonly status: StatusBanner;
  readonly initial: Settings;
  /** Called after the UI language changes, so the whole view can re-render its text. */
  readonly onLanguageChange: (language: Language) => void;
  readonly relabel: () => void;
}

function describeError(language: Language, error: unknown): string {
  const detail = error instanceof Error ? error.message : translate(language, 'status.unknownError');
  return translate(language, 'status.errorPrefix') + detail;
}

/**
 * Owns the settings form. Unsaved template edits are kept per language,
 * so switching language and back does not lose them.
 */
export function bindSettingsPanel(deps: SettingsPanelDeps): void {
  const { elements, store, status, initial, relabel } = deps;
  const { languageToggle, templateInput } = elements;

  let language: Language = initial.language;
  let templateDrafts: TemplatesByLanguage = initial.templatesByLanguage;
  const legacyTemplate = initial.legacyTemplate;

  const keepTemplateDraft = (): void => {
    templateDrafts = { ...templateDrafts, [language]: templateInput.value };
  };

  const showTemplate = (): void => {
    templateInput.value = resolveTemplate(templateDrafts, legacyTemplate, language);
  };

  languageToggle.checked = language === ALTERNATE_LANGUAGE;
  showTemplate();

  languageToggle.addEventListener('change', () => {
    const next = languageToggle.checked ? ALTERNATE_LANGUAGE : DEFAULT_LANGUAGE;
    if (next === language) {
      return;
    }
    keepTemplateDraft();
    language = next;
    showTemplate();
    deps.onLanguageChange(language);
    store.saveLanguage(language).catch(error => status.show(describeError(language, error), true));
  });

  elements.resetTemplateButton.addEventListener('click', async () => {
    const defaultTemplate = DEFAULT_TEMPLATES[language];
    const nextDrafts = { ...templateDrafts, [language]: defaultTemplate };
    try {
      await store.saveTemplates(nextDrafts, defaultTemplate);
      templateDrafts = nextDrafts;
      templateInput.value = defaultTemplate;
      status.show(translate(language, 'status.resetTemplateDone'));
    } catch (error) {
      status.show(describeError(language, error), true);
    }
  });

  elements.saveSettingsButton.addEventListener('click', async () => {
    keepTemplateDraft();
    const activeTemplate = templateInput.value.trim();

    if (!activeTemplate) {
      status.show(translate(language, 'status.saveMissingTemplate'), true);
      return;
    }

    const nextDrafts = { ...templateDrafts, [language]: activeTemplate };
    try {
      await store.save({ language, templatesByLanguage: nextDrafts, activeTemplate });
      templateDrafts = nextDrafts;
      flashSuccess(elements.saveSettingsButton, { lockWhileFlashing: true, relabel });
    } catch (error) {
      status.show(describeError(language, error), true);
    }
  });
}
