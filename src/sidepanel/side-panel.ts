import type { SettingsStore } from '../shared/settings-store.js';
import type { ActiveTab, RunInTab } from './apply-template.js';
import { querySidePanelElements } from './elements.js';
import { localizeView } from './localize-view.js';
import { bindQuickApplyPanel } from './quick-apply-panel.js';
import { bindSettingsPanel } from './settings-panel.js';
import { createStatusBanner } from './status-banner.js';
import { bindTabs } from './tabs.js';

export interface SidePanelDeps {
  readonly document: Document;
  readonly store: SettingsStore;
  readonly getActiveTab: () => Promise<ActiveTab | undefined>;
  readonly runInTab: RunInTab;
}

/** Loads settings, renders the side panel and wires every control. */
export async function startSidePanel(deps: SidePanelDeps): Promise<void> {
  const { document, store } = deps;
  const elements = querySidePanelElements(document);
  const initial = await store.load();

  let language = initial.language;
  const relabel = (): void => localizeView(document, language);
  relabel();

  bindTabs(elements.tabButtons, elements.tabPanels);

  bindSettingsPanel({
    elements,
    store,
    status: createStatusBanner(elements.settingsStatus),
    initial,
    relabel,
    onLanguageChange: next => {
      language = next;
      relabel();
    }
  });

  bindQuickApplyPanel({
    button: elements.applyButton,
    status: createStatusBanner(elements.applyStatus),
    getLanguage: () => language,
    relabel,
    store,
    getActiveTab: deps.getActiveTab,
    runInTab: deps.runInTab
  });
}
