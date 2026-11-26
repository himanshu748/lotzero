import {afterEach, describe, expect, it} from 'vitest';
import {mkdtempSync, mkdirSync, copyFileSync, cpSync, readFileSync, writeFileSync, existsSync, rmSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import YAML from 'yaml';

const temporary: string[] = [];
afterEach(() => {for (const dir of temporary.splice(0)) rmSync(dir, {recursive: true, force: true});});
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'lotzero-source-export-test-')); temporary.push(directory);
  const root = join(directory, 'lotzero'); mkdirSync(root);
  const originals = resolve('.');
  for (const name of ['src', 'fixtures', 'static/lotzero-ui/src', 'static/lotzero-ui/public', 'tests', 'skills']) cpSync(join(originals, name), join(root, name), {recursive: true});
  for (const name of ['package.json', 'package-lock.json', 'manifest.yml', 'tsconfig.json', 'vite.config.ts', 'vitest.config.ts', 'playwright.config.ts', 'playwright.first-gap.config.ts', 'playwright.design.config.ts', 'playwright.landing.config.ts', 'playwright.rovo.config.ts', 'playwright.trace.config.ts', 'static/lotzero-ui/index.html', 'scripts/edition.mjs', 'scripts/benchmark.ts', 'scripts/prepare-source.mjs', 'config/editions.example.json', 'docs/PRIVACY_REPORTING.md', 'docs/DEPENDENCY_REVIEW_2026-11-06.md']) {
    const dest = join(root, name); mkdirSync(resolve(dest, '..'), {recursive: true}); copyFileSync(join(originals, name), dest);
  }
  copyFileSync(join(originals, 'config/judge-agent-prompt.md'), join(root, 'config/judge-agent-prompt.md'));
  // This fixture always starts as the base judge edition, even when the suite runs in a privacy export.
  const manifestFile = join(root, 'manifest.yml');
  const manifest = YAML.parse(readFileSync(manifestFile, 'utf8'));
  manifest.app.id = 'ari:cloud:ecosystem::app/f2443992-e1df-4ee4-b6ee-50abce811c9b';
  delete manifest.modules.scheduledTrigger;
  manifest.modules.function = manifest.modules.function.filter((item: {key: string}) => item.key !== 'privacy-cycle');
  manifest.permissions.scopes = manifest.permissions.scopes.filter((scope: string) => scope !== 'report:personal-data');
  writeFileSync(manifestFile, YAML.stringify(manifest));
  symlinkSync(join(originals, 'node_modules'), join(root, 'node_modules'), 'dir');
  mkdirSync(join(directory, 'lotzero-site'));
  for (const name of ['index.html', 'styles.css', 'landing.css', 'app.js', 'favicon.svg', 'support.html', 'rovo-preview.png']) writeFileSync(join(directory, 'lotzero-site', name), name.endsWith('.png') ? Buffer.from([137, 80, 78, 71]) : 'Synthetic export fixture');
  writeFileSync(join(root, '.env'), 'EXAMPLE_NOT_A_CREDENTIAL=must-not-copy');
  writeFileSync(join(root, 'config/editions.local.json'), '{"privateConfiguration":"must-not-copy"}');
  mkdirSync(join(root, 'evidence')); writeFileSync(join(root, 'evidence/private.json'), '{"privateEvidence":"must-not-copy"}');
  const run = (...args: string[]) => spawnSync(process.execPath, [join(root, 'scripts/prepare-source.mjs'), ...args], {encoding: 'utf8'});
  return {directory, root, run};
}

describe('curated source export boundary', () => {
  it('copies runnable source and records exact hashes without local configuration, evidence or Git metadata', () => {
    const f = fixture(); const dest = join(f.directory, 'candidate');
    expect(f.run('--output', dest, '--include-site').status).toBe(0);
    const receipt = JSON.parse(readFileSync(join(dest, 'source-export.json'), 'utf8'));
    expect(receipt.gitCreated).toBe(false); expect(receipt.pushed).toBe(false);
    const names = receipt.files.map((row: {path: string}) => row.path);
    expect(names).toContain('lotzero/src/privacy.ts'); expect(names).toContain('lotzero/playwright.first-gap.config.ts');
    expect(readFileSync(join(dest,'lotzero/README.md'),'utf8')).toContain('Run Northstar sample (synthetic)'); expect(names).toContain('lotzero-site/index.html');
    expect(names.some((name: string) => /(?:^|\/)(?:\.env|evidence|node_modules|\.git)(?:\.|\/|$)|\.local\.json$/.test(name))).toBe(false);
    for (const row of receipt.files) expect(createHash('sha256').update(readFileSync(join(dest, row.path))).digest('hex')).toBe(row.sha256);
    expect(existsSync(join(dest, '.git'))).toBe(false);
    expect(YAML.parse(readFileSync(join(dest, 'lotzero/manifest.yml'), 'utf8')).modules.scheduledTrigger).toBeUndefined();
  });
  it('adds reporting access only to an explicitly requested isolated Marketplace development candidate', () => {
    const f = fixture(); const dest = join(f.directory, 'privacy'); const before = readFileSync(join(f.root, 'manifest.yml'), 'utf8');
    expect(f.run('--output', dest, '--privacy-development').status).toBe(0);
    const manifest = YAML.parse(readFileSync(join(dest, 'lotzero/manifest.yml'), 'utf8'));
    expect(manifest.app.id).toBe('ari:cloud:ecosystem::app/38723408-eeba-4e64-8a81-903027d16f7c');
    expect(manifest.permissions.scopes).toEqual(['read:jira-work', 'write:jira-work', 'storage:app', 'report:personal-data']);
    expect(manifest.modules.scheduledTrigger).toEqual([{key: 'lotzero-privacy-development', function: 'privacy-cycle', interval: 'hour'}]);
    expect(readFileSync(join(f.root, 'manifest.yml'), 'utf8')).toBe(before);
  });
  it('rejects an existing destination and destinations inside protected source', () => {
    const f = fixture(); const before = readFileSync(join(f.root, 'manifest.yml'), 'utf8');
    expect(f.run('--output', f.root).status).not.toBe(0);
    expect(f.run('--output', join(f.root, 'new-copy')).status).not.toBe(0);
    symlinkSync(f.root, join(f.directory, 'source-alias'), 'dir');
    expect(f.run('--output', join(f.directory, 'source-alias', 'new-copy')).status).not.toBe(0);
    expect(readFileSync(join(f.root, 'manifest.yml'), 'utf8')).toBe(before);
  });
  it('stops on a credential pattern before creating any export and never prints the matched value', () => {
    const f = fixture(); const dest = join(f.directory, 'candidate');
    const credential = 'ATATT' + 'x'.repeat(40);
    writeFileSync(join(f.root, 'src/unsafe.ts'), `export const example = '${credential}';`);
    const result = f.run('--output', dest);
    expect(result.status).not.toBe(0); expect(existsSync(dest)).toBe(false);
    expect((result.stdout + result.stderr).includes(credential)).toBe(false);
    expect(result.stderr.includes('credential') || result.stderr.includes('token')).toBe(true);
  });
  it('rejects symlinked source instead of following it outside the selected tree', () => {
    const f = fixture(); const dest = join(f.directory, 'candidate');
    writeFileSync(join(f.directory, 'private.ts'), 'export const privateValue = true;');
    symlinkSync(join(f.directory, 'private.ts'), join(f.root, 'src/unsafe.ts'));
    expect(f.run('--output', dest).status).not.toBe(0); expect(existsSync(dest)).toBe(false);
  });
});

