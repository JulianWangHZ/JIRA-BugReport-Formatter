import type { Language } from '../shared/languages.js';
import { translate } from '../shared/messages.js';

/**
 * Applies translations declared in markup:
 * `data-i18n` (text), `data-i18n-success` (text while `data-state="success"`),
 * `data-i18n-placeholder` and `data-i18n-aria-label`.
 */
export function localizeView(root: Document, language: Language): void {
  root.documentElement.lang = language;

  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach(element => {
    element.textContent = translate(language, labelKeyFor(element));
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach(element => {
    element.setAttribute('placeholder', translate(language, element.dataset.i18nPlaceholder ?? ''));
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach(element => {
    element.setAttribute('aria-label', translate(language, element.dataset.i18nAriaLabel ?? ''));
  });
}

function labelKeyFor(element: HTMLElement): string {
  const { i18n = '', i18nSuccess, state } = element.dataset;
  return state === 'success' && i18nSuccess ? i18nSuccess : i18n;
}
