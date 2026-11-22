/**
 * Decides whether the template may be applied on a page.
 * The extension works on any http(s) page except Confluence, which shares
 * the `*.atlassian.net` host with JIRA Cloud and uses the same editor.
 */

export type UrlAccess = 'allowed' | 'confluence' | 'restricted';

const SCRIPTABLE_PROTOCOLS = new Set(['http:', 'https:']);
const CONFLUENCE_PATH = /(^|\/)wiki(\/|$)/i;

function parseUrl(href: string | undefined): URL | null {
  if (!href) {
    return null;
  }
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

export function checkUrlAccess(href: string | undefined): UrlAccess {
  const url = parseUrl(href);
  if (!url || !SCRIPTABLE_PROTOCOLS.has(url.protocol)) {
    return 'restricted';
  }
  return CONFLUENCE_PATH.test(url.pathname) ? 'confluence' : 'allowed';
}