it('exports an isolated judge release without optional MCP or Marketplace modules', () => {
  const f = fixture(); const dest = join(f.directory, 'judge');
  const original = readFileSync(join(f.root, 'manifest.yml'), 'utf8');
  expect(f.run('--output', dest, '--judge-release').status).toBe(0);
  const manifest = YAML.parse(readFileSync(join(dest, 'lotzero/manifest.yml'), 'utf8'));
  expect(Object.keys(manifest.modules).sort()).toEqual(['action', 'function', 'jira:projectPage', 'rovo:agent', 'rovo:skill']);
  expect(manifest.modules['rovo:skill'][0].dependencies.tools).toEqual(['lotzero-read-saved-rehearsal']);
  expect(existsSync(join(dest, 'lotzero/skills/lotzero-recall-evidence/SKILL.md'))).toBe(true);
  expect(manifest.modules.action.map((a: {key: string}) => a.key)).toEqual(['lotzero-read-saved-rehearsal']);
  expect(manifest.modules.action[0].actionVerb).toBe('GET');
  expect(manifest.modules.function.map((f: {handler: string}) => f.handler)).toEqual(['index.handler', 'rovo.handler']);
  expect(manifest.permissions.scopes).toEqual(['read:jira-work', 'write:jira-work', 'storage:app']);
  expect(manifest.modules['rovo:agent'][0].prompt).toContain('Timing not measured');
  expect(readFileSync(join(f.root, 'manifest.yml'), 'utf8')).toBe(original);
  expect(f.run('--output', join(f.directory, 'both'), '--judge-release', '--privacy-development').status).not.toBe(0);
});

it.each(['handler', 'scope', 'egress', 'module', 'skill'])('rejects an unreviewed judge contract change: %s', change => {
  const f = fixture(); const dest = join(f.directory, 'judge');
  const file = join(f.root, 'manifest.yml'); const manifest = YAML.parse(readFileSync(file, 'utf8'));
  if (change === 'handler') manifest.modules.function.find((f: {key: string}) => f.key === 'recall-analyst').handler = 'index.handler';
  if (change === 'scope') manifest.permissions.scopes.push('manage:jira-configuration');
  if (change === 'egress') manifest.permissions.external = {fetch: {backend: ['https://example.invalid']}};
  if (change === 'module') manifest.modules.webtrigger = [{key: 'unexpected'}];
  if (change === 'skill') manifest.modules['rovo:skill'][0].dependencies.tools.push('lotzero-mcp-read-rehearsal');
  writeFileSync(file, YAML.stringify(manifest));
  expect(f.run('--output', dest, '--judge-release').status).not.toBe(0);
  expect(existsSync(dest)).toBe(false);
});

it.each(['missing', 'blank'])('rejects a judge release with a %s skill file', state => {
  const f = fixture(); const dest = join(f.directory, 'judge');
  const skill = join(f.root, 'skills/lotzero-recall-evidence/SKILL.md');
  if (state === 'missing') rmSync(skill);
  else writeFileSync(skill, '   \n');
  const result = f.run('--output', dest, '--judge-release');
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('Judge export requires a non-empty LotZero Rovo SKILL.md.');
  expect(existsSync(dest)).toBe(false);
});

it('exports the judge app from a standalone checkout without a landing sibling', () => {
  const f = fixture(); const dest = join(f.directory, 'standalone');
  rmSync(join(f.directory, 'lotzero-site'), {recursive: true});
  expect(f.run('--output', dest, '--judge-release').status).toBe(0);
  expect(existsSync(join(dest, 'lotzero-site'))).toBe(false);
  expect(existsSync(join(dest, 'lotzero/manifest.yml'))).toBe(true);
});
