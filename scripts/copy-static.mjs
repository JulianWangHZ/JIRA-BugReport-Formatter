// Copies the non-TypeScript files Chrome needs into build/.
import { cpSync, mkdirSync } from 'node:fs';

const STATIC_FILES = [
  ['manifest.json', 'build/manifest.json'],
  ['src/sidepanel/side-panel.html', 'build/sidepanel/side-panel.html'],
  ['src/sidepanel/side-panel.css', 'build/sidepanel/side-panel.css'],
  ['icons', 'build/icons']
];

mkdirSync('build/sidepanel', { recursive: true });
for (const [from, to] of STATIC_FILES) {
  cpSync(from, to, { recursive: true });
}
