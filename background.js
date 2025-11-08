chrome.runtime.onInstalled.addListener(() => {
    console.log('JIRA Bug Report Formatter extension installed!');
});

chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ tabId: tab.id });
});