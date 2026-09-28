#!/usr/bin/env node
// Decides the next extension version from Conventional Commits since the last
// v* tag and writes it into manifest.json.
//   feat!: / BREAKING CHANGE -> major
//   feat:                    -> minor
//   anything else            -> patch
// Usage: node bump-version.mjs [--dry-run]
// Writes `version=` and `bump=` to $GITHUB_OUTPUT when available.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const MANIFEST = 'manifest.json';
const dryRun = process.argv.includes('--dry-run');

const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

function lastTag() {
  try {
    return git('describe --tags --abbrev=0 --match "v[0-9]*"');
  } catch {
    return null;
  }
}

function commitMessages(sinceTag) {
  const range = sinceTag ? `${sinceTag}..HEAD` : 'HEAD';
  const raw = git(`log ${range} --format=%B%x00`);
  return raw.split('\0').map((m) => m.trim()).filter(Boolean);
}

export function detectBump(messages) {
  const breaking = messages.some((m) =>
    /^[a-z]+(\([^)]*\))?!:/i.test(m) || /^BREAKING[ -]CHANGE:/m.test(m));
  if (breaking) return 'major';
  if (messages.some((m) => /^feat(\([^)]*\))?:/im.test(m))) return 'minor';
  return 'patch';
}

export function bumpVersion(version, bump) {
  const parts = version.split('.').map(Number);
  if (parts.length < 1 || parts.length > 4 || parts.some((n) => !Number.isInteger(n) || n < 0)) {
    throw new Error(`Invalid manifest version: "${version}"`);
  }
  const [major = 0, minor = 0, patch = 0] = parts;
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function main() {
  const source = readFileSync(MANIFEST, 'utf8');
  const current = JSON.parse(source).version;
  const tag = lastTag();
  const bump = detectBump(commitMessages(tag));
  const next = bumpVersion(current, bump);

  if (!dryRun) {
    // Replace in place to keep the file's formatting intact
    const updated = source.replace(/("version"\s*:\s*")[^"]+(")/, `$1${next}$2`);
    if (updated === source) throw new Error('Could not find "version" in manifest.json');
    writeFileSync(MANIFEST, updated);
  }

  console.log(`last tag: ${tag ?? '(none)'} | ${current} -> ${next} (${bump})${dryRun ? ' [dry run]' : ''}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `version=${next}\nbump=${bump}\n`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
