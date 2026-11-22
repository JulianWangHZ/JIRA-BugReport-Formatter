import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_TEMPLATES } from '../src/shared/default-templates.js';
import { createSettingsStore } from '../src/shared/settings-store.js';
import type { RunInTab } from '../src/sidepanel/apply-template.js';
import { startSidePanel } from '../src/sidepanel/side-panel.js';
import { STATUS_VISIBLE_MS } from '../src/sidepanel/status-banner.js';
import { SUCCESS_FLASH_MS } from '../src/sidepanel/success-flash.js';
import { createFakeStorage, type FakeStorage } from './helpers/fake-storage.js';

const JIRA_URL = 'https://acme.atlassian.net/browse/A-1';

const MARKUP = readFileSync(resolve(__dirname, '../src/sidepanel/side-panel.html'), 'utf8');

function $(id: string) {
  return document.getElementById(id) as HTMLElement & HTMLInputElement & HTMLTextAreaElement & HTMLButtonElement;
}

/** Lets pending promise callbacks run. */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
}

async function mount(
  stored: Record<string, unknown> = {},
  runInTab: RunInTab = async () => ({ ok: true }),
  url: string = JIRA_URL
) {
  const parsed = new DOMParser().parseFromString(MARKUP, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
  const storage = createFakeStorage(stored);
  await startSidePanel({
    document,
    store: createSettingsStore(storage),
    getActiveTab: async () => ({ id: 1, url }),
    runInTab
  });
  return storage;
}

function toggleLanguage(): void {
  const toggle = $('language-toggle');
  toggle.checked = !toggle.checked;
  toggle.dispatchEvent(new Event('change'));
}

describe('side panel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('first render', () => {
    it('shows defaults in Traditional Chinese', async () => {
      await mount();
      expect(document.documentElement.lang).toBe('zh-TW');
      expect($('apply-template-button').textContent).toBe('套用 Bug Report 模板');
      expect($('language-toggle').checked).toBe(false);
      expect($('language-toggle').getAttribute('aria-label')).toBe('介面語言');
      expect(document.getElementById('jira-domains-input')).toBeNull();
      expect(document.getElementById('blacklist-domains-input')).toBeNull();
      expect($('template-input').value).toBe(DEFAULT_TEMPLATES['zh-TW']);
    });

    it('shows saved English settings', async () => {
      await mount({ language: 'en', descriptionTemplates: { en: '<p>mine</p>' } });
      expect($('language-toggle').checked).toBe(true);
      expect($('save-settings-button').textContent).toBe('Save Settings');
      expect($('template-input').placeholder).toBe('Enter the description template');
      expect($('template-input').value).toBe('<p>mine</p>');
    });

    it('fails fast when markup is missing an element', async () => {
      document.body.innerHTML = '<div></div>';
      await expect(
        startSidePanel({
          document,
          store: createSettingsStore(createFakeStorage()),
          getActiveTab: async () => ({ id: 1, url: JIRA_URL }),
          runInTab: async () => ({ ok: true })
        })
      ).rejects.toThrow('#language-toggle');
    });
  });

  describe('tabs', () => {
    it('switches the active panel', async () => {
      await mount();
      document.querySelector<HTMLButtonElement>('[data-tab="settings"]')!.click();
      expect($('settings-tab').classList.contains('active')).toBe(true);
      expect($('quick-tab').classList.contains('active')).toBe(false);
      expect(document.querySelector('[data-tab="quick"]')!.classList.contains('active')).toBe(false);
    });
  });

  describe('language toggle', () => {
    it('re-renders text, swaps the template and saves the language', async () => {
      const storage = await mount();
      toggleLanguage();
      await settle();
      expect(document.documentElement.lang).toBe('en');
      expect($('apply-template-button').textContent).toBe('Apply Bug Report Template');
      expect($('template-input').value).toBe(DEFAULT_TEMPLATES.en);
      expect(storage.data.language).toBe('en');
    });

    it('keeps unsaved edits per language', async () => {
      await mount();
      $('template-input').value = 'draft zh';
      toggleLanguage();
      $('template-input').value = 'draft en';
      toggleLanguage();
      expect($('template-input').value).toBe('draft zh');
      toggleLanguage();
      expect($('template-input').value).toBe('draft en');
    });

    it('ignores a change event that does not change the language', async () => {
      const storage = await mount();
      $('language-toggle').dispatchEvent(new Event('change'));
      await settle();
      expect(storage.data.language).toBeUndefined();
    });

    it('shows an error when saving the language fails', async () => {
      const storage = await mount();
      storage.failNextSet('offline');
      toggleLanguage();
      await settle();
      expect($('settings-status').textContent).toBe('❌ Error: offline');
    });
  });

  describe('save settings', () => {
    async function mountAndEdit(): Promise<FakeStorage> {
      const storage = await mount();
      $('template-input').value = '  <p>T</p>  ';
      return storage;
    }

    it('saves trimmed values and flashes the button', async () => {
      const storage = await mountAndEdit();
      $('save-settings-button').click();
      await settle();

      expect(storage.data).toEqual({
        language: 'zh-TW',
        descriptionTemplates: { 'zh-TW': '<p>T</p>' },
        descriptionTemplate: '<p>T</p>'
      });
      const button = $('save-settings-button');
      expect(button.dataset.state).toBe('success');
      expect(button.textContent).toBe('設定已儲存！');
      expect(button.disabled).toBe(true);

      vi.advanceTimersByTime(SUCCESS_FLASH_MS);
      expect(button.dataset.state).toBe('default');
      expect(button.textContent).toBe('儲存設定');
      expect(button.disabled).toBe(false);
    });

    it('requires a template', async () => {
      const storage = await mountAndEdit();
      $('template-input').value = '   ';
      $('save-settings-button').click();
      await settle();
      expect($('settings-status').textContent).toBe('⚠️ 請輸入描述模板內容');
      expect(storage.data).toEqual({});
    });

    it('shows storage errors such as quota limits', async () => {
      const storage = await mountAndEdit();
      storage.failNextSet('QUOTA_BYTES_PER_ITEM quota exceeded');
      $('save-settings-button').click();
      await settle();
      expect($('settings-status').textContent).toBe('❌ 錯誤：QUOTA_BYTES_PER_ITEM quota exceeded');
      expect($('save-settings-button').dataset.state).toBe('default');
    });
  });

  describe('restore default template', () => {
    it('saves and shows the default for the current language', async () => {
      const storage = await mount({ descriptionTemplates: { 'zh-TW': 'custom', en: 'keep' } });
      $('reset-template-button').click();
      await settle();
      expect($('template-input').value).toBe(DEFAULT_TEMPLATES['zh-TW']);
      expect(storage.data.descriptionTemplates).toEqual({ 'zh-TW': DEFAULT_TEMPLATES['zh-TW'], en: 'keep' });
      expect($('settings-status').textContent).toBe('已還原為預設模板');
      expect($('settings-status').className).toBe('status success');

      vi.advanceTimersByTime(STATUS_VISIBLE_MS);
      expect($('settings-status').style.display).toBe('none');
    });

    it('shows an error and keeps the editor when saving fails', async () => {
      const storage = await mount({ descriptionTemplates: { 'zh-TW': 'custom' } });
      storage.failNextSet('offline');
      $('reset-template-button').click();
      await settle();
      expect($('template-input').value).toBe('custom');
      expect($('settings-status').textContent).toBe('❌ 錯誤：offline');
    });
  });

  describe('apply template', () => {
    it('flashes success and re-enables the button', async () => {
      const runInTab = vi.fn<RunInTab>().mockResolvedValue({ ok: true });
      await mount({}, runInTab);
      $('apply-template-button').click();
      await settle();

      const button = $('apply-template-button');
      expect(runInTab).toHaveBeenCalledOnce();
      expect(button.textContent).toBe('模板已插入！');
      expect(button.disabled).toBe(false);
      vi.advanceTimersByTime(SUCCESS_FLASH_MS);
      expect(button.textContent).toBe('套用 Bug Report 模板');
    });

    it.each([
      ['restricted page', async () => { throw new Error('Cannot access a chrome:// URL'); }, '⚠️ Cannot run on chrome:// pages. Please switch to a JIRA tab and try again.'],
      ['missing field', async () => ({ ok: false, reason: 'field-not-found' }) as const, 'Could not find the description field on this page'],
      ['script error', async () => { throw new Error('Frame was removed'); }, 'Frame was removed'],
      ['empty result', async () => undefined, 'Failed to insert template']
    ] satisfies [string, RunInTab, string][])('shows the %s message in the UI language', async (_name, runInTab, message) => {
      await mount({ language: 'en' }, runInTab);
      $('apply-template-button').click();
      await settle();
      expect($('apply-status').textContent).toBe(message);
      expect($('apply-status').className).toBe('status error');
      expect($('apply-template-button').disabled).toBe(false);
    });

    it.each([
      ['https://acme.atlassian.net/wiki/spaces/X', '⚠️ 這是 Confluence 頁面，未套用模板'],
      ['chrome://extensions/', '⚠️ 無法在 chrome:// 分頁中使用，請切換到 JIRA 頁面後再試一次']
    ])('refuses %s', async (url, message) => {
      const runInTab = vi.fn<RunInTab>();
      await mount({}, runInTab, url);
      $('apply-template-button').click();
      await settle();
      expect(runInTab).not.toHaveBeenCalled();
      expect($('apply-status').textContent).toBe(message);
    });

    it('shows the no-tab message', async () => {
      const parsed = new DOMParser().parseFromString(MARKUP, 'text/html');
      document.body.innerHTML = parsed.body.innerHTML;
      await startSidePanel({
        document,
        store: createSettingsStore(createFakeStorage()),
        getActiveTab: async () => undefined,
        runInTab: async () => ({ ok: true })
      });
      $('apply-template-button').click();
      await settle();
      expect($('apply-status').textContent).toBe('插入模板失敗');
    });

    it('shows unexpected errors with the error prefix', async () => {
      const parsed = new DOMParser().parseFromString(MARKUP, 'text/html');
      document.body.innerHTML = parsed.body.innerHTML;
      await startSidePanel({
        document,
        store: createSettingsStore(createFakeStorage()),
        getActiveTab: async () => {
          throw new Error('tabs API down');
        },
        runInTab: async () => ({ ok: true })
      });
      $('apply-template-button').click();
      await settle();
      expect($('apply-status').textContent).toBe('❌ 錯誤：tabs API down');
    });
  });
});
