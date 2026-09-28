const SUPPORTED_LANGUAGES = ['zh-TW', 'en'];

const DEFAULT_LANGUAGE = 'zh-TW';

const LANGUAGE_LABELS = {
    'zh-TW': '繁體中文',
    en: 'English'
};

const DEFAULT_TEMPLATES = {
    'zh-TW': `<p><strong>⚠️【當前問題】</strong></p>
<p>描述目前遇到的問題或異常行為。</p>
<p>&nbsp;</p>

<p><strong>🎯【影響範圍】</strong></p>
<p>說明受影響的功能、頁面、使用者或平台。</p>
<p>&nbsp;</p>

<p><strong>📎【附件】</strong></p>
<p>若有相關截圖、錄影或檔案，請在此列出。</p>
<p>&nbsp;</p>

<p><strong>🧪【重現測試步驟】</strong></p>
<ol>
<li>步驟 1</li>
<li>步驟 2</li>
</ol>
<p>&nbsp;</p>

<p><strong>✅【預期結果】</strong></p>
<p>說明完成上述步驟後預期應該看到的狀態。</p>
<p>&nbsp;</p>

<p><strong>🍀【測試環境】</strong></p>
<p>正式環境 / 測試環境 / 開發環境</p>
<p>&nbsp;</p>

<p><strong>🛩️【額外資訊】</strong></p>
<p>補充任何對處理此問題有幫助的觀察或備註。</p>`,
    en: `<p><strong>⚠️【Current Issue】</strong></p>
<p>Describe the problem or unexpected behavior you are seeing.</p>
<p>&nbsp;</p>

<p><strong>🎯【Impact Scope】</strong></p>
<p>List the affected features, pages, users, or platforms.</p>
<p>&nbsp;</p>

<p><strong>📎【Attachments】</strong></p>
<p>List any related screenshots, recordings, or files here.</p>
<p>&nbsp;</p>

<p><strong>🧪【Reproduction Steps】</strong></p>
<ol>
<li>Step 1</li>
<li>Step 2</li>
</ol>
<p>&nbsp;</p>

<p><strong>✅【Expected Result】</strong></p>
<p>Explain what should happen after the steps above.</p>
<p>&nbsp;</p>

<p><strong>🍀【Test Environment】</strong></p>
<p>Production / Staging / Development</p>
<p>&nbsp;</p>

<p><strong>🛩️【Additional Information】</strong></p>
<p>Share any extra notes or observations that might help resolve the issue.</p>`
};

const I18N = {
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
            jiraDomains: 'JIRA 網域（每行一個）：',
            blacklistDomains: '封鎖網域（每行一個）：',
            descriptionTemplate: '描述模板（HTML 格式）：'
        },
        placeholders: {
            jiraDomains: '*.example.atlassian.net',
            blacklistDomains: '*/wiki/*',
            descriptionTemplate: '請輸入描述模板內容'
        },
        status: {
            insertChromeUrl: '⚠️ 無法在 chrome:// 分頁中使用，請切換到 JIRA 頁面後再試一次',
            insertFailed: '插入模板失敗',
            saveMissingDomain: '⚠️ 請至少輸入一個 JIRA 網域',
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
            jiraDomains: 'JIRA domains (one per line):',
            blacklistDomains: 'Blocked domains (one per line):',
            descriptionTemplate: 'Description template (HTML):'
        },
        placeholders: {
            jiraDomains: '*.example.atlassian.net',
            blacklistDomains: '*/wiki/*',
            descriptionTemplate: 'Enter the description template'
        },
        status: {
            insertChromeUrl: '⚠️ Cannot run on chrome:// pages. Please switch to a JIRA tab and try again.',
            insertFailed: 'Failed to insert template',
            saveMissingDomain: '⚠️ Please enter at least one JIRA domain',
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

const DEFAULTS = {
    JIRA_DOMAINS: [
        '*.atlassian.net',
        '*.jira.com',
        '*/jira/*'
    ],
    BLACKLIST_DOMAINS: [
        '*/wiki/*'
    ],
    LANGUAGE: DEFAULT_LANGUAGE,
    DESCRIPTION_TEMPLATE: DEFAULT_TEMPLATES[DEFAULT_LANGUAGE]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULTS,
        DEFAULT_TEMPLATES,
        DEFAULT_LANGUAGE,
        SUPPORTED_LANGUAGES,
        LANGUAGE_LABELS,
        I18N
    };
}