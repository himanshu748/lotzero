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
for (const file of ['config/judge-agent-prompt.md', 'CHANGELOG.md', 'RELEASE_CHECK.md', 'IMPACT.md', 'DEVPOST_UPDATE.md', 'VIDEO_SHOTLIST.md', 'SUBMISSION_RECHECK.md', 'docs/JUDGED_RELEASE_DIFF.md', 'docs/JUDGED_RELEASE_API_CONTRACTS.md', 'docs/JUDGED_RELEASE_VERIFICATION.md']) if (fs.existsSync(path.join(appRoot, file))) add(path.join(appRoot, file), 'lotzero/' + file);
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
const introduction = `# LotZero\n\nRehearse the recall. Find the gaps before they matter.\n\nA Forge/Jira recall-rehearsal app for food-manufacturing quality teams. Follow ingredient-to-shipment records, inspect PASS/FAIL/UNKNOWN findings, rehearse hypothetical controls, and save evidence before reviewing Jira follow-up. This is synthetic rehearsal software, not a product-safety or operational-recall service.\n\n## Local quickstart\n\nUse Node 22.23.4 and npm. From this directory:\n\n\`\`\`sh\nnpm ci\nnpm run dev\n\`\`\`\n\nOpen http://127.0.0.1:4173 and choose **Run sample rehearsal**. The fixed ING-A19 scenario gives three product lots, four shipments, nine gaps and twelve unresolved records. SHIP-002 has no destination. Browser data stays in localStorage; real Jira creation is disabled.\n\n## Checks and builds\n\n\`\`\`sh\nnpm run typecheck\nnpm test\nnpm run build\nnpm run build:web\n\`\`\`\n\nThe sibling lotzero-site directory contains landing source; build:web writes its app subdirectory. npm run test:e2e exercises the local browser journey and requires the repository's Playwright Chromium installation. These local checks do not establish a live Jira install.\n\n## Forge and credentials\n\nThe manifest retains the owner's existing ${privacy ? 'Marketplace identity and adds a development privacy trigger' : judged ? 'judge identity, with only the project page and original read-only Rovo analyst registered' : 'judge identity'}. Do not register a replacement, deploy, install, commit or push without the applicable owner approval. No credentials or local edition configuration are exported. The Forge CLI script uses the project-local Node binary. Read docs/PRIVACY_REPORTING.md before selecting the privacy candidate. Its worker is off by default, development-only and not production verified.\n\n## Limits and source rights\n\nImports use the typed JSON or record_type,json CSV fixture schema. See fixtures/README.md. Missing evidence stays unknown and simulations change no shipment. Rovo needs an enabled Jira tenant. Account-linked metadata has a development privacy candidate; imported free text still needs a reviewed request process. See docs/DEPENDENCY_REVIEW_2026-11-06.md for unresolved dependency advisories. No clean security audit, Marketplace approval, operational customer validation or compliance certification is claimed. No source license has been selected or granted by this export. Deployment evidence, video masters and portal/account records remain in the owner's original workspace.\n`;
files.set('lotzero/README.md', Buffer.from(introduction));
if (judged) files.set('lotzero/README.md', Buffer.concat([files.get('lotzero/README.md'), Buffer.from('\n## Judge release review\n\nThis is an unreleased local candidate. Read [RELEASE_CHECK.md](RELEASE_CHECK.md), [CHANGELOG.md](CHANGELOG.md) and [the verification handoff](docs/JUDGED_RELEASE_VERIFICATION.md) before any deployment. MCP and Marketplace-only modules are not registered. No hosting, sharing or submission change is performed by this export.\n')]));
files.set('README.md', Buffer.from('# LotZero source candidate\n\nLocal preparation for an owner-controlled private repository. No Git repository, commit, push or publication was performed.\n\n- [App quickstart](lotzero/README.md)\n- [Privacy development candidate](lotzero/docs/PRIVACY_REPORTING.md)\n- Landing source: lotzero-site/\n\nThe source-export.json file lists exact copied/generated files and hashes. It is a content receipt, not a Git commit. Use the app quickstart and keep credentials outside source.\n'));
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
