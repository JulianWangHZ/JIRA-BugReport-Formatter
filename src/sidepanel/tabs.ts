/** Wires tab buttons (`data-tab="name"`) to panels (`id="name-tab"`). */
export function bindTabs(buttons: readonly HTMLButtonElement[], panels: readonly HTMLElement[]): void {
  const select = (tabName: string): void => {
    buttons.forEach(button => button.classList.toggle('active', button.dataset.tab === tabName));
    panels.forEach(panel => panel.classList.toggle('active', panel.id === `${tabName}-tab`));
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => select(button.dataset.tab ?? ''));
  });
}
