/**
 * Runs inside the JIRA page through `chrome.scripting.executeScript({ func })`.
 * Chrome serialises the function source, so it must stay self-contained:
 * no imports, no outer variables, and all helpers declared inside it.
 * Chrome awaits the returned promise before handing the result back.
 */

export type FillDescriptionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: 'field-not-found' };

/** Ordered from most to least specific. The first one that leads to an editable element wins. */
export const DESCRIPTION_FIELD_SELECTORS: readonly string[] = [
  // Classic JIRA text areas
  '#ak-editor-textarea',
  'textarea[name="description"]',
  'textarea[id="description"]',
  'textarea[id*="description"]',

  // Modern JIRA test IDs and data attributes
  '[data-testid="issue.views.field.rich-text.description"]',
  '[data-testid="issue.views.field.rich-text.description"] textarea',
  '[data-testid*="description"] textarea',
  '[data-testid*="description"] [contenteditable="true"]',

  // Content editable fields
  '[contenteditable="true"][aria-label*="Description"]',
  '[contenteditable="true"][aria-label*="description"]',

  // Field-based selectors
  '[data-field-name="description"]',
  '[data-field-name="description"] textarea',
  '[data-field-name="description"] [contenteditable="true"]',
  '[data-field-id="description"]',
  '.field-description',
  '.description-field',

  // Dialog and form selectors
  '.create-issue-dialog [data-testid*="description"]',
  '.aui-dialog2 [data-testid*="description"]',
  '.jira-dialog [data-testid*="description"]',

  // Generic but specific patterns
  '[aria-label*="start typing"][contenteditable="true"]',

  // Fallback selectors
  '.ak-editor-content-area [contenteditable="true"]',
  '.ak-editor-content-area textarea'
];

/**
 * JIRA shows a read-only preview ("Add a description…") until the field is clicked;
 * only then does it mount the editor. These selectors find that preview so it can be clicked.
 */
export const DESCRIPTION_ACTIVATOR_SELECTORS: readonly string[] = [
  // Jira Server / Data Center issue view (inline edit)
  '#description-val',
  // Jira Cloud issue view
  '[data-testid="issue.views.field.rich-text.description"]',
  '[data-testid*="description"][data-testid*="read-view"]',
  '[data-field-name="description"]',
  '[data-field-id="description"]'
];

export interface FillDescriptionOptions {
  readonly fieldSelectors: readonly string[];
  readonly activatorSelectors: readonly string[];
  /** How long to wait for the editor to appear after clicking the preview. */
  readonly timeoutMs: number;
}

export const DEFAULT_FILL_OPTIONS: FillDescriptionOptions = {
  fieldSelectors: DESCRIPTION_FIELD_SELECTORS,
  activatorSelectors: DESCRIPTION_ACTIVATOR_SELECTORS,
  timeoutMs: 3000
};

export async function fillDescription(
  template: string,
  options: FillDescriptionOptions
): Promise<FillDescriptionResult> {
  const isRichEditor = (element: Element): element is HTMLElement => {
    const flag = element.getAttribute('contenteditable');
    return element instanceof HTMLElement && (flag === '' || flag === 'true');
  };

  const isEditable = (element: Element): boolean =>
    element instanceof HTMLTextAreaElement || isRichEditor(element);

  // A selector may match a wrapper such as the description field container.
  // Look inside it instead of reporting success without writing anything.
  const toEditable = (element: Element): Element | null =>
    isEditable(element) ? element : element.querySelector('textarea, [contenteditable=""], [contenteditable="true"]');

  const findField = (): Element | null => {
    for (const selector of options.fieldSelectors) {
      const match = document.querySelector(selector);
      const editable = match ? toEditable(match) : null;
      if (editable) {
        return editable;
      }
    }
    return null;
  };

  // Prefer an explicit button inside the preview; the click handler usually sits there.
  const findActivator = (): HTMLElement | null => {
    for (const selector of options.activatorSelectors) {
      const match = document.querySelector<HTMLElement>(selector);
      if (match) {
        const isButton = match.matches('button, [role="button"]');
        return isButton ? match : (match.querySelector<HTMLElement>('button, [role="button"]') ?? match);
      }
    }
    return null;
  };

  const press = (element: HTMLElement): void => {
    for (const type of ['mousedown', 'mouseup', 'click']) {
      element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
    }
  };

  const waitForField = (): Promise<Element | null> =>
    new Promise(resolve => {
      const observer = new MutationObserver(() => {
        const field = findField();
        if (field) {
          finish(field);
        }
      });
      const timer = setTimeout(() => finish(null), options.timeoutMs);
      const finish = (field: Element | null): void => {
        observer.disconnect();
        clearTimeout(timer);
        resolve(field);
      };
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    });

  const openEditor = async (): Promise<Element | null> => {
    const activator = findActivator();
    if (!activator) {
      return null;
    }
    press(activator);
    return findField() ?? waitForField();
  };

  const notifyFramework = (element: Element): void => {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const field = findField() ?? (await openEditor());
  if (!field) {
    return { ok: false, reason: 'field-not-found' };
  }

  if (field instanceof HTMLTextAreaElement) {
    field.value = template;
    notifyFramework(field);
    return { ok: true };
  }

  const editor = field as HTMLElement;
  editor.focus();
  editor.innerHTML = template;
  notifyFramework(editor);
  setTimeout(() => editor.blur(), 100);
  return { ok: true };
}
