import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_FILL_OPTIONS,
  fillDescription,
  type FillDescriptionOptions
} from '../src/page/fill-description.js';

const TEMPLATE = '<p><strong>Title</strong></p>';

function fill(options: FillDescriptionOptions = DEFAULT_FILL_OPTIONS): ReturnType<typeof fillDescription> {
  return fillDescription(TEMPLATE, options);
}

/** Mimics JIRA: clicking the preview swaps it for an editor, optionally after a delay. */
function mountCollapsedDescription(markup: string, clickTarget: string, delayMs = 0): void {
  document.body.innerHTML = markup;
  document.querySelector(clickTarget)!.addEventListener('click', () => {
    const mountEditor = () => {
      document.body.innerHTML =
        '<div data-testid="issue.views.field.rich-text.description"><div contenteditable="true"></div></div>';
    };
    if (delayMs === 0) {
      mountEditor();
    } else {
      setTimeout(mountEditor, delayMs);
    }
  });
}

describe('fillDescription', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('when the editor is already open', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('writes the raw template into a textarea and fires input and change', async () => {
      document.body.innerHTML = '<textarea name="description"></textarea>';
      const textarea = document.querySelector('textarea')!;
      const events: string[] = [];
      textarea.addEventListener('input', () => events.push('input'));
      textarea.addEventListener('change', () => events.push('change'));

      expect(await fill()).toEqual({ ok: true });
      expect(textarea.value).toBe(TEMPLATE);
      expect(events).toEqual(['input', 'change']);
    });

    it('writes HTML into a rich editor, then blurs it', async () => {
      document.body.innerHTML = '<div contenteditable="true" aria-label="Description"></div><input id="other">';
      const editor = document.querySelector<HTMLElement>('[contenteditable]')!;
      const blur = vi.spyOn(editor, 'blur');

      expect(await fill()).toEqual({ ok: true });
      expect(editor.innerHTML).toBe(TEMPLATE);
      expect(document.activeElement).toBe(editor);
      expect(blur).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(blur).toHaveBeenCalledOnce();
    });

    it('accepts contenteditable with an empty value', async () => {
      document.body.innerHTML = '<div data-field-id="description"><div contenteditable=""></div></div>';
      expect(await fill()).toEqual({ ok: true });
      expect(document.querySelector('[contenteditable]')!.innerHTML).toBe(TEMPLATE);
    });

    it('looks inside a wrapper that matches a selector', async () => {
      document.body.innerHTML =
        '<div data-testid="issue.views.field.rich-text.description"><div><p contenteditable="true"></p></div></div>';
      expect(await fill()).toEqual({ ok: true });
      expect(document.querySelector('p[contenteditable]')!.innerHTML).toBe(TEMPLATE);
    });

    it('skips a wrapper without an editor and tries later selectors', async () => {
      document.body.innerHTML = `
        <div data-field-name="description"><span>read only</span></div>
        <div class="ak-editor-content-area"><textarea></textarea></div>`;
      expect(await fill()).toEqual({ ok: true });
      expect(document.querySelector('textarea')!.value).toBe(TEMPLATE);
      expect(document.querySelector('span')!.textContent).toBe('read only');
    });

    it('does not click anything when the editor is open', async () => {
      document.body.innerHTML = '<textarea name="description"></textarea><div id="description-val"></div>';
      const click = vi.fn();
      document.getElementById('description-val')!.addEventListener('click', click);
      await fill();
      expect(click).not.toHaveBeenCalled();
    });
  });

  describe('when the description is still a preview', () => {
    it('clicks the Jira Cloud preview and fills the editor it mounts', async () => {
      mountCollapsedDescription(
        '<div data-testid="issue.views.field.rich-text.description"><div role="button">Add a description…</div></div>',
        '[role="button"]'
      );
      expect(await fill()).toEqual({ ok: true });
      expect(document.querySelector('[contenteditable]')!.innerHTML).toBe(TEMPLATE);
    });

    it('waits for an editor that mounts after a delay', async () => {
      mountCollapsedDescription('<div id="description-val">Click to add description</div>', '#description-val', 50);
      expect(await fill()).toEqual({ ok: true });
      expect(document.querySelector('[contenteditable]')!.innerHTML).toBe(TEMPLATE);
    });

    it('sends mousedown, mouseup and click', async () => {
      document.body.innerHTML = '<div id="description-val"></div>';
      const events: string[] = [];
      const preview = document.getElementById('description-val')!;
      ['mousedown', 'mouseup', 'click'].forEach(type => preview.addEventListener(type, () => events.push(type)));
      await fill({ ...DEFAULT_FILL_OPTIONS, timeoutMs: 10 });
      expect(events).toEqual(['mousedown', 'mouseup', 'click']);
    });

    it('clicks a preview that is itself a button', async () => {
      mountCollapsedDescription('<button data-field-id="description">Add</button>', 'button');
      expect(await fill()).toEqual({ ok: true });
    });

    it('gives up after the timeout when no editor appears', async () => {
      vi.useFakeTimers();
      document.body.innerHTML = '<div id="description-val">read only</div>';
      const result = fill();
      await vi.advanceTimersByTimeAsync(DEFAULT_FILL_OPTIONS.timeoutMs);
      expect(await result).toEqual({ ok: false, reason: 'field-not-found' });
    });
  });

  it('reports field-not-found when the page has no description at all', async () => {
    document.body.innerHTML = '<textarea name="summary"></textarea>';
    expect(await fill()).toEqual({ ok: false, reason: 'field-not-found' });
  });

  it('ignores contenteditable="false"', async () => {
    document.body.innerHTML = '<div contenteditable="false" aria-label="Description"></div>';
    expect(await fill()).toEqual({ ok: false, reason: 'field-not-found' });
  });

  it('stays self-contained so Chrome can serialise it', async () => {
    // executeScript sends only the function source; outer references would be undefined in the page.
    const rebuilt = new Function(`return (${fillDescription.toString()})`)() as typeof fillDescription;
    document.body.innerHTML = '<textarea id="description"></textarea>';
    expect(await rebuilt(TEMPLATE, DEFAULT_FILL_OPTIONS)).toEqual({ ok: true });

    mountCollapsedDescription('<div id="description-val"></div>', '#description-val');
    expect(await rebuilt(TEMPLATE, DEFAULT_FILL_OPTIONS)).toEqual({ ok: true });
  });
});
