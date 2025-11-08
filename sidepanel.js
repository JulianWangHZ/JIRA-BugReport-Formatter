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
  const languageToggle = document.getElementById('languageToggle');

  const supportedLanguages = Array.isArray(SUPPORTED_LANGUAGES) && SUPPORTED_LANGUAGES.length > 0
    ? SUPPORTED_LANGUAGES
    : [DEFAULT_LANGUAGE, 'en'];
  const secondaryLanguage = supportedLanguages.find(lang => lang !== DEFAULT_LANGUAGE) || DEFAULT_LANGUAGE;

  let currentLanguage = DEFAULT_LANGUAGE || DEFAULTS.LANGUAGE || 'zh-TW';
  let descriptionTemplates = {};
  let legacyDescriptionTemplate = '';

  if (insertTemplateBtn) {
    insertTemplateBtn.dataset.state = 'default';
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.dataset.state = 'default';
  }

  function getLocaleStrings(lang) {
    if (I18N && I18N[lang]) {
      return I18N[lang];
    }
    return I18N && I18N[DEFAULT_LANGUAGE] ? I18N[DEFAULT_LANGUAGE] : {};
  }

  function translate(key, lang = currentLanguage) {
    const locale = getLocaleStrings(lang);
    return key.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return acc[part];
      }
      return null;
    }, locale) || key;
  }

  function applyTranslations(lang) {
    const languageToApply = I18N && I18N[lang] ? lang : DEFAULT_LANGUAGE;
    document.documentElement.lang = languageToApply;

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = translate(key, languageToApply);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.setAttribute('placeholder', translate(key, languageToApply));
    });

    if (insertTemplateBtn) {
      const state = insertTemplateBtn.dataset.state || 'default';
      const key = state === 'success' ? 'buttons.insertTemplateSuccess' : 'buttons.insertTemplate';
      insertTemplateBtn.textContent = translate(key, languageToApply);
    }

    if (saveSettingsBtn) {
      const state = saveSettingsBtn.dataset.state || 'default';
      const key = state === 'success' ? 'buttons.saveSettingsSuccess' : 'buttons.saveSettings';
      saveSettingsBtn.textContent = translate(key, languageToApply);
    }

    if (languageToggle) {
      languageToggle.checked = languageToApply !== DEFAULT_LANGUAGE;
      languageToggle.disabled = secondaryLanguage === DEFAULT_LANGUAGE;
      languageToggle.setAttribute('aria-label', translate('labels.language', languageToApply));
    }
  }

  function captureCurrentTemplate() {
    if (!descriptionTemplateInput) {
      return;
    }
    const value = descriptionTemplateInput.value;
    descriptionTemplates = {
      ...descriptionTemplates,
      [currentLanguage]: value
    };
  }

  function getTemplateForLanguage(lang) {
    if (descriptionTemplates && typeof descriptionTemplates[lang] === 'string' && descriptionTemplates[lang].trim().length > 0) {
      return descriptionTemplates[lang];
    }
    if (legacyDescriptionTemplate && legacyDescriptionTemplate.trim().length > 0) {
      return legacyDescriptionTemplate;
    }
    if (DEFAULT_TEMPLATES && DEFAULT_TEMPLATES[lang]) {
      return DEFAULT_TEMPLATES[lang];
    }
    return DEFAULTS.DESCRIPTION_TEMPLATE;
  }

  function updateTemplateInput(lang) {
    if (!descriptionTemplateInput) {
      return;
    }
    descriptionTemplateInput.value = getTemplateForLanguage(lang);
  }

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
        'descriptionTemplate',
        'descriptionTemplates',
        'language'
    ], (result) => {
        const storedLanguage = result.language;
        if (supportedLanguages.includes(storedLanguage)) {
            currentLanguage = storedLanguage;
        } else {
            currentLanguage = DEFAULT_LANGUAGE;
        }

        applyTranslations(currentLanguage);

        if (jiraDomainsInput) {
            const domains = result.jiraDomains || DEFAULTS.JIRA_DOMAINS;
            jiraDomainsInput.value = domains.join('\n');
        }

        if (blacklistDomainsInput) {
            const domains = result.blacklistDomains || DEFAULTS.BLACKLIST_DOMAINS;
            blacklistDomainsInput.value = domains.join('\n');
        }

        descriptionTemplates = result.descriptionTemplates || {};
        legacyDescriptionTemplate = result.descriptionTemplate || '';

        updateTemplateInput(currentLanguage);
    });

  if (languageToggle) {
    languageToggle.addEventListener('change', () => {
      captureCurrentTemplate();
      const targetLanguage = languageToggle.checked ? secondaryLanguage : DEFAULT_LANGUAGE;
      if (targetLanguage === currentLanguage) {
        return;
      }
      currentLanguage = targetLanguage;
      applyTranslations(currentLanguage);
      updateTemplateInput(currentLanguage);
      chrome.storage.sync.set({ language: currentLanguage }, () => {});
    });
  }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
      captureCurrentTemplate();

            const jiraDomainsText = jiraDomainsInput ? jiraDomainsInput.value.trim() : '';
            const blacklistDomainsText = blacklistDomainsInput ? blacklistDomainsInput.value.trim() : '';
            const descriptionTemplate = descriptionTemplateInput ? descriptionTemplateInput.value.trim() : '';

    if (!jiraDomainsText) {
                showStatus(translate('status.saveMissingDomain'), true, settingsStatus);
      return;
    }

    if (!descriptionTemplate) {
                showStatus(translate('status.saveMissingTemplate'), true, settingsStatus);
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
                language: currentLanguage
            };

      const updatedTemplates = {
        ...descriptionTemplates,
        [currentLanguage]: descriptionTemplate
      };

      settings.descriptionTemplates = updatedTemplates;
      settings.descriptionTemplate = descriptionTemplate;
      descriptionTemplates = updatedTemplates;

            chrome.storage.sync.set(settings, () => {
      const originalBgColor = saveSettingsBtn.style.backgroundColor;

                saveSettingsBtn.dataset.state = 'success';
                saveSettingsBtn.textContent = translate('buttons.saveSettingsSuccess');
      saveSettingsBtn.style.backgroundColor = '#28a745';
      saveSettingsBtn.disabled = true;

      setTimeout(() => {
        saveSettingsBtn.dataset.state = 'default';
        saveSettingsBtn.textContent = translate('buttons.saveSettings');
        saveSettingsBtn.style.backgroundColor = originalBgColor;
        saveSettingsBtn.disabled = false;
      }, 3000);
    });
  });
    }

    if (insertTemplateBtn) {
        insertTemplateBtn.addEventListener('click', async () => {
            insertTemplateBtn.disabled = true;
            const originalBgColor = insertTemplateBtn.style.backgroundColor;
      const previousState = insertTemplateBtn.dataset.state || 'default';

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
                                    ? translate('status.insertChromeUrl')
                                    : (injectError?.message || translate('status.insertFailed')),
                                true
                            );
                            return;
                        }
                    } else {
                        showStatus(messageError?.message || translate('status.insertFailed'), true);
                        return;
                    }
                }

                if (result?.success) {
                    insertTemplateBtn.dataset.state = 'success';
                    insertTemplateBtn.textContent = translate('buttons.insertTemplateSuccess');
                    insertTemplateBtn.style.backgroundColor = '#28a745';

                    setTimeout(() => {
                        insertTemplateBtn.dataset.state = 'default';
                        insertTemplateBtn.textContent = translate('buttons.insertTemplate');
                        insertTemplateBtn.style.backgroundColor = originalBgColor;
                    }, 3000);
                } else {
                    showStatus(result?.error || translate('status.insertFailed'), true);
                    return;
                }
            } catch (error) {
                showStatus(translate('status.errorPrefix') + (error?.message || translate('status.unknownError')), true);
                return;
            } finally {
                insertTemplateBtn.disabled = false;
        if ((insertTemplateBtn.dataset.state || 'default') === previousState) {
                    insertTemplateBtn.style.backgroundColor = originalBgColor;
                }
            }
        });
    }
});