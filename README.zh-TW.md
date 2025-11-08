# JIRA Bug Report Formatter

JIRA Bug Report Formatter 是一款 Chrome 擴充功能，協助團隊以一致且結構化的方式撰寫 JIRA 錯誤回報。透過側邊欄快速套用 HTML 模板，能大幅縮短票單整理時間，並降低資訊遺漏的風險。

> 想閱讀英文版說明？請參考 [README.md](README.md)。

## 示範影片

- [產品導覽影片](https://github.com/user-attachments/assets/68f6e35e-d6c6-4567-bbcd-c9add8f2741d)

## 功能亮點

- **一鍵套用模板**：在 JIRA 票單頁面點擊「套用 Bug Report 模板」，立即填入客製化的 HTML 段落與提示文字。
- **可自訂描述內容**：直接於擴充功能設定頁更新模板，支援 HTML 格式與自定義段落間距。
- **網域管控**：透過允許與封鎖網域清單，決定在哪些 JIRA 網址顯示側邊欄並啟用功能。
- **多語系介面**：側邊欄與提示訊息皆為繁體中文，降低跨國團隊的溝通成本。
- **權限最小化**：僅使用 `storage`、`tabs` 與 `scripting` 權限，確保資料只在瀏覽器端處理。

## 安裝方式

1. 下載或 clone 此儲存庫：
   ```bash
   git clone https://github.com/your-account/jira-bug-report-formatter.git
   ```
2. 在 Chrome 中開啟 `chrome://extensions/`。
3. 開啟右上角的 **Developer mode**。
4. 點擊 **Load unpacked**，選擇專案根目錄。
5. 成功載入後，工具列會出現「JIRA Bug Report Formatter」圖示。

## 基本使用流程

1. 進入任一 JIRA 票單建立或編輯頁面。
2. 從 Chrome 工具列開啟擴充功能側邊欄。
3. 於「快速套用」頁籤點擊 **「✨ 套用 Bug Report 模板」**。
4. 描述欄位將自動填入預先設定的 HTML 模板，可視需求微調內容後送出。

## 設定說明

切換至側邊欄的「設定」頁籤可進行以下調整：

- **JIRA 網域**：指定允許顯示側邊欄的網域（每行一個），預設為 `*.atlassian.net`、`*.jira.com` 與 `*/jira/*`。
- **封鎖網域**：排除不需要啟用的頁面，例如 `*/wiki/*` 等 Confluence 相關網址。
- **描述模板**：直接編輯 HTML 內容，即可在下一次套用時生效；建議保留段落與空白行以維持可讀性。

儲存後設定會同步至 Chrome Sync Storage，跨裝置也能維持一致。

## 常見問題

- **看到「⚠️ 無法在 chrome:// 分頁中使用」提示**：Chrome 內建分頁不允許注入內容腳本，請在一般的 JIRA 網址上操作。
- **按下套用後沒有內容**：請確認當前票單的描述欄位為空、網域不在封鎖清單內，並重新載入頁面再試一次。
- **想切換為不同語系**：可直接在模板中加入目標語言的內容，或於儲存後再次套用。

## 開發指引

- 主要程式檔案
  - `sidepanel.html` / `sidepanel.js`：側邊欄 UI 與互動邏輯
  - `content.js`：在 JIRA 頁面內注入模板的腳本
  - `constants.js`：預設網域與模板內容
- 編輯完成後可於 `chrome://extensions/` 點擊 **Reload** 重新載入擴充功能。
- 建議使用 ESLint 或其他工具維持代碼品質（專案內含 `read_lints` 檢查流程）。

## 授權條款

本專案採用 MIT License，詳細內容請參閱 `LICENSE` 檔案。
