export const STATUS_VISIBLE_MS = 8000;

export interface StatusBanner {
  show(message: string, isError?: boolean): void;
}

/** Shows a message in `element`, then hides it after a delay. A new message restarts the delay. */
export function createStatusBanner(element: HTMLElement): StatusBanner {
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    show(message, isError = false) {
      clearTimeout(hideTimer);
      element.textContent = message;
      element.className = `status ${isError ? 'error' : 'success'}`;
      element.style.display = 'block';
      hideTimer = setTimeout(() => {
        element.style.display = 'none';
      }, STATUS_VISIBLE_MS);
    }
  };
}
