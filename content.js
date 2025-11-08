chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'insertTemplate') {
    insertTemplateManually()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

const DESCRIPTION_FIELD_SELECTORS = [
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

async function insertTemplateManually() {
  try {
    const result = await chrome.storage.sync.get(['descriptionTemplate']);
    const descriptionTemplate = result.descriptionTemplate || DEFAULTS.DESCRIPTION_TEMPLATE;

    const success = await insertTemplateIntoField(descriptionTemplate);

    if (success) {
      return { success: true, message: 'Template inserted successfully' };
    } else {
      throw new Error('Could not find description field on this page');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function insertTemplateIntoField(template) {
  try {
    let descriptionField = null;

    for (const selector of DESCRIPTION_FIELD_SELECTORS) {
      descriptionField = document.querySelector(selector);
      if (descriptionField) {
        break;
      }
    }

    if (!descriptionField) {
      return false;
    }

    if (descriptionField.tagName.toLowerCase() === 'textarea') {
      descriptionField.value = template;
      descriptionField.dispatchEvent(new Event('input', { bubbles: true }));
      descriptionField.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (descriptionField.contentEditable === 'true') {
      descriptionField.focus();
      descriptionField.innerHTML = template;
      descriptionField.dispatchEvent(new Event('input', { bubbles: true }));
      descriptionField.dispatchEvent(new Event('change', { bubbles: true }));
      setTimeout(() => descriptionField.blur(), 100);
    }

    return true;
  } catch (_error) {
    return false;
  }
}