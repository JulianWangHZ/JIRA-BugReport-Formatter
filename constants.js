const DEFAULTS = {
    JIRA_DOMAINS: [
        '*.atlassian.net',
        '*.jira.com',
        '*/jira/*'
    ],
    BLACKLIST_DOMAINS: [
        '*/wiki/*'
    ],
    DESCRIPTION_TEMPLATE: `<p><strong>🧾【描述】</strong></p>
<p>請簡要說明這張工單的背景與目的。</p>
<p>&nbsp;</p>

<p><strong>⚠️【當前問題】</strong></p>
<p>描述目前遇到的問題或異常行為。</p>
<p>&nbsp;</p>

<p><strong>📎【附件檔案】</strong></p>
<p>若有相關截圖、錄影或檔案，請在此列出。</p>
<p>&nbsp;</p>

<p><strong>🥇【前置條件】</strong></p>
<p>列出重現問題前必須滿足的條件或設定。</p>
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
<p>補充任何對處理此問題有幫助的觀察或備註。</p>`
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULTS
    };
}