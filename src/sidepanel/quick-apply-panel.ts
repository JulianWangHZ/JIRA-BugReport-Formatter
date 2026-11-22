import type { Language } from '../shared/languages.js';
import { translate } from '../shared/messages.js';
import { applyTemplateToActiveTab, type ApplyTemplateDeps, type ApplyTemplateOutcome } from './apply-template.js';
import type { StatusBanner } from './status-banner.js';
import { flashSuccess } from './success-flash.js';

export interface QuickApplyPanelDeps extends ApplyTemplateDeps {
  readonly button: HTMLButtonElement;
  readonly status: StatusBanner;
  readonly getLanguage: () => Language;
  readonly relabel: () => void;
}

function describeFailure(outcome: Exclude<ApplyTemplateOutcome, { ok: true }>, language: Language): string {
  switch (outcome.reason) {
    case 'restricted-page':
      return translate(language, 'status.insertChromeUrl');
    case 'confluence-page':
      return translate(language, 'status.confluencePage');
    case 'field-not-found':
      return translate(language, 'status.fieldNotFound');
    case 'no-active-tab':
      return translate(language, 'status.insertFailed');
    case 'script-error':
      return outcome.detail || translate(language, 'status.insertFailed');
  }
}

export function bindQuickApplyPanel(deps: QuickApplyPanelDeps): void {
  const { button, status, getLanguage, relabel } = deps;

  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const outcome = await applyTemplateToActiveTab(deps);
      if (outcome.ok) {
        flashSuccess(button, { lockWhileFlashing: false, relabel });
      } else {
        status.show(describeFailure(outcome, getLanguage()), true);
      }
    } catch (error) {
      const language = getLanguage();
      const detail = error instanceof Error ? error.message : translate(language, 'status.unknownError');
      status.show(translate(language, 'status.errorPrefix') + detail, true);
    } finally {
      button.disabled = false;
    }
  });
}
