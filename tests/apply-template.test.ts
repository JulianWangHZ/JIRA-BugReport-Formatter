import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_FILL_OPTIONS } from '../src/page/fill-description.js';
import { DEFAULT_TEMPLATES } from '../src/shared/default-templates.js';
import { createSettingsStore } from '../src/shared/settings-store.js';
import {
  applyTemplateToActiveTab,
  runInTabWithChrome,
  type ActiveTab,
  type RunInTab
} from '../src/sidepanel/apply-template.js';
import { createFakeStorage } from './helpers/fake-storage.js';

const JIRA_URL = 'https://acme.atlassian.net/browse/A-1';

function setup(
  runInTab: RunInTab,
  stored: Record<string, unknown> = {},
  getActiveTab: () => Promise<ActiveTab | undefined> = async () => ({ id: 7, url: JIRA_URL })
) {
  return applyTemplateToActiveTab({
    store: createSettingsStore(createFakeStorage(stored)),
    getActiveTab,
    runInTab
  });
}

describe('applyTemplateToActiveTab', () => {
  it('sends the saved template for the saved language to the active tab', async () => {
    const runInTab = vi.fn<RunInTab>().mockResolvedValue({ ok: true });
    const outcome = await setup(runInTab, { language: 'en', descriptionTemplates: { en: '<p>EN</p>' } });

    expect(outcome).toEqual({ ok: true });
    expect(runInTab).toHaveBeenCalledWith(7, '<p>EN</p>', DEFAULT_FILL_OPTIONS);
  });

  it('uses the built-in default when nothing is saved', async () => {
    const runInTab = vi.fn<RunInTab>().mockResolvedValue({ ok: true });
    await setup(runInTab);
    expect(runInTab).toHaveBeenCalledWith(7, DEFAULT_TEMPLATES['zh-TW'], DEFAULT_FILL_OPTIONS);
  });

  it('reports no-active-tab', async () => {
    const runInTab = vi.fn<RunInTab>();
    expect(await setup(runInTab, {}, async () => undefined)).toEqual({ ok: false, reason: 'no-active-tab' });
    expect(runInTab).not.toHaveBeenCalled();
  });

  it.each([
    ['https://acme.atlassian.net/wiki/spaces/X', 'confluence-page'],
    ['chrome://extensions/', 'restricted-page'],
    [undefined, 'restricted-page']
  ] as const)('does not inject into %s (%s)', async (url, reason) => {
    const runInTab = vi.fn<RunInTab>();
    const outcome = await setup(runInTab, {}, async () => ({ id: 7, url }));
    expect(outcome).toEqual({ ok: false, reason });
    expect(runInTab).not.toHaveBeenCalled();
  });

  it('works on self-hosted JIRA without any setup', async () => {
    const runInTab = vi.fn<RunInTab>().mockResolvedValue({ ok: true });
    const outcome = await setup(runInTab, {}, async () => ({ id: 7, url: 'https://jira.acme.com:8080/browse/A-1' }));
    expect(outcome).toEqual({ ok: true });
  });

  it('passes through field-not-found from the page', async () => {
    const outcome = await setup(async () => ({ ok: false, reason: 'field-not-found' }));
    expect(outcome).toEqual({ ok: false, reason: 'field-not-found' });
  });

  it('reports a script error when the page returns nothing', async () => {
    expect(await setup(async () => undefined)).toEqual({ ok: false, reason: 'script-error', detail: '' });
  });

  it.each([
    'Cannot access a chrome:// URL',
    'The extensions gallery cannot be scripted.',
    'Cannot access contents of url "chrome-extension://abc/".'
  ])('maps "%s" to restricted-page', async message => {
    const outcome = await setup(async () => {
      throw new Error(message);
    });
    expect(outcome).toEqual({ ok: false, reason: 'restricted-page' });
  });

  it('keeps other injection errors as detail', async () => {
    const outcome = await setup(async () => {
      throw 'Frame was removed';
    });
    expect(outcome).toEqual({ ok: false, reason: 'script-error', detail: 'Frame was removed' });
  });
});

describe('runInTabWithChrome', () => {
  it('injects fillDescription with the template and options', async () => {
    const executeScript = vi.fn().mockResolvedValue([{ result: { ok: true } }]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });

    expect(await runInTabWithChrome(3, 'T', DEFAULT_FILL_OPTIONS)).toEqual({ ok: true });
    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({ target: { tabId: 3 }, args: ['T', DEFAULT_FILL_OPTIONS] })
    );
    vi.unstubAllGlobals();
  });

  it('returns undefined when Chrome returns no frames', async () => {
    vi.stubGlobal('chrome', { scripting: { executeScript: vi.fn().mockResolvedValue([]) } });
    expect(await runInTabWithChrome(3, 'T', DEFAULT_FILL_OPTIONS)).toBeUndefined();
    vi.unstubAllGlobals();
  });
});
