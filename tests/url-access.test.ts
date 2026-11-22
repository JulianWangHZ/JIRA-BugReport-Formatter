import { describe, expect, it } from 'vitest';
import { checkUrlAccess } from '../src/shared/url-access.js';

describe('checkUrlAccess', () => {
  it.each([
    'https://acme.atlassian.net/browse/A-1',
    'https://acme.atlassian.net/jira/software/projects/A/boards/1',
    'https://jira.acme.com:8080/secure/CreateIssue.jspa',
    'http://intra.acme.com/jira/browse/A-1',
    'https://acme.atlassian.net/browse/WIKI-12',
    'https://acme.atlassian.net/jira/wikipedia'
  ])('allows %s', href => {
    expect(checkUrlAccess(href)).toBe('allowed');
  });

  it.each([
    'https://acme.atlassian.net/wiki/spaces/X/pages/1',
    'https://acme.atlassian.net/wiki',
    'https://confluence.acme.com/WIKI/display/X'
  ])('rejects Confluence page %s', href => {
    expect(checkUrlAccess(href)).toBe('confluence');
  });

  it.each(['chrome://extensions/', 'about:blank', 'file:///tmp/a.html', 'not a url', '', undefined])(
    'treats %s as restricted',
    href => {
      expect(checkUrlAccess(href)).toBe('restricted');
    }
  );
});
