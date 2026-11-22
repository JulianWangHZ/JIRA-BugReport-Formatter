import { describe, expect, it } from 'vitest';
import { MESSAGES, translate } from '../src/shared/messages.js';

function keyPaths(node: object, prefix = ''): string[] {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null ? keyPaths(value, `${prefix}${key}.`) : [`${prefix}${key}`]
  );
}

describe('translate', () => {
  it('reads nested keys', () => {
    expect(translate('en', 'buttons.saveSettings')).toBe('Save Settings');
    expect(translate('zh-TW', 'buttons.saveSettings')).toBe('儲存設定');
  });

  it('returns the key when the string is missing', () => {
    expect(translate('en', 'buttons.nope')).toBe('buttons.nope');
    expect(translate('en', 'buttons')).toBe('buttons');
    expect(translate('en', 'appTitle.deeper')).toBe('appTitle.deeper');
  });
});

describe('MESSAGES', () => {
  it('has the same keys in every language', () => {
    expect(keyPaths(MESSAGES.en).sort()).toEqual(keyPaths(MESSAGES['zh-TW']).sort());
  });
});
