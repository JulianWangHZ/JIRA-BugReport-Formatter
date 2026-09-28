# JIRA Bug Report Formatter

JIRA Bug Report Formatter 是一款 Chrome 擴充功能，協助團隊以一致且結構化的方式撰寫 JIRA 錯誤回報。透過側邊欄一鍵套用 HTML 模板，大幅縮短票單整理時間，並降低資訊遺漏的風險。

相關連結 😊: [Bug-Report-Formatter](https://chromewebstore.google.com/detail/jira-bug-report-formatter/mjfnjjkioaaebpdfhfdedlbbhnoinnec?authuser=0&hl=en&pli=1)

> 想閱讀英文版說明？請參考 [README.md](README.md)。

![JIRA Bug Report Formatter — 一鍵產生乾淨的 bug report](store-assets/upload/screenshot-2-hero-zh.png)

## 功能亮點

- **一鍵套用模板**：在 JIRA 票單頁面點擊「套用 Bug Report 模板」，立即填入結構化段落與提示文字。
- **精簡的預設模板**：七個段落——當前問題、影響範圍、附件、重現測試步驟、預期結果、測試環境、額外資訊。
- **可自訂描述內容**：於「設定」直接編輯 HTML 模板；點一下「還原預設」即可恢復內建版本。
- **網域管控**：透過允許與封鎖網域清單，決定擴充功能在哪些網址生效。
- **中英雙語介面**：可切換繁體中文與英文，兩種語言各自保存一份模板。
- **權限最小化**：僅使用 `storage`、`sidePanel` 與 `scripting` 權限，資料只在瀏覽器端處理。

## 安裝方式

**從 Chrome 線上應用程式商店（建議）**：透過[商店頁面](https://chromewebstore.google.com/detail/jira-bug-report-formatter/mjfnjjkioaaebpdfhfdedlbbhnoinnec)安裝。

**從原始碼安裝：**

1. Clone 此儲存庫：
   ```bash
   git clone https://github.com/JulianWangHZ/JIRA-BugReport-Formatter.git
   ```
   或從最新的 [GitHub Release](https://github.com/JulianWangHZ/JIRA-BugReport-Formatter/releases/latest) 下載 zip 並解壓縮。
2. 在 Chrome 中開啟 `chrome://extensions/`。
3. 開啟右上角的 **Developer mode**。
4. 點擊 **Load unpacked**，選擇專案（或解壓縮後的）資料夾。
5. 載入成功後，工具列會出現「JIRA Bug Report Formatter」圖示。

## 基本使用流程

1. 進入任一 JIRA 票單建立或編輯頁面。
2. 從 Chrome 工具列開啟擴充功能側邊欄。
3. 於「快速套用」頁籤點擊「套用 Bug Report 模板」。
4. 描述欄位會自動填入模板，補上細節後建立票單即可。

## 設定說明

切換到側邊欄的「設定」頁籤：

- **JIRA 網域**：擴充功能生效的網域（每行一個）。預設為 `*.atlassian.net`、`*.jira.com`、`*/jira/*`。
- **封鎖網域**：永遠不套用模板的頁面，例如 Confluence 的 `*/wiki/*`。
- **描述模板**：直接編輯 HTML 後按「儲存設定」。點「還原預設」會立即將目前語言的模板恢復為內建版本。

所有設定都儲存在 Chrome Sync Storage，登入同一帳號的裝置會自動同步。

## 疑難排解

- **「⚠️ 無法在 chrome:// 分頁中使用」**：Chrome 禁止擴充功能在內部頁面執行，請切換到一般 JIRA 分頁再試。
- **模板沒有出現**：確認描述欄位為空、目前網址未被封鎖，且頁面已載入完成。
- **更新後仍看到舊模板**：之前儲存過的模板會優先於新的預設值，請到「設定」點「還原預設」。

## 開發說明

- 核心檔案：
  - `sidepanel.html` / `sidepanel.css` / `sidepanel.js`：側邊欄 UI 與邏輯
  - `content.js`：在 JIRA 頁面中插入模板
  - `constants.js`：預設網域、模板與介面文字
  - `icons/`：Logo（`logo.svg`）與工具列圖示
- 修改後到 `chrome://extensions/` 重新載入擴充功能即可看到效果。
- 商店素材：執行 `store-assets/build.sh`，會用系統 Chrome 重新產生所有 Chrome 商店圖片到 `store-assets/upload/`（截圖 1280×800、宣傳圖 440×280 與 1400×560、商店圖示 128×128）。

### 自動發版

透過 GitHub Actions 自動化：

- **開 PR**（`.github/workflows/pr-check.yml`）：驗證 `manifest.json`、檢查腳本語法，並在 job summary 預告下一個版本號。
- **Merge 進 `main`**（`.github/workflows/release.yml`）：自動更新 `manifest.json` 版本號、打上 `vX.Y.Z` tag，並發布附帶打包 zip 的 GitHub Release。

版本號依上一個 tag 之後的 [Conventional Commits](https://www.conventionalcommits.org/) 決定：

| Commit / PR 標題 | 升版 |
|---|---|
| `feat!: ...` 或含 `BREAKING CHANGE:` | major |
| `feat: ...` | minor |
| 其他（`fix:`、`refactor:` 等） | patch |

只改文件、`store-assets/` 或 `.github/` 不會觸發發版。上架 Chrome 線上應用程式商店仍需手動上傳 Release 附帶的 zip。

## 授權

以 MIT License 釋出，詳見 [`LICENSE`](LICENSE)。
