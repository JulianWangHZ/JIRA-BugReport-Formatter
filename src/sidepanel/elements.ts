export interface SidePanelElements {
  readonly languageToggle: HTMLInputElement;
  readonly tabButtons: readonly HTMLButtonElement[];
  readonly tabPanels: readonly HTMLElement[];
  readonly applyButton: HTMLButtonElement;
  readonly applyStatus: HTMLElement;
  readonly templateInput: HTMLTextAreaElement;
  readonly resetTemplateButton: HTMLButtonElement;
  readonly saveSettingsButton: HTMLButtonElement;
  readonly settingsStatus: HTMLElement;
}

function requireElement<T extends HTMLElement>(root: ParentNode, id: string, type: new () => T): T {
  const element = root.querySelector(`#${id}`);
  if (!(element instanceof type)) {
    throw new Error(`Side panel markup is missing #${id}`);
  }
  return element;
}

/** Looks up every element the side panel needs. Fails fast when the markup is out of date. */
export function querySidePanelElements(root: Document): SidePanelElements {
  return {
    languageToggle: requireElement(root, 'language-toggle', HTMLInputElement),
    tabButtons: [...root.querySelectorAll<HTMLButtonElement>('.tab-button')],
    tabPanels: [...root.querySelectorAll<HTMLElement>('.tab-content')],
    applyButton: requireElement(root, 'apply-template-button', HTMLButtonElement),
    applyStatus: requireElement(root, 'apply-status', HTMLElement),
    templateInput: requireElement(root, 'template-input', HTMLTextAreaElement),
    resetTemplateButton: requireElement(root, 'reset-template-button', HTMLButtonElement),
    saveSettingsButton: requireElement(root, 'save-settings-button', HTMLButtonElement),
    settingsStatus: requireElement(root, 'settings-status', HTMLElement)
  };
}
