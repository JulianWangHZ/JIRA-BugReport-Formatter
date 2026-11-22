import type { Language } from './languages.js';

export const DEFAULT_TEMPLATES: Readonly<Record<Language, string>> = {
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
