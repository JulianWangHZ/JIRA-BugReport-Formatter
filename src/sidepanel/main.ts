import { createSettingsStore } from '../shared/settings-store.js';
import { runInTabWithChrome, type ActiveTab } from './apply-template.js';
import { startSidePanel } from './side-panel.js';

async function getActiveTab(): Promise<ActiveTab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id === undefined ? undefined : { id: tab.id, url: tab.url };
}

startSidePanel({
  document,
  store: createSettingsStore(chrome.storage.sync),
  getActiveTab,
  runInTab: runInTabWithChrome
}).catch(error => console.error('[JIRA Bug Report Formatter] side panel failed to start', error));
