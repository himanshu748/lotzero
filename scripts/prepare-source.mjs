import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import YAML from 'yaml';

const appRoot = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const siteRoot = fs.realpathSync(path.resolve(appRoot, '../lotzero-site'));
const args = process.argv.slice(2);
const privacy = args.includes('--privacy-development');
const judged = args.includes('--judge-release');
const index = args.indexOf('--output');
if ((privacy && judged) || index < 0 || !args[index + 1] || args.some((arg, i) => !['--output', '--privacy-development', '--judge-release'].includes(arg) && i !== index + 1)) {
  throw new Error('Usage: node scripts/prepare-source.mjs --output NEW-DIRECTORY [--privacy-development | --judge-release]');
}
function physicalPath(input) {
  let parent = path.resolve(input);
  const tail = [];
  while (!fs.existsSync(parent)) {tail.unshift(path.basename(parent)); parent = path.dirname(parent);}
  return path.join(fs.realpathSync(parent), ...tail);
}
const destination = physicalPath(args[index + 1]);
if (fs.existsSync(destination) || destination === appRoot || destination.startsWith(appRoot + path.sep) || destination === siteRoot || destination.startsWith(siteRoot + path.sep)) {
  throw new Error('Choose a new directory outside the application and live-site source; nothing was overwritten.');
}
const files = new Map();
const extensions = new Set(['.ts', '.tsx', '.json', '.css', '.html', '.svg', '.csv', '.md']);
function add(source, target) {
  const stat = fs.lstatSync(source);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 2_000_000) throw new Error(`Unsupported export source: ${target}`);
  files.set(target, fs.readFileSync(source));
}
function tree(relative) {
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      if (entry.name.startsWith('.') || ['node_modules', 'evidence', 'demo', 'test-results'].includes(entry.name)) continue;
      const source = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symbolic links are not exported.');
      if (entry.isDirectory()) walk(source);
      else if (extensions.has(path.extname(entry.name))) add(source, 'lotzero/' + path.relative(appRoot, source).split(path.sep).join('/'));
    }
  };
  walk(path.join(appRoot, relative));
}
for (const directory of ['src', 'tests', 'fixtures', 'static/lotzero-ui/src', 'static/lotzero-ui/public']) tree(directory);
for (const file of ['package.json', 'package-lock.json', 'manifest.yml', 'tsconfig.json', 'vite.config.ts', 'vitest.config.ts', 'playwright.config.ts', 'playwright.design.config.ts', 'playwright.landing.config.ts', 'playwright.rovo.config.ts', 'playwright.trace.config.ts', 'static/lotzero-ui/index.html', 'scripts/edition.mjs', 'scripts/benchmark.ts', 'scripts/prepare-source.mjs', 'config/editions.example.json', 'docs/PRIVACY_REPORTING.md', 'docs/DEPENDENCY_REVIEW_2026-11-06.md']) add(path.join(appRoot, file), 'lotzero/' + file);
for (const directory of ['evals']) if (fs.existsSync(path.join(appRoot, directory))) tree(directory);
for (const file of ['playwright.first-gap.config.ts', 'PLAN.md', 'AGENTS.md', 'docs/FIRST_GAP_VERIFICATION.md', 'docs/FIRST_GAP_DEVELOPMENT_2026-11-15.md', 'docs/FIRST_GAP_DEVELOPMENT_2026-11-16.md', 'docs/DEVELOPMENT_IO_TRACE_2026-11-16.md', 'config/judge-agent-prompt.md', 'CHANGELOG.md', 'RELEASE_CHECK.md', 'IMPACT.md', 'DEVPOST_UPDATE.md', 'VIDEO_SHOTLIST.md', 'SUBMISSION_RECHECK.md', 'docs/JUDGED_RELEASE_DIFF.md', 'docs/JUDGED_RELEASE_API_CONTRACTS.md', 'docs/JUDGED_RELEASE_VERIFICATION.md']) if (fs.existsSync(path.join(appRoot, file))) add(path.join(appRoot, file), 'lotzero/' + file);
for (const file of ['index.html', 'styles.css', 'landing.css', 'app.js', 'favicon.svg', 'support.html', 'rovo-preview.png']) add(path.join(siteRoot, file), 'lotzero-site/' + file);
const manifest = YAML.parse(files.get('lotzero/manifest.yml').toString());
if (judged) {
  const original = manifest.modules;
  const knownModules = new Set(['jira:projectPage', 'rovo:agent', 'action', 'function', 'rovo:mcp', 'scheduledTrigger']);
  if (Object.keys(original).some(key => !knownModules.has(key))) throw new Error('Unknown module requires review before judge export.');
  const agent = original['rovo:agent'];
  const action = original.action?.find(item => item.key === 'lotzero-read-saved-rehearsal');
  const resolver = original.function?.find(item => item.key === 'resolver');
  const analyst = original.function?.find(item => item.key === 'recall-analyst');
  const pages = original['jira:projectPage'];
  if (agent?.length !== 1 || agent[0].key !== 'lotzero-recall-analyst' || JSON.stringify(agent[0].actions) !== JSON.stringify(['lotzero-read-saved-rehearsal']) || !pages?.length || !resolver || !analyst || !action || action.actionVerb !== 'GET' || action.function !== 'recall-analyst') throw new Error('Judge module contract changed; review before exporting.');
  if (resolver.handler !== 'index.handler' || analyst.handler !== 'rovo.handler') throw new Error('Judge handler contract changed; review before exporting.');
  const allowedScopes = new Set(['read:jira-work', 'write:jira-work', 'storage:app', 'report:personal-data']);
  if (manifest.remotes || manifest.providers || manifest.permissions.external || manifest.permissions.scopes.some(scope => !allowedScopes.has(scope))) throw new Error('Unexpected external integration or scope; review before judge export.');
  manifest.app.id = 'ari:cloud:ecosystem::app/f2443992-e1df-4ee4-b6ee-50abce811c9b';
  manifest.modules = {'jira:projectPage': pages, 'rovo:agent': agent, action: [action], function: [resolver, analyst]};
  manifest.modules['rovo:agent'][0].prompt = fs.readFileSync(path.join(appRoot, 'config/judge-agent-prompt.md'), 'utf8');
  manifest.permissions.scopes = ['read:jira-work', 'write:jira-work', 'storage:app'];
  files.set('lotzero/manifest.yml', Buffer.from(YAML.stringify(manifest)));
}
if (privacy) {
  manifest.app.id = 'ari:cloud:ecosystem::app/38723408-eeba-4e64-8a81-903027d16f7c';
  manifest.modules.scheduledTrigger = [...(manifest.modules.scheduledTrigger ?? []).filter(item => item.key !== 'lotzero-privacy-development'), {key: 'lotzero-privacy-development', function: 'privacy-cycle', interval: 'hour'}];
  manifest.modules.function = [...manifest.modules.function.filter(item => item.key !== 'privacy-cycle'), {key: 'privacy-cycle', handler: 'privacy.handler', timeoutSeconds: 120}];
  manifest.permissions.scopes = [...new Set([...manifest.permissions.scopes, 'report:personal-data'])];
  files.set('lotzero/manifest.yml', Buffer.from(YAML.stringify(manifest)));
}
const introduction = `# LotZero

Rehearse the recall. Find the gaps before they matter.

A Jira/Forge mock-recall desk for food-manufacturing quality managers. This local candidate uses four screens: Home, Rehearsal, Rehearse and Follow-up. It is not deployed by this export.

## Local quickstart

Use Node 22.23.4 and npm. From this directory:

\`\`\`sh
npm ci
npm run dev
\`\`\`

Open http://127.0.0.1:4173 and choose **Run Northstar sample (synthetic)** once. Rehearsal opens on shipment-destination FAIL / SHIP-002 and its selected path, ING-A19 → BATCH-101 → FG-101 → SHIP-002. Browser data stays in localStorage; Jira writes and Rovo execution are disabled. Synthetic data only.

Rehearse a WH-NORTH warehouse control explicitly; historical shipments remain in impact. Save and follow up to inspect prioritised proposals, the saved-evidence analyst fallback, comparison and exports. In Forge, Jira creation still requires permissions and exact-content approval. The original read-only Rovo agent explains only an identified saved revision.

## Checks

\`\`\`sh
npm run typecheck
npm test
npm run build
npx playwright test --config playwright.first-gap.config.ts
npm run forge -- lint
\`\`\`

The app suite uses a loopback browser transport and does not establish native Jira/model success. Read [first-gap verification](docs/FIRST_GAP_VERIFICATION.md). Run full authenticated Forge lint before a rollout; the verification documents record current outcomes. Dependency/privacy/native gates remain open. Do not use build:web against the original protected public-site source.

## Release boundary

This export selects the owner's existing ${privacy ? 'Marketplace development identity with a separate privacy trigger' : judged ? 'judge identity with only the Jira page and original read-only Rovo analyst/GET action' : 'working identity and declarations'}. Review the manifest and [RELEASE_CHECK.md](RELEASE_CHECK.md) before hosting. No registration, deploy, install, tunnel, sharing change, public edit or recording is performed. No credentials, local edition configuration, private evidence, media masters or dependencies are exported. The original source now has owner-approved local Git commits; this export contains no Git history and performs no push.

Imports use JSON or record_type,json CSV with existing limits; see fixtures/README.md. Missing evidence remains UNKNOWN. Neither a PASS nor a path establishes product safety; controls are hypothetical and timing is not measured. No customer validation, certification or extra bonus is claimed. Source licensing remains an owner decision. See docs/PRIVACY_REPORTING.md and docs/DEPENDENCY_REVIEW_2026-11-06.md for unresolved release concerns.
`;
files.set('lotzero/README.md', Buffer.from(introduction));
files.set('README.md', Buffer.from('# LotZero source candidate\n\nLocal export of the owner-controlled source. This directory contains no Git history; no push, hosting or public edit was performed by the exporter.\n\n- [App quickstart](lotzero/README.md)\n- [Owner release checks](lotzero/RELEASE_CHECK.md)\n- [Source verification](lotzero/docs/FIRST_GAP_VERIFICATION.md)\n\nsource-export.json lists exact files and hashes. Keep credentials outside source. The sibling landing source is a copy for reference; the original live-site source was not changed.\n'));
files.set('.gitignore', Buffer.from('**/node_modules/\n**/.env*\n!**/.env.example\n**/.forge/\n**/config/*.local.json\n**/evidence/\n**/demo/\n**/test-results/\n**/playwright-report/\n**/static/lotzero-ui/dist/\nlotzero-site/app/\nui-evidence/\n*.log\n'));
const patterns = [
  ['Atlassian API token', /ATATT[0-9A-Za-z_+=/\-]{20,}/],
  ['GitHub API token', /\b(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,})/],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['OpenAI API token', /\bsk-(?:proj-)?[A-Za-z0-9_\-]{25,}/],
  ['Deepgram assignment', /DEEPGRAM_API_KEY\s*[=:]\s*["']?[a-f0-9]{40}\b/i],
];
for (const [name, bytes] of files) {
  if (name.endsWith('.png')) continue; // Explicitly selected, already-public native illustration.
  for (const [kind, pattern] of patterns) if (pattern.test(bytes.toString('utf8'))) throw new Error(`Export stopped: ${kind} pattern in ${name}; no matched value is printed.`);
}
const rows = [...files].sort(([a], [b]) => a.localeCompare(b)).map(([name, bytes]) => ({path: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')}));
const receipt = {createdAt: new Date().toISOString(), privacyDevelopment: privacy, judgeRelease: judged, files: rows, scan: 'Explicit file list, known patterns only; no Git-history or unknown-format claim', omitted: ['credentials', 'config/*.local.json', 'private evidence', 'media masters', 'node_modules', 'compiled bundles'], gitCreated: false, pushed: false};
// All selection and scanning completes before the new destination is created.
fs.mkdirSync(destination, {recursive: true, mode: 0o700});
for (const [name, content] of files) {
  const target = path.join(destination, name);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content, {flag: 'wx', mode: 0o600});
}
fs.writeFileSync(path.join(destination, 'source-export.json'), JSON.stringify(receipt, null, 2) + '\n', {flag: 'wx', mode: 0o600});
console.log(JSON.stringify({destination, files: rows.length, privacyDevelopment: privacy, judgeRelease: judged, gitCreated: false, pushed: false}));
