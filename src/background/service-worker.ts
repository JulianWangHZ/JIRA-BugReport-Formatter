// Clicking the toolbar icon opens the side panel.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error('[JIRA Bug Report Formatter] could not set side panel behavior', error));
