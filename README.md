# JIRA Bug Report Formatter

Effortlessly produce structured JIRA bug reports with a single click. This Chrome extension injects a customizable HTML template directly into the ticket description so teams can capture consistent details without repetitive copy-and-paste work.

> Looking for the Traditional Chinese guide? See [README.zh-TW.md](README.zh-TW.md).

## Demo

- [Product walkthrough video](https://github.com/user-attachments/assets/68f6e35e-d6c6-4567-bbcd-c9add8f2741d)

## Features

- **One-click template injection** – Populate the JIRA description field with a curated bug report template right from the side panel.
- **Fully customizable content** – Edit the HTML template in the extension settings to match your team’s workflow and formatting rules.
- **Domain whitelisting / blacklisting** – Control exactly which JIRA domains should load the side panel and which URLs should be ignored.
- **Localized UI** – All prompts and status messages are available in Traditional Chinese to reduce friction for multilingual teams.
- **Minimal permissions** – Uses only `storage`, `tabs`, and `scripting`, keeping all data processing inside the browser.

## Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-account/jira-bug-report-formatter.git
   ```
2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the project root directory.
5. The “JIRA Bug Report Formatter” icon will appear in your toolbar.

## Usage

1. Navigate to any JIRA ticket creation or edit page.
2. Open the extension side panel from the Chrome toolbar.
3. In the **Quick Apply** tab, click **“✨ Apply Bug Report Template”**.
4. The description field will be populated with the configured HTML snippet; adjust any details and save the ticket.

## Configuration

Switch to the **Settings** tab in the side panel to customize behaviour:

- **JIRA Domains** – Whitelist domains where the side panel should appear (one per line). Defaults include `*.atlassian.net`, `*.jira.com`, and `*/jira/*`.
- **Blocked Domains** – Exclude pages that should never receive the template, e.g. `*/wiki/*` for Confluence URLs.
- **Description Template** – Edit the HTML content directly; new changes take effect the next time the template is applied. Include spacing or extra sections as needed.

All settings are stored in Chrome Sync Storage so they remain consistent across devices signed into the same account.

## Troubleshooting

- **“⚠️ Unable to use on chrome:// pages”** – Chrome prevents extensions from injecting scripts on internal pages. Switch to a regular JIRA tab and try again.
- **Template does not appear** – Ensure the description field is empty, the current URL is not blocked, and the page has finished loading.
- **Need a different language** – Customize the HTML template with content in your preferred language before applying it.

## Development Notes

- Core files:
  - `sidepanel.html` / `sidepanel.js` – Side panel UI and logic
  - `content.js` – Template injection inside the JIRA page
  - `constants.js` – Default domains and template values
- After making changes, reload the extension from `chrome://extensions/` to see updates.
- Optional: run linting checks (`read_lints`) to keep the codebase tidy.

## License

Released under the MIT License. See [`LICENSE`](LICENSE) for details.
