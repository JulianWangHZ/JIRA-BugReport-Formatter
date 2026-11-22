import {
  DEFAULT_FILL_OPTIONS,
  fillDescription,
  type FillDescriptionOptions,
  type FillDescriptionResult
} from '../page/fill-description.js';
import { checkUrlAccess } from '../shared/url-access.js';
import type { SettingsStore } from '../shared/settings-store.js';
import { resolveTemplate } from '../shared/settings.js';

export type ApplyTemplateOutcome =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'no-active-tab' | 'restricted-page' | 'confluence-page' | 'field-not-found';
    }
  | { readonly ok: false; readonly reason: 'script-error'; readonly detail: string };

/** Runs `fillDescription` in a tab and returns its result. Chrome's executeScript in production. */
export type RunInTab = (
  tabId: number,
  template: string,
  options: FillDescriptionOptions
) => Promise<FillDescriptionResult | undefined>;

export interface ActiveTab {
  readonly id: number;
  readonly url: string | undefined;
}

export interface ApplyTemplateDeps {
  readonly store: Pick<SettingsStore, 'load'>;
  readonly getActiveTab: () => Promise<ActiveTab | undefined>;
  readonly runInTab: RunInTab;
}

const RESTRICTED_PAGE_PATTERN = /Cannot access a chrome:\/\/ URL|cannot be scripted|Cannot access contents of url "chrome/i;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Checks the active tab's URL, then writes the saved template
 * for the saved language into its description field.
 */
export async function applyTemplateToActiveTab(deps: ApplyTemplateDeps): Promise<ApplyTemplateOutcome> {
  const tab = await deps.getActiveTab();
  if (tab === undefined) {
    return { ok: false, reason: 'no-active-tab' };
  }

  const access = checkUrlAccess(tab.url);
  if (access === 'restricted') {
    return { ok: false, reason: 'restricted-page' };
  }
  if (access === 'confluence') {
    return { ok: false, reason: 'confluence-page' };
  }

  const settings = await deps.store.load();
  const template = resolveTemplate(settings.templatesByLanguage, settings.legacyTemplate, settings.language);

  try {
    const result = await deps.runInTab(tab.id, template, DEFAULT_FILL_OPTIONS);
    if (result === undefined) {
      return { ok: false, reason: 'script-error', detail: '' };
    }
    return result.ok ? { ok: true } : { ok: false, reason: result.reason };
  } catch (error) {
    const detail = errorMessage(error);
    return RESTRICTED_PAGE_PATTERN.test(detail)
      ? { ok: false, reason: 'restricted-page' }
      : { ok: false, reason: 'script-error', detail };
  }
}

/** Production `RunInTab`: injects `fillDescription` into the tab's top frame. */
export const runInTabWithChrome: RunInTab = async (tabId, template, options) => {
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId },
    func: fillDescription,
    args: [template, options]
  });
  return injection?.result as FillDescriptionResult | undefined;
};
