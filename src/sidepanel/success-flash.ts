export const SUCCESS_FLASH_MS = 3000;

export interface SuccessFlashOptions {
  /** Keep the button disabled while it shows the success state. */
  readonly lockWhileFlashing: boolean;
  /** Re-renders the button label; called on enter and exit of the success state. */
  readonly relabel: () => void;
}

/** Puts a button in its success state, then returns it to default. */
export function flashSuccess(button: HTMLButtonElement, options: SuccessFlashOptions): void {
  button.dataset.state = 'success';
  button.disabled = options.lockWhileFlashing;
  options.relabel();

  setTimeout(() => {
    button.dataset.state = 'default';
    button.disabled = false;
    options.relabel();
  }, SUCCESS_FLASH_MS);
}
