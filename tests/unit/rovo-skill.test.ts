import {describe, expect, it} from 'vitest';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {parse} from 'yaml';

const manifest = parse(readFileSync('manifest.yml', 'utf8'));

describe('reusable recall evidence skill', () => {
  it.each(manifest.modules['rovo:skill'] as {key: string; source: {dir: string}; dependencies: {tools: string[]}}[])('$key meets the Forge SKILL.md rules', skill => {
    const file = join(skill.source.dir, 'SKILL.md');
    expect(existsSync(file)).toBe(true);
    const [, front, body] = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
    const meta = parse(front);
    expect(meta.name).toBe(skill.source.dir.split('/').pop());
    expect(meta.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(meta.name.length).toBeLessThanOrEqual(64);
    expect(meta.description.length).toBeGreaterThanOrEqual(50);
    expect(meta.description.length).toBeLessThanOrEqual(1024);
    expect(meta.compatibility.length).toBeLessThanOrEqual(500);
    expect(meta['allowed-tools'].split(' ')).toEqual(expect.arrayContaining(skill.dependencies.tools));
    expect(body.split('\n').length).toBeLessThanOrEqual(500);
    const actions = manifest.modules.action.map((a: {key: string}) => a.key);
    for (const tool of skill.dependencies.tools) {
      expect(actions).toContain(tool);
      expect(body).toContain(`\`${tool}\``);
      expect(manifest.modules.action.find((a: {key: string}) => a.key === tool).actionVerb).toBe('GET');
    }
  });

  it('keeps the skill read-only and honest about recall evidence', () => {
    const body = readFileSync('skills/lotzero-recall-evidence/SKILL.md', 'utf8');
    for (const rule of ['no write action', 'never means PASS or safe', 'not proof of contamination', 'Historical shipments stay in the impact', 'Timing not measured'])
      expect(body).toContain(rule);
  });
});
