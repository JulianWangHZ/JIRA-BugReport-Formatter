document.addEventListener('DOMContentLoaded', () => {
  const jiraDomainsInput = document.getElementById('jiraDomains');
  const blacklistDomainsInput = document.getElementById('blacklistDomains');
  const descriptionTemplateInput = document.getElementById('descriptionTemplate');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const insertTemplateBtn = document.getElementById('insertTemplateBtn');
  const status = document.getElementById('status');
  const settingsStatus = document.getElementById('settings-status');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

    function showStatus(message, isError = false, statusElement = status) {
        if (!statusElement) {
      return;
    }

    statusElement.textContent = message;
    statusElement.className = `status ${isError ? 'error' : 'success'}`;
    statusElement.style.display = 'block';

    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 8000);
  }

  function switchTab(tabName) {
    tabButtons.forEach(button => {
      button.classList.remove('active');
      if (button.dataset.tab === tabName) {
        button.classList.add('active');
      }
    });

    tabContents.forEach(content => {
      content.classList.remove('active');
    });
        const target = document.getElementById(`${tabName}-tab`);
        if (target) {
            target.classList.add('active');
        }
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });

    chrome.storage.sync.get([
        'jiraDomains',
        'blacklistDomains',
        'descriptionTemplate'
    ], (result) => {
        if (jiraDomainsInput) {
            const domains = result.jiraDomains || DEFAULTS.JIRA_DOMAINS;
            jiraDomainsInput.value = domains.join('\n');
        }

        if (blacklistDomainsInput) {
            const domains = result.blacklistDomains || DEFAULTS.BLACKLIST_DOMAINS;
            blacklistDomainsInput.value = domains.join('\n');
        }

        if (descriptionTemplateInput) {
            const storedTemplate = result.descriptionTemplate;
            const templateToUse = storedTemplate || DEFAULTS.DESCRIPTION_TEMPLATE;

            descriptionTemplateInput.value = templateToUse;
        }
    });

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const jiraDomainsText = jiraDomainsInput ? jiraDomainsInput.value.trim() : '';
            const blacklistDomainsText = blacklistDomainsInput ? blacklistDomainsInput.value.trim() : '';
            const descriptionTemplate = descriptionTemplateInput ? descriptionTemplateInput.value.trim() : '';

    if (!jiraDomainsText) {
                showStatus('⚠️ 請至少輸入一個 JIRA 網域', true, settingsStatus);
      return;
    }

    if (!descriptionTemplate) {
                showStatus('⚠️ 請輸入描述模板內容', true, settingsStatus);
      return;
    }

    const jiraDomains = jiraDomainsText.split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    const blacklistDomains = blacklistDomainsText.split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    const settings = {
                jiraDomains,
                blacklistDomains,
                descriptionTemplate
            };

            chrome.storage.sync.set(settings, () => {
      const originalText = saveSettingsBtn.textContent;
      const originalBgColor = saveSettingsBtn.style.backgroundColor;

                saveSettingsBtn.textContent = '設定已儲存！';
      saveSettingsBtn.style.backgroundColor = '#28a745';
      saveSettingsBtn.disabled = true;

      setTimeout(() => {
        saveSettingsBtn.textContent = originalText;
        saveSettingsBtn.style.backgroundColor = originalBgColor;
        saveSettingsBtn.disabled = false;
      }, 3000);
    });
  });
    }

    if (insertTemplateBtn) {
        insertTemplateBtn.addEventListener('click', async () => {
            insertTemplateBtn.disabled = true;
            const originalText = insertTemplateBtn.textContent;
            const originalBgColor = insertTemplateBtn.style.backgroundColor;

            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

                const sendInsertTemplateMessage = async () => {
                    return chrome.tabs.sendMessage(tab.id, {
                        action: 'insertTemplate'
                    });
                };

                let result;

                try {
                    result = await sendInsertTemplateMessage();
                } catch (messageError) {
                    if (messageError?.message?.includes('Receiving end does not exist')) {
                        try {
                            await chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                files: ['constants.js', 'content.js']
                            });

                            result = await sendInsertTemplateMessage();
                        } catch (injectError) {
                            const isChromeUrl = injectError?.message?.includes('Cannot access a chrome:// URL');
                            showStatus(
                                isChromeUrl
                                    ? '⚠️ 無法在 chrome:// 分頁中使用，請切換到 JIRA 頁面後再試一次'
                                    : (injectError?.message || '插入模板失敗'),
                                true
                            );
                            return;
                        }
                    } else {
                        showStatus(messageError?.message || '插入模板失敗', true);
                        return;
                    }
                }

                if (result?.success) {
                    insertTemplateBtn.textContent = '模板已插入！';
                    insertTemplateBtn.style.backgroundColor = '#28a745';

                    setTimeout(() => {
                        insertTemplateBtn.textContent = '✨ 套用Bug Report模板';
                        insertTemplateBtn.style.backgroundColor = originalBgColor;
                    }, 3000);
                } else {
                    showStatus(result?.error || '插入模板失敗', true);
                    return;
                }
            } catch (error) {
                showStatus('❌ 錯誤：' + (error?.message || '未知錯誤'), true);
                return;
            } finally {
                insertTemplateBtn.disabled = false;
                if (insertTemplateBtn.textContent === originalText) {
                    insertTemplateBtn.style.backgroundColor = originalBgColor;
                }
            }
        });
    }
});