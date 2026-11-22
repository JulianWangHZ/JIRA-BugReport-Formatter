import type { Language } from './languages.js';

export interface MessageCatalog {
  appTitle: string;
  tabQuick: string;
  tabSettings: string;
  buttons: {
    insertTemplate: string;
    insertTemplateSuccess: string;
    saveSettings: string;
    saveSettingsSuccess: string;
    resetTemplate: string;
  };
  labels: {
    language: string;
    descriptionTemplate: string;
  };
  placeholders: {
    descriptionTemplate: string;
  };
  status: {
    insertChromeUrl: string;
    insertFailed: string;
    fieldNotFound: string;
    confluencePage: string;
    saveMissingTemplate: string;
    errorPrefix: string;
    unknownError: string;
    resetTemplateDone: string;
  };
  toggle: {
    zh: string;
    en: string;
  };
}

export const MESSAGES: Readonly<Record<Language, MessageCatalog>> = {
  'zh-TW': {
    appTitle: 'JIRA Bug Report Formatter',
    tabQuick: '快速套用',
    tabSettings: '設定',
    buttons: {
      insertTemplate: '套用 Bug Report 模板',
      insertTemplateSuccess: '模板已插入！',
      saveSettings: '儲存設定',
      saveSettingsSuccess: '設定已儲存！',
      resetTemplate: '還原預設'
    },
    labels: {
      language: '介面語言',
      descriptionTemplate: '描述模板（HTML 格式）：'
    },
    placeholders: {
      descriptionTemplate: '請輸入描述模板內容'
    },
    status: {
      insertChromeUrl: '⚠️ 無法在 chrome:// 分頁中使用，請切換到 JIRA 頁面後再試一次',
      insertFailed: '插入模板失敗',
      fieldNotFound: '在此頁面找不到描述欄位',
      confluencePage: '⚠️ 這是 Confluence 頁面，未套用模板',
      saveMissingTemplate: '⚠️ 請輸入描述模板內容',
      errorPrefix: '❌ 錯誤：',
      unknownError: '未知錯誤',
      resetTemplateDone: '已還原為預設模板'
    },
    toggle: {
      zh: '繁中',
      en: 'English'
    }
  },
  en: {
    appTitle: 'JIRA Bug Report Formatter',
    tabQuick: 'Quick Apply',
    tabSettings: 'Settings',
    buttons: {
      insertTemplate: 'Apply Bug Report Template',
      insertTemplateSuccess: 'Template inserted!',
      saveSettings: 'Save Settings',
      saveSettingsSuccess: 'Settings saved!',
      resetTemplate: 'Restore default'
    },
    labels: {
      language: 'Interface language',
      descriptionTemplate: 'Description template (HTML):'
    },
    placeholders: {
      descriptionTemplate: 'Enter the description template'
    },
    status: {
      insertChromeUrl: '⚠️ Cannot run on chrome:// pages. Please switch to a JIRA tab and try again.',
      insertFailed: 'Failed to insert template',
      fieldNotFound: 'Could not find the description field on this page',
      confluencePage: '⚠️ This is a Confluence page. Template not applied.',
      saveMissingTemplate: '⚠️ Please provide template content',
      errorPrefix: '❌ Error: ',
      unknownError: 'Unknown error',
      resetTemplateDone: 'Template restored to default'
    },
    toggle: {
      zh: '繁中',
      en: 'English'
    }
  }
};

/**
 * Looks up a dotted key such as `buttons.saveSettings`.
 * Returns the key itself when no string exists, so a missing string is visible in the UI.
 */
export function translate(language: Language, key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node !== null && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
      MESSAGES[language]
    );
  return typeof value === 'string' ? value : key;
}
